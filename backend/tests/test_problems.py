"""SCRUM-04/05: submitting, editing and withdrawing a problem (C5)."""

from datetime import UTC, datetime

from app.extensions import db
from app.problems.models import Problem
from app.settings.models import TopicTag

PROBLEMS = "/api/problems"
STATUS = "/api/problems/me/status"

NEW_PROBLEM = {
    "description": "I want advice on choosing between two Computer Vision electives and planning a portfolio project.",
    "tags": ["Computer vision", "Choosing electives"],
    "desired_outcome": "A shortlist of electives and an outline for a project.",
    "guidance_preferences": "Written feedback first, then a call.",
}


# ---------- Submit ----------


def test_student_can_submit_a_problem(student_client, sample_student):
    response = student_client.post(PROBLEMS, json=NEW_PROBLEM)
    assert response.status_code == 201
    body = response.get_json()
    assert body["status"] == "submitted"
    assert body["description"] == NEW_PROBLEM["description"]
    assert body["desired_outcome"] == NEW_PROBLEM["desired_outcome"]
    assert body["guidance_preferences"] == NEW_PROBLEM["guidance_preferences"]
    assert body["tags"] == NEW_PROBLEM["tags"]
    assert body["title"].startswith("I want advice on choosing")
    assert body["closed_at"] is None
    assert body["close_reason"] is None
    assert Problem.query.filter_by(student_id=sample_student.id).count() == 1


def test_a_long_description_becomes_a_short_title(student_client, sample_student):
    body = student_client.post(PROBLEMS, json={**NEW_PROBLEM, "description": "x" * 200}).get_json()
    assert body["title"] == "x" * 120 + "…"


def test_a_student_has_one_open_problem_at_a_time(student_client, sample_problem):
    response = student_client.post(PROBLEMS, json=NEW_PROBLEM)
    assert response.status_code == 409
    assert response.get_json()["message"] == "You already have an open problem."


def test_a_withdrawn_problem_frees_the_student_to_submit_again(student_client, sample_student, sample_problem):
    sample_problem.status = "withdrawn"
    db.session.commit()
    assert student_client.post(PROBLEMS, json=NEW_PROBLEM).status_code == 201


def test_an_incomplete_profile_cannot_submit(student_client, sample_student):
    sample_student.career_interest = None
    db.session.commit()
    response = student_client.post(PROBLEMS, json=NEW_PROBLEM)
    assert response.status_code == 409
    assert response.get_json()["message"] == "Complete your profile first."


def test_submit_rejects_unknown_and_retired_tags(student_client, sample_student):
    unknown = student_client.post(PROBLEMS, json={**NEW_PROBLEM, "tags": ["Not a real tag"]})
    assert unknown.status_code == 422
    assert "Unknown topic tag 'Not a real tag'." in unknown.get_json()["errors"]["json"]["tags"]

    retired = TopicTag(name="Old topic", category="Technical skills", retired=True)
    db.session.add(retired)
    db.session.commit()
    response = student_client.post(PROBLEMS, json={**NEW_PROBLEM, "tags": ["Old topic"]})
    assert response.status_code == 422
    assert "Topic tag 'Old topic' is retired." in response.get_json()["errors"]["json"]["tags"]


def test_submit_validates_the_fields_and_tag_count(student_client, sample_student):
    response = student_client.post(
        PROBLEMS,
        json={"description": "too short", "tags": [f"tag-{index}" for index in range(6)], "desired_outcome": ""},
    )
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"description", "tags", "desired_outcome"}


def test_only_a_student_submits_a_problem(mentor_client, iic_client):
    assert mentor_client.post(PROBLEMS, json=NEW_PROBLEM).status_code == 403
    assert iic_client.post(PROBLEMS, json=NEW_PROBLEM).status_code == 403


def test_submit_status_tracks_the_open_problem(student_client, sample_student, sample_problem):
    assert student_client.get(STATUS).get_json() == {"has_open_problem": True}
    sample_problem.status = "closed"
    db.session.commit()
    assert student_client.get(STATUS).get_json() == {"has_open_problem": False}


# ---------- Edit ----------


def test_student_edits_their_problem_before_a_mentor_accepts(student_client, sample_problem):
    response = student_client.put(
        f"{PROBLEMS}/{sample_problem.id}",
        json={**NEW_PROBLEM, "tags": ["Python programming"]},
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["description"] == NEW_PROBLEM["description"]
    assert body["tags"] == ["Python programming"]


def test_a_problem_cannot_be_edited_once_a_mentor_accepts(student_client, sample_mentorship, sample_problem):
    sample_problem.status = "mentor_assigned"
    db.session.commit()
    response = student_client.put(f"{PROBLEMS}/{sample_problem.id}", json=NEW_PROBLEM)
    assert response.status_code == 409
    assert response.get_json()["message"] == "This request can no longer be edited."


def test_another_student_cannot_edit_the_problem(client, sample_problem, login_as):
    response = client.put(f"{PROBLEMS}/{sample_problem.id}", json=NEW_PROBLEM, headers=login_as("student"))
    assert response.status_code == 403


def test_editing_an_unknown_problem_gets_404(student_client, sample_student):
    assert student_client.put(f"{PROBLEMS}/9999", json=NEW_PROBLEM).status_code == 404


# ---------- Withdraw ----------


def test_student_withdraws_their_problem(student_client, sample_problem):
    response = student_client.post(f"{PROBLEMS}/{sample_problem.id}/withdraw")
    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == "withdrawn"
    assert body["closed_at"] is not None
    assert body["close_reason"] == "Withdrawn by the student."


def test_a_problem_cannot_be_withdrawn_after_a_mentor_accepts(student_client, sample_mentorship, sample_problem):
    sample_problem.status = "mentor_assigned"
    db.session.commit()
    response = student_client.post(f"{PROBLEMS}/{sample_problem.id}/withdraw")
    assert response.status_code == 409
    assert response.get_json()["message"] == "This request can no longer be withdrawn."


def test_a_closed_problem_is_not_open(student_client, sample_problem):
    sample_problem.status = "closed"
    sample_problem.closed_at = datetime.now(UTC)
    db.session.commit()
    assert student_client.get(STATUS).get_json() == {"has_open_problem": False}
