"""SCRUM-72: notifications (C13). A dashboard notice plus an email sent only after the change commits."""

import json
from datetime import UTC, datetime, timedelta

import pytest

from app.extensions import db, mail
from app.notifications import services as notifications
from app.notifications.models import FAILED, QUEUED, SENT, EmailTemplate, Notification
from app.notifications.templates import TEMPLATES, Template


@pytest.fixture
def greeting(monkeypatch):
    """A test template with placeholders in both the subject and the body."""
    monkeypatch.setitem(TEMPLATES, "greeting", Template(subject="Hello {name}", body="Your problem is {status}."))
    return "greeting"


def notice_for(user, *, minutes_ago=0, read=False, template="greeting", **context):
    context = context or {"name": "Asha", "status": "Under review"}
    notice = notifications.notify(user, template, link="/student", **context)
    notice.created_at = datetime.now(UTC) - timedelta(minutes=minutes_ago)
    notice.read = read
    db.session.commit()
    return notice


# notify(): the service other modules call


def test_notify_creates_a_notice_and_emails_it_after_the_commit(app, student_user, greeting):
    with mail.record_messages() as outbox:
        notice = notifications.notify(student_user, greeting, link="/student", name="Asha", status="Under review")
        assert outbox == []  # nothing is sent before the change is committed
        db.session.commit()

    assert len(outbox) == 1
    email = outbox[0]
    assert email.recipients == [student_user.email]
    assert email.subject == "Hello Asha"
    assert email.body == "Your problem is Under review.\n\nOpen it on the platform: http://localhost:5173/student"

    saved = db.session.get(Notification, notice.id)
    assert (saved.subject, saved.body, saved.link, saved.read) == (
        "Hello Asha",
        "Your problem is Under review.",
        "/student",
        False,
    )
    assert saved.status == SENT
    assert saved.sent_at is not None
    assert saved.template.template_key == "greeting"


def test_a_rolled_back_change_neither_saves_nor_emails(app, student_user, greeting):
    with mail.record_messages() as outbox:
        notifications.notify(student_user, greeting, name="Asha", status="Withdrawn")
        db.session.rollback()
        db.session.commit()  # a later commit must not send the dropped email either

    assert outbox == []
    assert db.session.query(Notification).count() == 0


def test_a_mail_failure_keeps_the_notice_and_the_change(app, student_user, greeting, monkeypatch):
    def refuse(_message):
        raise ConnectionRefusedError("mail server down")

    monkeypatch.setattr(mail, "send", refuse)
    notice = notifications.notify(student_user, greeting, name="Asha", status="Closed")
    db.session.commit()  # does not raise

    saved = db.session.get(Notification, notice.id)
    assert saved.status == FAILED
    assert saved.sent_at is None


def test_every_placeholder_needs_a_value(app, student_user, greeting):
    with pytest.raises(ValueError, match="'status'"):
        notifications.notify(student_user, greeting, name="Asha")


def test_an_unknown_template_is_an_error(app, student_user):
    with pytest.raises(ValueError, match="No notification template 'nope'"):
        notifications.notify(student_user, "nope")


@pytest.mark.parametrize("text", ["{user.email}", "{users[0]}", "{}"])
def test_placeholders_are_plain_names_only(text):
    with pytest.raises(ValueError, match="plain name"):
        notifications.render(text, {"user": object(), "users": []})


def test_subjects_stay_on_one_line(app, student_user, greeting):
    notice = notifications.notify(student_user, greeting, name="Asha\r\nBcc: someone@example.com", status="x")
    assert "\n" not in notice.subject and "\r" not in notice.subject


def test_links_are_paths_in_the_web_app(app, student_user, greeting):
    with pytest.raises(ValueError, match="path in the web app"):
        notifications.notify(student_user, greeting, link="https://example.com", name="Asha", status="x")


def test_the_template_table_follows_the_code(app, student_user, greeting, monkeypatch):
    notifications.ensure_templates()
    db.session.commit()
    assert {t.template_key for t in db.session.query(EmailTemplate)} >= set(TEMPLATES)

    monkeypatch.setitem(TEMPLATES, "greeting", Template(subject="Hi {name}", body="Now {status}."))
    notice = notifications.notify(student_user, greeting, name="Asha", status="done")
    db.session.commit()
    assert notice.subject == "Hi Asha"
    assert db.session.query(EmailTemplate).filter_by(template_key="greeting").one().subject == "Hi {name}"


def test_seeded_templates_render(app, mentor_user, student_user):
    assert notifications.notify(mentor_user, "assignment_notice", mentor_name="Rahul").subject
    assert notifications.notify(student_user, "acceptance_notice", student_name="Asha", mentor_name="Rahul").body
    assert notifications.notify(student_user, "session_reminder").status == QUEUED


# The notice endpoints


def test_listing_needs_a_login(client):
    assert client.get("/api/notifications").status_code == 401


def test_users_see_only_their_own_notices_newest_first(client, login_as, make_user, greeting):
    me, someone_else = make_user("student"), make_user("student")
    older = notice_for(me, minutes_ago=10)
    newer = notice_for(me, minutes_ago=1)
    notice_for(someone_else)

    response = client.get("/api/notifications", headers=login_as(user=me))

    assert response.status_code == 200
    body = response.get_json()
    assert [n["id"] for n in body] == [newer.id, older.id]
    assert set(body[0]) == {"id", "subject", "body", "link", "read", "created_at"}
    assert json.loads(response.headers["X-Pagination"])["total"] == 2


def test_unread_gives_the_bells_count(client, login_as, make_user, greeting):
    me = make_user("mentor")
    unread = notice_for(me)
    notice_for(me, read=True)

    response = client.get("/api/notifications?unread=true", headers=login_as(user=me))

    assert [n["id"] for n in response.get_json()] == [unread.id]
    assert json.loads(response.headers["X-Pagination"])["total"] == 1


def test_mark_one_notice_read(client, login_as, make_user, greeting):
    me = make_user("student")
    notice = notice_for(me)

    for _ in range(2):  # marking again changes nothing
        response = client.post(f"/api/notifications/{notice.id}/read", headers=login_as(user=me))
        assert response.status_code == 200
        assert response.get_json()["read"] is True
    assert db.session.get(Notification, notice.id).read is True


def test_anyone_elses_notice_is_not_found(client, login_as, make_user, greeting):
    notice = notice_for(make_user("student"))
    intruder = login_as("student")

    assert client.post(f"/api/notifications/{notice.id}/read", headers=intruder).status_code == 404
    assert client.post("/api/notifications/9999/read", headers=intruder).status_code == 404
    assert db.session.get(Notification, notice.id).read is False


def test_mark_all_read_touches_only_my_notices(client, login_as, make_user, greeting):
    me, someone_else = make_user("iic"), make_user("iic")
    mine = [notice_for(me), notice_for(me)]
    theirs = notice_for(someone_else)

    response = client.post("/api/notifications/read-all", headers=login_as(user=me))

    assert response.status_code == 204
    assert all(db.session.get(Notification, n.id).read for n in mine)
    assert db.session.get(Notification, theirs.id).read is False


def test_browsers_can_read_the_pagination_header(client):
    response = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert "X-Pagination" in response.headers["Access-Control-Expose-Headers"]
