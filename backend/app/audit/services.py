"""C14 business rules: record important actions, and read them back (SCRUM-72).

Other modules call record() inside the same change it describes, before they commit, so the
entry is saved together with the change or not at all:

    from app.audit import services as audit

    mentor.verification_status = "verified"
    audit.record("verify_mentor", "mentor", mentor.id, actor=get_current_user(), details="Credentials checked.")
    db.session.commit()

Pass actor=None for automatic actions, such as the daily checks (C11). Entries never contain
conversation content (Milestone 2 design, C14).
"""

import re

from sqlalchemy.orm import joinedload

from ..auth.models import User
from ..extensions import db
from .models import AuditLog

# Actions and entity types are short snake_case names, for example "verify_mentor" and "mentor".
NAME = re.compile(r"^[a-z][a-z0-9_]{0,63}$")


def check_name(kind: str, value: str) -> str:
    if not isinstance(value, str) or not NAME.match(value):
        raise ValueError(f"{kind} must be a snake_case name of up to 64 characters, such as 'verify_mentor'.")
    return value


def record(
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    *,
    actor: User | None,
    details: str | None = None,
) -> AuditLog:
    """Add an audit entry to the current transaction. The caller commits it with its own change.

    actor is required, so every call decides who acted: the logged-in user, or None for an
    automatic action.
    """
    entry = AuditLog(
        action=check_name("action", action),
        entity_type=check_name("entity_type", entity_type),
        entity_id=entity_id,
        actor_user_id=actor.id if actor is not None else None,
        details=details.strip() if details and details.strip() else None,
    )
    db.session.add(entry)
    return entry


def entries(*, entity_type: str | None = None, entity_id: int | None = None, action: str | None = None):
    """A query for audit entries, newest first, optionally narrowed to one record or one action."""
    query = db.session.query(AuditLog).options(joinedload(AuditLog.actor))
    if entity_type is not None:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id is not None:
        query = query.filter(AuditLog.entity_id == entity_id)
    if action is not None:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc())


def history(entity_type: str, entity_id: int) -> list[AuditLog]:
    """Every entry for one record, newest first. For history panels, such as on a case page."""
    return entries(entity_type=entity_type, entity_id=entity_id).all()
