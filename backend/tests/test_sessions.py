"""SCRUM-11: planning, logging, editing, confirming and cancelling a session (C9)."""

SESSIONS = "/api/sessions"


def planned(mentorship_id, **overrides):
    return {
        "mentorship_id": mentorship_id,
        "status": "planned",
        "date": "2026-12-01",
        "time": "18:00",
        "channel": "Google Meet",
        "link": "https://meet.google.com/abc-defg-hij",
        **overrides,
    }


def held(mentorship_id, **overrides):
    return {
        "mentorship_id": mentorship_id,
        "status": "held",
        "date": "2026-12-01",
        "duration": 45,
        "topic": "Project code review",
        **overrides,
    }


def test_a_student_plans_a_session(student_client, sample_mentorship):
    response = student_client.post(SESSIONS, json=planned(sample_mentorship.id))
    assert response.status_code == 201
    body = response.get_json()
    assert body["date"] == "2026-12-01"
    assert body["time"] == "18:00"
    assert body["status"] == "planned"
    assert body["link"] == "https://meet.google.com/abc-defg-hij"
    assert body["duration"] is None
    assert body["topic"] is None
    assert body["confirmed"] is False
    assert body["logged_by"] == "student"


def test_a_mentor_logs_a_held_session_without_a_time(mentor_client, sample_mentorship):
    response = mentor_client.post(SESSIONS, json=held(sample_mentorship.id))
    assert response.status_code == 201
    body = response.get_json()
    assert body["status"] == "held"
    assert body["duration"] == 45
    assert body["topic"] == "Project code review"
    assert body["time"] is None
    assert body["link"] is None
    assert body["logged_by"] == "mentor"


def test_a_session_needs_a_mentorship(student_client):
    response = student_client.post(SESSIONS, json={"status": "planned", "date": "2026-12-01"})
    assert response.status_code == 422
    assert response.get_json()["message"] == "mentorship_id is required."


def test_a_session_for_an_unknown_mentorship_gets_404(student_client):
    assert student_client.post(SESSIONS, json=planned(9999)).status_code == 404


def test_an_outsider_cannot_add_a_session(client, sample_mentorship, login_as):
    response = client.post(SESSIONS, json=planned(sample_mentorship.id), headers=login_as("mentor"))
    assert response.status_code == 403


def test_a_session_validates_its_fields(student_client, sample_mentorship):
    response = student_client.post(SESSIONS, json={"mentorship_id": sample_mentorship.id, "status": "done", "date": ""})
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"status", "date"}


def test_editing_a_session_clears_the_confirmation(student_client, mentor_client, sample_mentorship):
    session = mentor_client.post(SESSIONS, json=held(sample_mentorship.id)).get_json()
    student_client.post(f"{SESSIONS}/{session['id']}/confirm")
    response = student_client.put(
        f"{SESSIONS}/{session['id']}",
        json=held(sample_mentorship.id, duration=60, topic="Longer review"),
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["duration"] == 60
    assert body["topic"] == "Longer review"
    assert body["confirmed"] is False
    assert body["logged_by"] == "student"


def test_the_other_participant_confirms_a_held_session(student_client, mentor_client, sample_mentorship):
    session = student_client.post(SESSIONS, json=held(sample_mentorship.id)).get_json()
    response = mentor_client.post(f"{SESSIONS}/{session['id']}/confirm")
    assert response.status_code == 200
    assert response.get_json()["confirmed"] is True


def test_confirming_your_own_log_or_twice_gets_409(student_client, mentor_client, sample_mentorship):
    session = student_client.post(SESSIONS, json=held(sample_mentorship.id)).get_json()
    own = student_client.post(f"{SESSIONS}/{session['id']}/confirm")
    assert own.status_code == 409
    assert own.get_json()["message"] == "The other participant confirms a session you logged."
    assert mentor_client.post(f"{SESSIONS}/{session['id']}/confirm").status_code == 200
    twice = mentor_client.post(f"{SESSIONS}/{session['id']}/confirm")
    assert twice.status_code == 409
    assert twice.get_json()["message"] == "This session is already confirmed."


def test_a_planned_session_can_be_cancelled(student_client, sample_mentorship):
    session = student_client.post(SESSIONS, json=planned(sample_mentorship.id)).get_json()
    response = student_client.post(f"{SESSIONS}/{session['id']}/cancel")
    assert response.status_code == 200
    assert response.get_json()["status"] == "cancelled"


def test_a_held_session_cannot_be_cancelled(student_client, sample_mentorship):
    session = student_client.post(SESSIONS, json=held(sample_mentorship.id)).get_json()
    response = student_client.post(f"{SESSIONS}/{session['id']}/cancel")
    assert response.status_code == 409
    assert response.get_json()["message"] == "Only a planned session can be cancelled."


def test_an_unknown_session_gets_404(student_client):
    assert student_client.post(f"{SESSIONS}/9999/confirm").status_code == 404
    assert student_client.post(f"{SESSIONS}/9999/cancel").status_code == 404
