"""C9 business rules for sessions (US-11). A session records when, where and how long, never content."""

from datetime import datetime
from datetime import time as clock_time

from flask_smorest import abort

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..mentorships.access import participant_side
from ..mentorships.models import Mentorship
from ..models import utcnow
from .models import Session


def get_mentorship(mentorship_id: int) -> Mentorship:
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    return mentorship


def get_participant_session(session_id: int, *, user: User) -> Session:
    session = db.session.get(Session, session_id)
    if session is None:
        abort(404, message=f"No session with ID {session_id}.")
    participant_side(session.mentorship, user)
    return session


def serialize_session(session: Session) -> dict:
    when = session.held_at or session.planned_at or session.created_at or utcnow()
    logged_by_id = session.logged_by_user_id
    if logged_by_id == session.mentorship.problem.student.user_id:
        logged_by = "student"
    elif logged_by_id == session.mentorship.mentor.user_id:
        logged_by = "mentor"
    else:
        logged_by = None
    planned_time = session.planned_at.strftime("%H:%M") if session.status == "planned" and session.planned_at else None
    return {
        "id": session.id,
        "date": when.date(),
        "time": planned_time,
        "duration": session.duration_minutes,
        "topic": session.topic_category,
        "channel": session.channel,
        "link": session.meeting_link,
        "status": session.status,
        "confirmed": session.confirmed_by_user_id is not None,
        "logged_by": logged_by,
    }


def _apply_values(session: Session, values: dict, *, user: User) -> None:
    when = datetime.combine(values["date"], values.get("time") or clock_time(0, 0))
    session.status = values["status"]
    session.channel = values.get("channel") or "Google Meet"
    session.logged_by_user_id = user.id
    session.confirmed_by_user_id = None  # an edit needs confirming again
    if values["status"] == "planned":
        session.planned_at = when
        session.held_at = None
        session.duration_minutes = None
        session.topic_category = None
        session.meeting_link = values.get("link")
    else:
        session.held_at = when
        session.duration_minutes = values.get("duration")
        session.topic_category = (values.get("topic") or "").strip() or None
        session.meeting_link = None


def create_session(values: dict, *, user: User) -> Session:
    mentorship_id = values.get("mentorship_id")
    if mentorship_id is None:
        abort(422, message="mentorship_id is required.")
    mentorship = get_mentorship(mentorship_id)
    participant_side(mentorship, user)
    session = Session(mentorship_id=mentorship.id, status=values["status"])
    _apply_values(session, values, user=user)
    db.session.add(session)
    db.session.flush()
    audit.record("log_session", "session", session.id, actor=user, details="Session details saved.")
    db.session.commit()
    return session


def update_session(session: Session, values: dict, *, user: User) -> Session:
    _apply_values(session, values, user=user)
    audit.record("update_session", "session", session.id, actor=user, details="Session details edited.")
    db.session.commit()
    return session


def confirm_session(session: Session, *, user: User) -> Session:
    if session.confirmed_by_user_id is not None:
        abort(409, message="This session is already confirmed.")
    if session.logged_by_user_id == user.id:
        abort(409, message="The other participant confirms a session you logged.")
    session.confirmed_by_user_id = user.id
    audit.record(
        "confirm_session",
        "session",
        session.id,
        actor=user,
        details="Session confirmed by the other participant.",
    )
    db.session.commit()
    return session


def cancel_session(session: Session, *, user: User) -> Session:
    if session.status != "planned":
        abort(409, message="Only a planned session can be cancelled.")
    session.status = "cancelled"
    audit.record("cancel_session", "session", session.id, actor=user, details="Planned session cancelled.")
    db.session.commit()
    return session
