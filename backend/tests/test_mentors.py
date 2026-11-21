"""SCRUM-10/14/18: mentor dashboard, assignments, capacity and profile (C3)."""

from datetime import UTC, datetime

from app.extensions import db
from app.mentors.models import CapacityRequest

DASHBOARD = "/api/mentors/me/dashboard"
PROFILE = "/api/mentors/me"


# ---------- Dashboard ----------


def test_mentor_dashboard_shows_capacity_and_load(mentor_client, sample_mentor):
    response = mentor_client.get(DASHBOARD)
    assert response.status_code == 200
    body = response.get_json()
    assert body["capacity"] == sample_mentor.capacity
    assert body["load"] == 0
    assert body["assignments"] == []
    assert body["mentorships"] == []
    assert body["sessions_this_month"] == 0
    assert body["confirmed"] == 0
    assert body["next_checkpoint"] is None
    assert body["capacity_request"] is None


def test_dashboard_shows_pending_assignment(mentor_client, sample_mentor, sample_student, sample_problem):
    from app.mentorships.models import Mentorship

    # Make the problem "awaiting mentor" so IIC can assign it
    sample_problem.status = "awaiting_mentor"
    m = Mentorship(
        problem_id=sample_problem.id,
        mentor_id=sample_mentor.id,
        status="pending",
        assigned_at=datetime.now(UTC),
    )
    db.session.add(m)
    db.session.commit()
    body = mentor_client.get(DASHBOARD).get_json()
    assert len(body["assignments"]) == 1
    assert body["assignments"][0]["id"] == m.id
    assert body["assignments"][0]["student"]["name"] == sample_student.name
    assert body["assignments"][0]["deadline"] is not None


def test_dashboard_shows_active_mentorships(mentor_client, sample_mentor, sample_mentorship):
    body = mentor_client.get(DASHBOARD).get_json()
    assert len(body["mentorships"]) == 1
    assert body["mentorships"][0]["id"] == sample_mentorship.id
    assert body["mentorships"][0]["student"]["name"] == "Sample Student"


def test_dashboard_needs_mentor_role(student_client):
    assert student_client.get(DASHBOARD).status_code == 403


# ---------- Profile ----------


def test_mentor_reads_own_profile(mentor_client, sample_mentor):
    response = mentor_client.get(PROFILE)
    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == sample_mentor.id
    assert body["name"] == sample_mentor.name
    assert body["available"] == sample_mentor.available
    assert body["channel"] == sample_mentor.preferred_channel
    assert body["contact"] == (sample_mentor.contact or "")
    assert body["availability"] == (sample_mentor.mentoring_style or "")
    assert body["timezone"] == sample_mentor.time_zone
    assert body["capacity"] == sample_mentor.capacity
    assert body["expertise"] == []
    assert body["experience"] == ["AI Systems Ltd"]


def test_mentor_updates_availability_and_contact(mentor_client, sample_mentor):
    response = mentor_client.put(
        PROFILE,
        json={
            "available": False,
            "channel": "Email",
            "contact": "arun@example.com",
            "availability": "Weekends only",
            "timezone": "UTC-4",
        },
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["available"] is False
    assert body["channel"] == "Email"
    assert body["contact"] == "arun@example.com"
    assert body["availability"] == "Weekends only"
    assert body["timezone"] == "UTC-4"


def test_profile_update_validates_fields(mentor_client, sample_mentor):
    response = mentor_client.put(PROFILE, json={"channel": "Telepathy"})
    assert response.status_code == 422
    assert "channel" in response.get_json()["errors"]["json"]


def test_profile_needs_mentor_role(student_client):
    assert student_client.get(PROFILE).status_code == 403


# ---------- Capacity request ----------


def test_mentor_answers_capacity_request(mentor_client, sample_mentor, iic_user):

    req = CapacityRequest(
        mentor_id=sample_mentor.id,
        by_user_id=iic_user.id,
        status="pending",
    )
    db.session.add(req)
    db.session.commit()

    response = mentor_client.post(f"/api/mentors/capacity-requests/{req.id}/answer", json={"accept": True})
    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == req.id
    assert body["status"] == "accepted"
    assert body["capacity"] == 3

    db.session.refresh(sample_mentor)
    assert sample_mentor.capacity == 3


def test_mentor_declines_capacity_request(mentor_client, sample_mentor, iic_user):
    req = CapacityRequest(
        mentor_id=sample_mentor.id,
        by_user_id=iic_user.id,
        status="pending",
    )
    db.session.add(req)
    db.session.commit()

    response = mentor_client.post(f"/api/mentors/capacity-requests/{req.id}/answer", json={"accept": False})
    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "declined"
    assert body["capacity"] == sample_mentor.capacity


def test_cannot_answer_already_answered_request(mentor_client, sample_mentor, iic_user):
    req = CapacityRequest(
        mentor_id=sample_mentor.id,
        by_user_id=iic_user.id,
        status="accepted",
    )
    db.session.add(req)
    db.session.commit()
    assert (
        mentor_client.post(f"/api/mentors/capacity-requests/{req.id}/answer", json={"accept": True}).status_code == 409
    )


# ---------- Accept / decline assignment ----------


def test_mentor_accepts_assignment(mentor_client, sample_mentor, sample_student, sample_problem):
    from app.mentorships.models import Mentorship

    sample_problem.status = "awaiting_mentor"
    m = Mentorship(
        problem_id=sample_problem.id,
        mentor_id=sample_mentor.id,
        status="pending",
        assigned_at=datetime.now(UTC),
    )
    db.session.add(m)
    db.session.commit()

    response = mentor_client.post(f"/api/mentors/mentorships/{m.id}/accept")
    assert response.status_code == 200
    body = response.get_json()
    assert body["id"] == m.id

    db.session.refresh(sample_problem)
    assert sample_problem.status == "mentor_assigned"

    db.session.refresh(m)
    assert m.status == "active"
    assert m.answered_at is not None


def test_mentor_declines_assignment(mentor_client, sample_mentor, sample_student, sample_problem):
    from app.mentorships.models import Mentorship

    sample_problem.status = "awaiting_mentor"
    m = Mentorship(
        problem_id=sample_problem.id,
        mentor_id=sample_mentor.id,
        status="pending",
        assigned_at=datetime.now(UTC),
    )
    db.session.add(m)
    db.session.commit()

    response = mentor_client.post(
        f"/api/mentors/mentorships/{m.id}/decline",
        json={"reason": "No time right now", "note": "I am travelling next month."},
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "reassignment_needed"

    db.session.refresh(sample_problem)
    assert sample_problem.status == "reassignment_needed"
    assert sample_problem.close_reason is not None
    assert "No time right now" in sample_problem.close_reason


def test_another_mentor_cannot_accept_assignment(client, sample_mentor, sample_problem, login_as, make_user):
    from app.auth.models import MENTOR
    from app.mentorships.models import Mentorship

    other_user = make_user(MENTOR, email="other.mentor@ds.study.iitm.ac.in")
    other_mentor = __import__("app.mentors.models", fromlist=["Mentor"]).Mentor(
        user_id=other_user.id,
        name="Other Mentor",
        capacity=1,
        available=True,
    )
    db.session.add(other_mentor)
    db.session.flush()

    sample_problem.status = "awaiting_mentor"
    m = Mentorship(
        problem_id=sample_problem.id,
        mentor_id=sample_mentor.id,
        status="pending",
        assigned_at=datetime.now(UTC),
    )
    db.session.add(m)
    db.session.commit()

    response = client.post(
        f"/api/mentors/mentorships/{m.id}/accept",
        headers=login_as("mentor", user=other_user),
    )
    assert response.status_code == 403
