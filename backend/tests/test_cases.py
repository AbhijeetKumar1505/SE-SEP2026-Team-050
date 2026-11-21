"""SCRUM-07: asking IIC to change or end a mentorship (C8)."""

from app.extensions import db

CASES = "/api/cases"


def case(mentorship_id, **overrides):
    return {
        "mentorship_id": mentorship_id,
        "case_type": "change",
        "details": "The sessions are not covering the technical depth I asked for.",
        **overrides,
    }


def test_a_student_opens_a_case_for_iic(student_client, sample_mentorship):
    response = student_client.post(CASES, json=case(sample_mentorship.id))
    assert response.status_code == 201
    body = response.get_json()
    assert body["mentorship_id"] == sample_mentorship.id
    assert body["case_type"] == "change"
    assert body["status"] == "under_review"
    assert body["details"] == case(sample_mentorship.id)["details"]
    assert body["decision"] is None
    assert body["decision_reason"] is None
    assert body["opened_at"] is not None
    assert body["resolved_at"] is None


def test_the_mentor_can_also_open_a_case(mentor_client, sample_mentorship):
    response = mentor_client.post(CASES, json=case(sample_mentorship.id, case_type="end"))
    assert response.status_code == 201
    assert response.get_json()["case_type"] == "end"


def test_only_one_case_per_mentorship_is_open(student_client, sample_mentorship):
    assert student_client.post(CASES, json=case(sample_mentorship.id)).status_code == 201
    response = student_client.post(CASES, json=case(sample_mentorship.id))
    assert response.status_code == 409
    assert response.get_json()["message"] == "A case about this mentorship is already with IIC."


def test_a_case_validates_its_type_and_details(student_client, sample_mentorship):
    response = student_client.post(
        CASES,
        json=case(sample_mentorship.id, case_type="complaint", details="too short"),
    )
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"case_type", "details"}


def test_a_case_for_an_unknown_mentorship_gets_404(student_client):
    assert student_client.post(CASES, json=case(9999)).status_code == 404


def test_an_outsider_cannot_open_a_case(client, sample_mentorship, login_as):
    response = client.post(CASES, json=case(sample_mentorship.id), headers=login_as("student"))
    assert response.status_code == 403


def test_the_mentorship_shows_that_a_case_is_open(student_client, sample_mentorship):
    student_client.post(CASES, json=case(sample_mentorship.id))
    body = student_client.get("/api/mentorships/me").get_json()["mentorship"]
    assert body["case_open"] is True


def test_a_decided_case_no_longer_blocks_a_new_one(student_client, sample_mentorship):
    from app.cases.models import CaseRecord

    first = student_client.post(CASES, json=case(sample_mentorship.id)).get_json()
    record = db.session.get(CaseRecord, first["id"])
    record.status = "decided"
    db.session.commit()
    assert student_client.post(CASES, json=case(sample_mentorship.id)).status_code == 201
