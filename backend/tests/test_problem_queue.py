"""SCRUM-118 (US-16): IIC's problem queue, review, assignment and closure."""

import itertools
from datetime import UTC, datetime, timedelta

import pytest

from app.audit.models import AuditLog
from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.extensions import db, mail
from app.mentors.models import PENDING, CapacityRequest, Mentor
from app.mentorships.models import Mentorship
from app.notifications.models import Notification
from app.problems.models import Problem
from app.students.models import Student

QUEUE = "/api/problems/queue"
_numbers = itertools.count(1)


def problem_url(problem_id, action=""):
    return f"/api/problems/{problem_id}" + (f"/{action}" if action else "")


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


@pytest.fixture
def make_problem(make_user):
    """A problem from a new student, submitted `days_ago` days ago."""

    def make(status="submitted", days_ago=0):
        user = make_user(STUDENT)
        student = Student(user_id=user.id, student_number=f"23F{next(_numbers):07d}", name=f"Student {user.id}")
        db.session.add(student)
        db.session.flush()
        problem = Problem(
            student_id=student.id,
            title=f"Problem of {student.name}",
            description="I need help choosing between two electives for next term.",
            status=status,
            submitted_at=datetime.now(UTC) - timedelta(days=days_ago),
        )
        db.session.add(problem)
        db.session.commit()
        return problem

    return make


# The queue


def test_the_queue_shows_reassignments_first_then_the_oldest(client, iic, make_problem):
    newest = make_problem(days_ago=1)
    oldest = make_problem(days_ago=5)
    reviewing = make_problem("under_review", days_ago=3)
    reassign = make_problem("reassignment_needed", days_ago=0)
    make_problem("closed", days_ago=9)
    make_problem("mentor_assigned", days_ago=9)

    response = client.get(QUEUE, headers=iic)

    assert response.status_code == 200
    ids = [p["id"] for p in response.get_json()["problems"]]
    assert ids == [reassign.id, oldest.id, reviewing.id, newest.id]


def test_opening_a_submitted_problem_moves_it_to_under_review(client, iic, sample_problem):
    response = client.get(problem_url(sample_problem.id), headers=iic)

    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "under_review"
    assert body["student"]["name"] == "Sample Student"
    assert body["student"]["cgpa"] == 8.5
    assert (body["mentor"], body["respond_by"]) == (None, None)
    assert db.session.get(Problem, sample_problem.id).status == "under_review"
    assert db.session.query(AuditLog).filter_by(action="review_problem").count() == 1

    client.get(problem_url(sample_problem.id), headers=iic)  # opening again changes nothing
    assert db.session.query(AuditLog).filter_by(action="review_problem").count() == 1


def test_an_unknown_problem_is_404(client, iic):
    assert client.get(problem_url(999), headers=iic).status_code == 404


# Assigning


def test_assigning_asks_the_mentor_and_tells_the_student(client, iic, iic_user, sample_problem, sample_mentor):
    with mail.record_messages() as outbox:
        response = client.post(
            problem_url(sample_problem.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic
        )

    assert response.status_code == 200
    body = response.get_json()
    assert (body["status"], body["mentor"]) == ("awaiting_mentor", "Sample Mentor")
    assert body["assigned_by"] is not None
    respond_by = datetime.fromisoformat(body["respond_by"])
    assert timedelta(hours=71, minutes=59) < respond_by - datetime.now(UTC) <= timedelta(hours=72)

    mentorship = db.session.query(Mentorship).filter_by(problem_id=sample_problem.id).one()
    assert (mentorship.status, mentorship.mentor_id) == ("pending", sample_mentor.id)
    assert body["assigned_by"] == mentorship.assigned_by.email.split("@")[0]  # the IIC coordinator
    pool = client.get("/api/mentors", headers=iic).get_json()
    assert next(m for m in pool if m["id"] == sample_mentor.id)["load"] == 1  # the active count rises by 1
    assert {email.recipients[0] for email in outbox} == {sample_mentor.user.email, sample_problem.student.user.email}
    subjects = {n.subject for n in db.session.query(Notification)}
    assert subjects == {"New student problem assigned to you", "IIC has asked a mentor to take your request"}
    assert db.session.query(AuditLog).filter_by(action="assign_mentor").count() == 1


def test_the_mentor_sees_the_assignment_and_can_accept_it(client, iic, sample_problem, sample_mentor, mentor_client):
    client.post(problem_url(sample_problem.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic)
    mentorship = db.session.query(Mentorship).one()

    dashboard = mentor_client.get("/api/mentors/me/dashboard").get_json()
    assert [a["id"] for a in dashboard["assignments"]] == [mentorship.id]
    # The mentor sees who in IIC assigned the student, not the student's own email.
    assert dashboard["assignments"][0]["assigned_by"] == mentorship.assigned_by.email.split("@")[0]
    assert mentor_client.post(f"/api/mentors/mentorships/{mentorship.id}/accept").status_code == 200
    assert db.session.get(Problem, sample_problem.id).status == "mentor_assigned"


def test_a_mentor_at_capacity_cannot_be_assigned(client, iic, sample_mentor, make_problem):
    sample_mentor.capacity = 1
    db.session.commit()
    first, second = make_problem(), make_problem()
    assert (
        client.post(problem_url(first.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic).status_code
        == 200
    )

    response = client.post(problem_url(second.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic)

    assert response.status_code == 409
    assert response.get_json()["message"] == (
        "Sample Mentor is at capacity (1 of 1). Ask them to take an extra student first."
    )
    assert db.session.get(Problem, second.id).status == "submitted"

    sample_mentor.capacity = 2  # the mentor agreed to take an extra student (US-10)
    db.session.commit()
    assert (
        client.post(problem_url(second.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic).status_code
        == 200
    )


@pytest.mark.parametrize(
    "change, message",
    [
        ({"verification_status": PENDING}, "cannot take students now"),
        ({"available": False}, "cannot take students now"),
    ],
)
def test_a_mentor_who_cannot_take_students_is_refused(client, iic, sample_problem, sample_mentor, change, message):
    for field, value in change.items():
        setattr(sample_mentor, field, value)
    db.session.commit()
    response = client.post(problem_url(sample_problem.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic)
    assert response.status_code == 409
    assert message in response.get_json()["message"]


def test_a_problem_is_assigned_only_while_it_waits_for_a_mentor(client, iic, sample_mentor, make_problem):
    for status in ("awaiting_mentor", "mentor_assigned", "closed", "withdrawn"):
        problem = make_problem(status)
        response = client.post(problem_url(problem.id, "assign"), json={"mentor_id": sample_mentor.id}, headers=iic)
        assert response.status_code == 409, status


def test_a_student_with_a_mentor_cannot_be_given_another(client, iic, sample_mentorship, sample_problem, make_user):
    other_user = make_user(MENTOR)
    other = Mentor(user_id=other_user.id, name="Other Mentor", verification_status="active", available=True, capacity=2)
    db.session.add(other)
    sample_problem.status = "reassignment_needed"  # a second problem for the same student would be refused too
    db.session.commit()
    response = client.post(problem_url(sample_problem.id, "assign"), json={"mentor_id": other.id}, headers=iic)
    assert response.status_code == 409
    assert response.get_json()["message"] == "This student already has a mentor or a pending assignment."


def test_assigning_an_unknown_mentor_is_404(client, iic, sample_problem):
    assert (
        client.post(problem_url(sample_problem.id, "assign"), json={"mentor_id": 999}, headers=iic).status_code == 404
    )


def test_the_dashboard_shows_an_open_capacity_request_with_who_asked(mentor_client, sample_mentor, iic_user):
    # Used to fail with 500: the code read a name the user account does not have.
    db.session.add(CapacityRequest(mentor_id=sample_mentor.id, by_user_id=iic_user.id, status="pending"))
    db.session.commit()

    response = mentor_client.get("/api/mentors/me/dashboard")

    assert response.status_code == 200
    request = response.get_json()["capacity_request"]
    assert request["by"] == iic_user.email.split("@")[0]
    assert (request["from"], request["to"]) == (2, 3)


# Closing


def test_closing_needs_a_reason_and_tells_the_student(client, iic, sample_problem):
    assert client.post(problem_url(sample_problem.id, "close"), json={"reason": "  "}, headers=iic).status_code == 422
    assert client.post(problem_url(sample_problem.id, "close"), json={}, headers=iic).status_code == 422

    with mail.record_messages() as outbox:
        response = client.post(
            problem_url(sample_problem.id, "close"), json={"reason": "Outside what the programme covers."}, headers=iic
        )

    assert response.status_code == 200
    body = response.get_json()
    assert (body["status"], body["close_reason"]) == ("closed", "Outside what the programme covers.")
    assert body["closed_at"] is not None
    assert len(outbox) == 1
    assert outbox[0].recipients == [sample_problem.student.user.email]
    assert "Reason: Outside what the programme covers." in outbox[0].body
    assert db.session.query(AuditLog).filter_by(action="close_problem").one().details == (
        "Outside what the programme covers."
    )


def test_only_a_problem_waiting_for_a_mentor_can_be_closed(client, iic, make_problem):
    problem = make_problem("mentor_assigned")
    response = client.post(problem_url(problem.id, "close"), json={"reason": "x"}, headers=iic)
    assert response.status_code == 409


# Access


@pytest.mark.parametrize(
    "method, path, body",
    [
        ("get", "queue", None),
        ("get", "{id}", None),
        ("post", "{id}/assign", {"mentor_id": 1}),
        ("post", "{id}/close", {"reason": "x"}),
    ],
)
@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_works_the_queue(client, login_as, sample_problem, method, path, body, role):
    url = "/api/problems/" + path.format(id=sample_problem.id)
    assert getattr(client, method)(url, json=body, headers=login_as(role)).status_code == 403
    assert getattr(client, method)(url, json=body).status_code == 401
