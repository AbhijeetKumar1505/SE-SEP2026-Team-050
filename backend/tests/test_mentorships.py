"""SCRUM-05/06: the student's mentorship, goal and next steps (C7)."""

import json

from app.extensions import db
from app.mentorships.models import Mentorship

MY_MENTORSHIP = "/api/mentorships/me"


# ---------- Read ----------


def test_a_student_without_a_mentor_gets_null(student_client, sample_student):
    response = student_client.get(MY_MENTORSHIP)
    assert response.status_code == 200
    assert response.get_json() == {"mentorship": None}


def test_the_student_sees_the_mentor_goal_and_legacy_steps(student_client, sample_mentorship):
    response = student_client.get(MY_MENTORSHIP)
    assert response.status_code == 200
    body = response.get_json()["mentorship"]
    assert body["id"] == sample_mentorship.id
    assert body["status"] == "active"
    assert body["goal"] == sample_mentorship.goal
    assert body["steps"] == [
        {"id": "step-1", "text": "Train baseline model,", "done": False},
        {"id": "step-2", "text": "Review code on Google Meet.", "done": False},
    ]
    assert body["reached_out_at"] is not None
    assert body["case_open"] is False
    assert body["topics"] == []
    assert len(body["checkpoint_due"]) == 10  # a date, YYYY-MM-DD
    assert body["mentor"] == {
        "name": "Sample Mentor",
        "headline": "AI Systems Ltd",
        "contact": sample_mentorship.mentor.user.email,
        "channel": "Google Meet",
        "availability": "Saturday 10:00–11:30",
        "time_zone": "Asia/Kolkata",
        "expertise": [],
        "experience": ["Industry engineer with 5+ years of production ML experience."],
    }
    assert body["sessions"] == []


def test_an_ended_mentorship_is_not_the_current_one(student_client, sample_mentorship):
    sample_mentorship.status = "ended_by_iic"
    db.session.commit()
    assert student_client.get(MY_MENTORSHIP).get_json() == {"mentorship": None}


def test_changing_a_step_stores_the_list_as_json(student_client, sample_mentorship):
    student_client.post(f"/api/mentorships/{sample_mentorship.id}/steps", json={"text": "Book a code review"})
    stored = json.loads(db.session.get(Mentorship, sample_mentorship.id).next_steps)
    assert [step["text"] for step in stored] == [
        "Train baseline model,",
        "Review code on Google Meet.",
        "Book a code review",
    ]


def test_only_a_student_has_a_mentorship_page(mentor_client):
    assert mentor_client.get(MY_MENTORSHIP).status_code == 403


# ---------- Goal ----------


def test_either_participant_can_rewrite_the_goal(student_client, sample_mentorship):
    response = student_client.put(f"/api/mentorships/{sample_mentorship.id}", json={"goal": "Land a data internship."})
    assert response.status_code == 200
    assert response.get_json()["goal"] == "Land a data internship."


def test_the_mentor_can_rewrite_the_goal(mentor_client, sample_mentorship):
    response = mentor_client.put(f"/api/mentorships/{sample_mentorship.id}", json={"goal": "Ship a benchmark report."})
    assert response.status_code == 200
    assert response.get_json()["goal"] == "Ship a benchmark report."


def test_a_short_goal_is_rejected(student_client, sample_mentorship):
    response = student_client.put(f"/api/mentorships/{sample_mentorship.id}", json={"goal": "short"})
    assert response.status_code == 422
    assert "goal" in response.get_json()["errors"]["json"]


def test_an_outsider_cannot_change_the_goal(client, sample_mentorship, login_as):
    response = client.put(
        f"/api/mentorships/{sample_mentorship.id}",
        json={"goal": "A goal the outsider should not set."},
        headers=login_as("student"),
    )
    assert response.status_code == 403


# ---------- Reaching out ----------


def test_reaching_out_records_the_first_contact_once(student_client, sample_mentorship):
    sample_mentorship.reached_out_at = None
    db.session.commit()
    assert student_client.post(f"/api/mentorships/{sample_mentorship.id}/reached-out").status_code == 204
    db.session.refresh(sample_mentorship)
    first = sample_mentorship.reached_out_at
    assert first is not None
    assert student_client.post(f"/api/mentorships/{sample_mentorship.id}/reached-out").status_code == 204
    db.session.refresh(sample_mentorship)
    assert sample_mentorship.reached_out_at == first


# ---------- Next steps ----------


def test_a_participant_adds_a_step(student_client, sample_mentorship):
    url = f"/api/mentorships/{sample_mentorship.id}/steps"
    response = student_client.post(url, json={"text": "Book a code review"})
    assert response.status_code == 201
    steps = response.get_json()
    assert steps[-1]["text"] == "Book a code review"
    assert steps[-1]["done"] is False
    assert len(steps) == 3


def test_a_step_can_be_toggled_done_and_back(student_client, sample_mentorship):
    step_id = student_client.get(MY_MENTORSHIP).get_json()["mentorship"]["steps"][0]["id"]
    toggled = student_client.post(f"/api/mentorships/{sample_mentorship.id}/steps/{step_id}/toggle")
    assert toggled.status_code == 200
    assert toggled.get_json()[0]["done"] is True
    again = student_client.post(f"/api/mentorships/{sample_mentorship.id}/steps/{step_id}/toggle")
    assert again.get_json()[0]["done"] is False


def test_a_step_can_be_deleted(student_client, mentor_client, sample_mentorship):
    step_id = student_client.get(MY_MENTORSHIP).get_json()["mentorship"]["steps"][1]["id"]
    response = mentor_client.delete(f"/api/mentorships/{sample_mentorship.id}/steps/{step_id}")
    assert response.status_code == 200
    assert [step["id"] for step in response.get_json()] == ["step-1"]


def test_an_unknown_step_gets_404(student_client, sample_mentorship):
    url = f"/api/mentorships/{sample_mentorship.id}/steps/not-a-step"
    assert student_client.post(f"{url}/toggle").status_code == 404
    assert student_client.delete(url).status_code == 404


def test_a_new_step_needs_text(student_client, sample_mentorship):
    response = student_client.post(f"/api/mentorships/{sample_mentorship.id}/steps", json={"text": ""})
    assert response.status_code == 422
    assert "text" in response.get_json()["errors"]["json"]
