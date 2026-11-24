"""US-18 and US-10: IIC asks a mentor to take one more student; capacity rises only if they accept."""

import itertools
from datetime import UTC, datetime

import pytest

from app.audit.models import AuditLog
from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.extensions import db, mail
from app.mentors.models import PENDING, VERIFIED, CapacityRequest
from app.notifications.models import Notification
from app.problems.models import Problem
from app.students.models import Student

_numbers = itertools.count(1)


def ask_url(mentor_id):
    return f"/api/mentors/{mentor_id}/capacity-requests"


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


@pytest.fixture
def make_problem(make_user):
    def make():
        user = make_user(STUDENT)
        student = Student(user_id=user.id, student_number=f"24F{next(_numbers):07d}", name=f"Student {user.id}")
        db.session.add(student)
        db.session.flush()
        problem = Problem(
            student_id=student.id,
            title="Choosing electives",
            description="I need help choosing between two electives for next term.",
            status="submitted",
            submitted_at=datetime.now(UTC),
        )
        db.session.add(problem)
        db.session.commit()
        return problem

    return make


def test_iic_asks_a_mentor_and_the_mentor_is_told(client, iic, sample_mentor, mentor_client):
    with mail.record_messages() as outbox:
        response = client.post(ask_url(sample_mentor.id), headers=iic)

    assert response.status_code == 201
    body = response.get_json()
    assert (body["mentor_id"], body["status"], body["from"], body["to"]) == (sample_mentor.id, "pending", 2, 3)
    assert body["by"] is not None
    assert len(outbox) == 1
    assert outbox[0].recipients == [sample_mentor.user.email]
    assert "raise your capacity from 2 to 3" in outbox[0].body
    notice = db.session.query(Notification).one()
    assert (notice.recipient_user_id, notice.link) == (sample_mentor.user_id, "/mentor")
    assert db.session.query(AuditLog).filter_by(action="request_capacity").count() == 1

    pool = client.get("/api/mentors", headers=iic).get_json()
    assert next(m for m in pool if m["id"] == sample_mentor.id)["capacity_requested"] is True
    shown = mentor_client.get("/api/mentors/me/dashboard").get_json()["capacity_request"]
    assert (shown["id"], shown["from"], shown["to"]) == (body["id"], 2, 3)


def test_capacity_rises_only_when_the_mentor_accepts(client, iic, sample_mentor, mentor_client):
    first = client.post(ask_url(sample_mentor.id), headers=iic).get_json()
    declined = mentor_client.post(f"/api/mentors/capacity-requests/{first['id']}/answer", json={"accept": False})
    assert declined.get_json()["capacity"] == 2

    second = client.post(ask_url(sample_mentor.id), headers=iic).get_json()  # answered, so IIC may ask again
    accepted = mentor_client.post(f"/api/mentors/capacity-requests/{second['id']}/answer", json={"accept": True})
    assert accepted.get_json()["capacity"] == 3


def test_a_mentor_at_capacity_is_assigned_after_agreeing_to_one_more(
    client, iic, sample_mentor, mentor_client, make_problem
):
    sample_mentor.capacity = 1
    db.session.commit()
    first, second = make_problem(), make_problem()
    assign = "/api/problems/{}/assign"
    assert client.post(assign.format(first.id), json={"mentor_id": sample_mentor.id}, headers=iic).status_code == 200
    assert client.post(assign.format(second.id), json={"mentor_id": sample_mentor.id}, headers=iic).status_code == 409

    request_id = client.post(ask_url(sample_mentor.id), headers=iic).get_json()["id"]
    mentor_client.post(f"/api/mentors/capacity-requests/{request_id}/answer", json={"accept": True})

    response = client.post(assign.format(second.id), json={"mentor_id": sample_mentor.id}, headers=iic)
    assert response.status_code == 200
    assert response.get_json()["status"] == "awaiting_mentor"


def test_only_one_request_at_a_time(client, iic, sample_mentor):
    client.post(ask_url(sample_mentor.id), headers=iic)
    response = client.post(ask_url(sample_mentor.id), headers=iic)
    assert response.status_code == 409
    assert response.get_json()["message"] == "Sample Mentor already has a pending request."
    assert db.session.query(CapacityRequest).count() == 1


@pytest.mark.parametrize(
    "change", [{"verification_status": PENDING}, {"verification_status": VERIFIED}, {"available": False}]
)
def test_a_mentor_who_is_not_active_and_available_is_not_asked(client, iic, sample_mentor, change):
    for field, value in change.items():
        setattr(sample_mentor, field, value)
    db.session.commit()
    response = client.post(ask_url(sample_mentor.id), headers=iic)
    assert response.status_code == 409
    assert response.get_json()["message"] == "Sample Mentor isn't available."


def test_an_unknown_mentor_is_404(client, iic):
    assert client.post(ask_url(999), headers=iic).status_code == 404


@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_can_ask(client, login_as, sample_mentor, role):
    assert client.post(ask_url(sample_mentor.id), headers=login_as(role)).status_code == 403
    assert client.post(ask_url(sample_mentor.id)).status_code == 401
