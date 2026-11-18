"""SCRUM-08: progress feedback from the student and the mentor (C10)."""

FEEDBACK = "/api/feedback"


def feedback(mentorship_id, **overrides):
    return {"mentorship_id": mentorship_id, "progress_status": "some_progress", **overrides}


def test_a_student_reports_progress(student_client, sample_mentorship):
    response = student_client.post(FEEDBACK, json=feedback(sample_mentorship.id, comment="  Two sessions done.  "))
    assert response.status_code == 201
    body = response.get_json()
    assert body["mentorship_id"] == sample_mentorship.id
    assert body["progress_status"] == "some_progress"
    assert body["comment"] == "Two sessions done."
    assert body["checkpoint_number"] == 1
    assert body["author_side"] == "student"
    assert body["submitted_at"] is not None


def test_the_comment_is_optional(student_client, sample_mentorship):
    body = student_client.post(FEEDBACK, json=feedback(sample_mentorship.id)).get_json()
    assert body["comment"] is None


def test_the_mentor_reports_progress_separately(mentor_client, sample_mentorship):
    first = mentor_client.post(FEEDBACK, json=feedback(sample_mentorship.id, progress_status="no_progress"))
    assert first.status_code == 201
    body = mentor_client.post(
        FEEDBACK,
        json=feedback(sample_mentorship.id, progress_status="goal_met"),
    ).get_json()
    assert body["author_side"] == "mentor"
    assert body["checkpoint_number"] == 2


def test_each_report_increments_that_participants_checkpoint(student_client, sample_mentorship):
    student_client.post(FEEDBACK, json=feedback(sample_mentorship.id))
    second = student_client.post(FEEDBACK, json=feedback(sample_mentorship.id)).get_json()
    assert second["checkpoint_number"] == 2


def test_feedback_validates_its_fields(student_client, sample_mentorship):
    response = student_client.post(
        FEEDBACK,
        json={"mentorship_id": sample_mentorship.id, "progress_status": "great", "comment": "x" * 501},
    )
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"progress_status", "comment"}


def test_feedback_for_an_unknown_mentorship_gets_404(student_client):
    assert student_client.post(FEEDBACK, json=feedback(9999)).status_code == 404


def test_an_outsider_cannot_report_progress(client, sample_mentorship, login_as):
    response = client.post(FEEDBACK, json=feedback(sample_mentorship.id), headers=login_as("mentor"))
    assert response.status_code == 403
