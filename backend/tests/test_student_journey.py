"""The Sprint 1 journey across roles: limits, who sees a problem, and what the student is told.

Covers the remaining cases of SCRUM-102 (problem limits, hidden from mentors), SCRUM-105 (contact
details only after acceptance, notices on status changes) and SCRUM-108 (unassigned problems hidden,
a declined problem back in IIC's queue).
"""

import pytest

from app.auth.models import IIC, MENTOR
from app.extensions import db
from app.mentorships.models import Mentorship
from app.notifications.models import Notification
from app.settings.models import TopicTag

PROBLEMS = "/api/problems"
GOOD = {
    "description": "I want advice on choosing between two Computer Vision electives and planning a project.",
    "tags": ["Computer vision"],
    "desired_outcome": "A shortlist of electives.",
}


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


@pytest.fixture
def tagged_problem(sample_problem):
    sample_problem.tags = [db.session.query(TopicTag).filter_by(name="Computer vision").one()]
    db.session.commit()
    return sample_problem


def assign(client, iic, problem, mentor):
    response = client.post(f"{PROBLEMS}/{problem.id}/assign", json={"mentor_id": mentor.id}, headers=iic)
    assert response.status_code == 200, response.get_json()
    return db.session.query(Mentorship).filter_by(problem_id=problem.id).one()


def notices_for(user):
    return [
        n.subject for n in db.session.query(Notification).filter_by(recipient_user_id=user.id).order_by(Notification.id)
    ]


# SCRUM-102: problem limits


@pytest.mark.parametrize(
    "change, field",
    [
        ({"description": "x" * 29}, "description"),
        ({"description": "x" * 1001}, "description"),
        ({"tags": []}, "tags"),
        (
            {
                "tags": [
                    "Computer vision",
                    "Choosing electives",
                    "Finding internships",
                    "Job search strategy",
                    "Technical interview preparation",
                    "Choosing a career path",
                ]
            },
            "tags",
        ),
        ({"desired_outcome": ""}, "desired_outcome"),
    ],
    ids=["description-too-short", "description-too-long", "no-tags", "six-tags", "no-outcome"],
)
def test_a_problem_outside_the_limits_is_refused(student_client, sample_student, change, field):
    response = student_client.post(PROBLEMS, json={**GOOD, **change})
    assert response.status_code == 422
    assert field in response.get_json()["errors"]["json"]


def test_a_problem_at_the_limits_is_accepted(student_client, sample_student):
    five = [
        "Computer vision",
        "Choosing electives",
        "Finding internships",
        "Job search strategy",
        "Technical interview preparation",
    ]
    response = student_client.post(PROBLEMS, json={**GOOD, "description": "x" * 1000, "tags": five})
    assert response.status_code == 201


# SCRUM-102 and SCRUM-108: a problem is hidden from mentors until it is assigned to them


def test_mentors_cannot_see_problems_that_are_not_assigned_to_them(
    client, iic, mentor_client, tagged_problem, sample_mentor
):
    assert mentor_client.get(f"{PROBLEMS}/queue").status_code == 403
    assert mentor_client.get(f"{PROBLEMS}/{tagged_problem.id}").status_code == 403
    assert mentor_client.get("/api/mentors/me/dashboard").get_json()["assignments"] == []

    mentorship = assign(client, iic, tagged_problem, sample_mentor)

    assignments = mentor_client.get("/api/mentors/me/dashboard").get_json()["assignments"]
    assert [a["id"] for a in assignments] == [mentorship.id]


def test_another_mentor_does_not_see_the_assignment(client, iic, login_as, make_user, tagged_problem, sample_mentor):
    from app.mentors.models import Mentor

    other_user = make_user(MENTOR)
    db.session.add(Mentor(user_id=other_user.id, name="Other Mentor", verification_status="active", available=True))
    db.session.commit()
    mentorship = assign(client, iic, tagged_problem, sample_mentor)

    other = login_as(user=other_user)
    assert client.get("/api/mentors/me/dashboard", headers=other).get_json()["assignments"] == []
    assert client.get(f"/api/mentors/mentorships/{mentorship.id}", headers=other).status_code == 403


# SCRUM-105: the mentor's contact details only after they accept, and a notice at each status change


def test_the_student_gets_the_mentors_contact_only_after_they_accept(
    client, iic, student_client, mentor_client, tagged_problem, sample_mentor
):
    mentorship = assign(client, iic, tagged_problem, sample_mentor)

    assert student_client.get("/api/mentorships/me").get_json()["mentorship"] is None
    assert student_client.get("/api/students/me/home").get_json()["mentorship"] is None

    mentor_client.post(f"/api/mentors/mentorships/{mentorship.id}/accept")

    mine = student_client.get("/api/mentorships/me").get_json()["mentorship"]
    assert mine is not None
    assert mine["mentor"]["contact"] == sample_mentor.user.email


def test_the_student_is_told_at_each_status_change(client, iic, mentor_client, tagged_problem, sample_mentor):
    student_user = tagged_problem.student.user
    mentorship = assign(client, iic, tagged_problem, sample_mentor)
    assert notices_for(student_user) == ["IIC has asked a mentor to take your request"]

    mentor_client.post(f"/api/mentors/mentorships/{mentorship.id}/accept")
    assert notices_for(student_user)[-1] == "Your mentor has accepted your request"


def test_the_student_is_told_when_iic_closes_their_problem(client, iic, tagged_problem):
    client.post(f"{PROBLEMS}/{tagged_problem.id}/close", json={"reason": "Out of scope."}, headers=iic)
    assert notices_for(tagged_problem.student.user) == ["Your mentoring request has been closed"]


# SCRUM-108: a declined problem goes back to the top of IIC's queue


def test_a_declined_problem_goes_back_to_the_top_of_the_queue(
    client, iic, mentor_client, tagged_problem, sample_mentor
):
    mentorship = assign(client, iic, tagged_problem, sample_mentor)

    response = mentor_client.post(
        f"/api/mentors/mentorships/{mentorship.id}/decline",
        json={"reason": "No time right now", "note": "Travelling this month."},
    )

    assert response.status_code == 200
    queue = client.get(f"{PROBLEMS}/queue", headers=iic).get_json()["problems"]
    assert queue[0]["id"] == tagged_problem.id
    assert queue[0]["status"] == "reassignment_needed"
    assert "No time right now" in queue[0]["reassign_reason"]
    assert "Travelling this month." in queue[0]["reassign_reason"]
