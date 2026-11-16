"""SCRUM-72: the audit log (C14). Entries are recorded with the change, never edited, and readable only by IIC."""

import json
from datetime import UTC, datetime, timedelta

import pytest

from app.audit import services as audit
from app.audit.models import AuditLog, AuditLogIsAppendOnly
from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.extensions import db


def add_entry(action, entity_type, entity_id, *, actor=None, minutes_ago=0, details=None):
    entry = audit.record(action, entity_type, entity_id, actor=actor, details=details)
    entry.created_at = datetime.now(UTC) - timedelta(minutes=minutes_ago)
    db.session.commit()
    return entry


# The service other modules call


def test_record_saves_who_did_what_to_which_record(iic_user):
    entry = audit.record("verify_mentor", "mentor", 3, actor=iic_user, details="  Checked LinkedIn.  ")
    db.session.commit()

    saved = db.session.get(AuditLog, entry.id)
    assert (saved.action, saved.entity_type, saved.entity_id) == ("verify_mentor", "mentor", 3)
    assert saved.actor_user_id == iic_user.id
    assert saved.details == "Checked LinkedIn."
    assert saved.created_at is not None


def test_automatic_actions_have_no_actor(app):
    entry = audit.record("raise_flag", "mentorship", 9, actor=None, details="")
    db.session.commit()
    assert entry.actor_user_id is None
    assert entry.details is None  # blank details are stored as empty


def test_an_entry_is_saved_with_its_change_or_not_at_all(iic_user):
    audit.record("close_problem", "problem", 1, actor=iic_user)
    db.session.rollback()
    assert db.session.query(AuditLog).count() == 0


@pytest.mark.parametrize("bad", ["", "Verify mentor", "verify-mentor", "1st_action", "x" * 65, None])
def test_action_and_entity_type_must_be_snake_case_names(app, bad):
    with pytest.raises(ValueError, match="snake_case"):
        audit.record(bad, "mentor", 1, actor=None)
    with pytest.raises(ValueError, match="snake_case"):
        audit.record("verify_mentor", bad, 1, actor=None)


def test_actor_must_be_given_explicitly(app):
    with pytest.raises(TypeError):
        audit.record("verify_mentor", "mentor", 1)


def test_entries_cannot_be_changed(iic_user):
    entry = add_entry("verify_mentor", "mentor", 3, actor=iic_user)
    entry.details = "rewritten"
    with pytest.raises(AuditLogIsAppendOnly):
        db.session.commit()
    db.session.rollback()


def test_entries_cannot_be_deleted(iic_user):
    entry = add_entry("verify_mentor", "mentor", 3, actor=iic_user)
    db.session.delete(entry)
    with pytest.raises(AuditLogIsAppendOnly):
        db.session.commit()
    db.session.rollback()
    assert db.session.get(AuditLog, entry.id) is not None


def test_history_lists_one_records_entries_newest_first(iic_user):
    first = add_entry("add_mentor", "mentor", 3, actor=iic_user, minutes_ago=10)
    second = add_entry("verify_mentor", "mentor", 3, actor=iic_user, minutes_ago=5)
    add_entry("verify_mentor", "mentor", 4, actor=iic_user)
    add_entry("assign_mentor", "mentorship", 3, actor=iic_user)

    assert [e.id for e in audit.history("mentor", 3)] == [second.id, first.id]


# GET /api/audit


def test_listing_needs_a_login(client):
    assert client.get("/api/audit").status_code == 401


@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_can_read_the_audit_log(client, login_as, role):
    response = client.get("/api/audit", headers=login_as(role))
    assert response.status_code == 403


def test_iic_sees_entries_newest_first_with_their_actor(client, login_as, iic_user):
    older = add_entry("import_roster", "student", None, actor=iic_user, minutes_ago=30, details="roster.csv")
    newer = add_entry("raise_flag", "mentorship", 2, actor=None, minutes_ago=1)

    response = client.get("/api/audit", headers=login_as(IIC))

    assert response.status_code == 200
    body = response.get_json()
    assert [e["id"] for e in body] == [newer.id, older.id]
    assert body[0]["actor"] is None
    assert body[1]["actor"] == {"id": iic_user.id, "email": iic_user.email}
    assert body[1]["details"] == "roster.csv"
    assert body[1]["entity_id"] is None


def test_filters_give_one_records_history(client, login_as, iic_user):
    wanted = add_entry("verify_mentor", "mentor", 3, actor=iic_user)
    add_entry("verify_mentor", "mentor", 4, actor=iic_user)
    add_entry("assign_mentor", "mentorship", 3, actor=iic_user)

    response = client.get("/api/audit?entity_type=mentor&entity_id=3", headers=login_as(IIC))
    assert [e["id"] for e in response.get_json()] == [wanted.id]

    response = client.get("/api/audit?action=verify_mentor", headers=login_as(IIC))
    assert len(response.get_json()) == 2


def test_entity_id_without_a_type_is_refused(client, login_as):
    response = client.get("/api/audit?entity_id=3", headers=login_as(IIC))
    assert response.status_code == 422
    assert "entity_id" in response.get_json()["errors"]["query"]


def test_the_list_is_paginated(client, login_as, iic_user):
    for minutes in range(25):
        add_entry("verify_mentor", "mentor", minutes + 1, actor=iic_user, minutes_ago=minutes)

    response = client.get("/api/audit?page=2&page_size=10", headers=login_as(IIC))

    assert len(response.get_json()) == 10
    pagination = json.loads(response.headers["X-Pagination"])
    assert (pagination["total"], pagination["total_pages"], pagination["page"]) == (25, 3, 2)
    assert response.get_json()[0]["entity_id"] == 11  # page 2 starts with the 11th newest
