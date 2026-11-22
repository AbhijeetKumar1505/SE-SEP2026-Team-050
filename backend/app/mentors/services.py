"""C3 business rules for mentors: the pool, dashboard, assignments, capacity and profile (US-10, US-14, US-18)."""

import re
from datetime import timedelta

from flask_smorest import abort
from sqlalchemy import func

from ..audit import services as audit
from ..auth.models import MENTOR, User
from ..auth.services import display_name, get_roles, normalize_email, send_activation_link
from ..extensions import db
from ..mentorships.models import Mentorship
from ..mentorships.services import checkpoint_due, load_steps
from ..models import utcnow
from ..notifications import services as notifications
from ..sessions.services import serialize_session
from ..settings.models import TopicTag
from ..settings.services import timing_hours
from .models import ACTIVE, PENDING, VERIFIED, CapacityRequest, Mentor

PENDING_STATUSES = {"pending"}
ACTIVE_STATUSES = {"active"}


def get_dashboard(mentor: Mentor) -> dict:
    """The mentor's dashboard: capacity, load, pending assignments and active mentorships."""
    pending = (
        db.session.query(Mentorship)
        .filter_by(mentor_id=mentor.id, status="pending")
        .order_by(Mentorship.assigned_at.asc())
        .all()
    )
    active = (
        db.session.query(Mentorship)
        .filter_by(mentor_id=mentor.id, status="active")
        .order_by(Mentorship.assigned_at.desc())
        .all()
    )

    assignments = [serialize_assignment(m) for m in pending]

    now = utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    sessions_this_month = 0
    confirmed_this_month = 0
    for m in active:
        for s in m.sessions:
            if s.status == "held" and s.held_at and s.held_at >= month_start:
                sessions_this_month += 1
                if s.confirmed_by_user_id is not None:
                    confirmed_this_month += 1

    next_checkpoint = None
    if active:
        earliest = min(m for m in active if (m.reached_out_at or m.assigned_at) is not None)
        base = earliest.reached_out_at or earliest.assigned_at
        due = base + timedelta(hours=timing_hours("feedback_checkpoint", 336))
        student = earliest.problem.student
        next_checkpoint = {
            "date": due.date().isoformat(),
            "student": {"name": student.name},
        }

    capacity_request = None
    open_request = (
        db.session.query(CapacityRequest)
        .filter_by(mentor_id=mentor.id, status="pending")
        .order_by(CapacityRequest.created_at.desc())
        .first()
    )
    if open_request is not None:
        capacity_request = {
            "id": open_request.id,
            "by": display_name(open_request.by_user),
            "from": open_request.mentor.capacity,
            "to": open_request.mentor.capacity + 1,
        }

    return {
        "capacity": mentor.capacity,
        "load": len(active),
        "assignments": assignments,
        "mentorships": [serialize_mentorship_summary(m) for m in active],
        "sessions_this_month": sessions_this_month,
        "confirmed": confirmed_this_month,
        "next_checkpoint": next_checkpoint,
        "capacity_request": capacity_request,
    }


def serialize_assignment(mentorship) -> dict:
    """A pending assignment waiting for the mentor's accept / decline."""
    problem = mentorship.problem
    student = problem.student
    assigned_at = mentorship.assigned_at or utcnow()
    deadline = assigned_at + timedelta(hours=timing_hours("assignment_response", 72))
    return {
        "id": mentorship.id,
        "assigned_by": display_name(mentorship.assigned_by) or "IIC",
        "assigned_at": assigned_at,
        "tags": [tag.name for tag in problem.tags],
        "problem": problem.description,
        "goal": problem.desired_outcome,
        "student": {
            "name": student.name,
            "level": student.programme,
            "career_interest": student.career_interest,
            "courses": student.completed_courses,
        },
        "deadline": deadline,
    }


def serialize_mentorship_summary(mentorship) -> dict:
    """A compact view of an active mentorship for the dashboard table."""
    held = [s for s in mentorship.sessions if s.status == "held"]
    planned = [s for s in mentorship.sessions if s.status == "planned"]
    next_session = None
    if planned:
        next_session = min(planned, key=lambda s: s.planned_at or utcnow())
    return {
        "id": mentorship.id,
        "student": {
            "name": mentorship.problem.student.name,
        },
        "started_at": mentorship.assigned_at,
        "held": len(held),
        "next_session": {
            "date": next_session.planned_at.date().isoformat() if next_session and next_session.planned_at else None,
            "time": next_session.planned_at.strftime("%H:%M") if next_session and next_session.planned_at else None,
        }
        if next_session
        else None,
    }


def accept_assignment(mentorship_id: int, mentor: Mentor) -> dict:
    """Accept a pending assignment: activate the mentorship and notify the student."""
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    if mentorship.mentor_id != mentor.id:
        abort(403, message="This assignment is not yours.")
    if mentorship.status != "pending":
        abort(409, message="This assignment is no longer pending.")

    problem = mentorship.problem
    problem.status = "mentor_assigned"
    mentorship.status = "active"
    mentorship.answered_at = utcnow()
    db.session.flush()

    student_user = problem.student.user
    notifications.notify(
        student_user,
        "acceptance_notice",
        link="/student/mentorship",
        student_name=problem.student.name,
        mentor_name=mentor.name,
    )
    audit.record(
        "accept_assignment",
        "mentorship",
        mentorship.id,
        actor=mentor.user,
        details=f"Mentor {mentor.name} accepted assignment for problem {problem.id}.",
    )
    db.session.commit()
    return serialize_mentorship_summary(mentorship)


def decline_assignment(mentorship_id: int, reason: str, note: str, mentor: Mentor) -> dict:
    """Decline a pending assignment: remove it and return the problem to IIC's queue."""
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    if mentorship.mentor_id != mentor.id:
        abort(403, message="This assignment is not yours.")
    if mentorship.status != "pending":
        abort(409, message="This assignment is no longer pending.")

    problem = mentorship.problem
    problem.status = "reassignment_needed"
    problem.close_reason = f"{mentor.name} declined: {reason}" + (f" — {note}" if note else "")
    db.session.delete(mentorship)
    audit.record(
        "decline_assignment",
        "mentorship",
        mentorship_id,
        actor=mentor.user,
        details=f"Mentor {mentor.name} declined assignment for problem {problem.id}.",
    )
    db.session.commit()
    return {"id": problem.id, "status": problem.status}


def answer_capacity_request(request_id: int, accept: bool, mentor: Mentor) -> dict:
    """Accept or decline IIC's request to increase this mentor's capacity."""
    request = db.session.get(CapacityRequest, request_id)
    if request is None:
        abort(404, message=f"No capacity request with ID {request_id}.")
    if request.mentor_id != mentor.id:
        abort(403, message="This capacity request is not yours.")
    if request.status != "pending":
        abort(409, message="This capacity request has already been answered.")

    request.status = "accepted" if accept else "declined"
    request.responded_at = utcnow()
    if accept:
        mentor.capacity += 1
    audit.record(
        "answer_capacity_request",
        "capacity_request",
        request.id,
        actor=mentor.user,
        details=f"Mentor {mentor.name} {'accepted' if accept else 'declined'} a capacity increase.",
    )
    db.session.commit()
    return {"id": request.id, "status": request.status, "capacity": mentor.capacity}


def get_mentor_profile(mentor: Mentor) -> dict:
    """The mentor's profile: availability, contact, capacity and expertise."""
    return {
        "id": mentor.id,
        "name": mentor.name,
        "available": mentor.available,
        "channel": mentor.preferred_channel,
        "contact": mentor.contact or "",
        "availability": mentor.mentoring_style or "",
        "timezone": mentor.time_zone,
        "capacity": mentor.capacity,
        "expertise": [tag.name for tag in mentor.tags],
        "experience": [mentor.organisation] if mentor.organisation else [],
    }


def update_mentor_profile(mentor: Mentor, values: dict) -> dict:
    """Update the mentor's availability and contact details. Capacity and expertise are read-only."""
    mentor.available = values.get("available", mentor.available)
    mentor.preferred_channel = values.get("channel", mentor.preferred_channel)
    mentor.contact = values.get("contact", mentor.contact)
    mentor.mentoring_style = values.get("availability", mentor.mentoring_style)
    mentor.time_zone = values.get("timezone", mentor.time_zone)
    audit.record(
        "update_mentor_profile",
        "mentor",
        mentor.id,
        actor=mentor.user,
        details="Mentor updated availability and contact details.",
    )
    db.session.commit()
    return get_mentor_profile(mentor)


def get_mentorship_detail(mentorship_id: int, mentor: Mentor) -> dict:
    """A mentorship's full detail for the mentor workspace."""
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    if mentorship.mentor_id != mentor.id:
        abort(403, message="This mentorship is not yours.")
    student = mentorship.problem.student
    student_user = student.user
    return {
        "id": mentorship.id,
        "status": mentorship.status,
        "goal": mentorship.goal,
        "steps": load_steps(mentorship),
        "assigned_at": mentorship.assigned_at,
        "answered_at": mentorship.answered_at,
        "reached_out_at": mentorship.reached_out_at,
        "checkpoint_due": checkpoint_due(mentorship),
        "topics": [tag.name for tag in mentorship.problem.tags],
        "problem": mentorship.problem.description,
        "student": {
            "name": student.name,
            "email": student_user.email,
            "level": student.programme,
            "careerInterest": student.career_interest,
            "courses": student.completed_courses,
        },
        "mentor": {
            "name": mentor.name,
            "contact": mentor.contact or "",
            "channel": mentor.preferred_channel,
            "availability": mentor.mentoring_style or "",
            "timezone": mentor.time_zone,
        },
        "sessions": [serialize_session(session) for session in mentorship.sessions],
    }


# IIC's mentor pool (US-14): add or import mentors, verify them, and send their activation links.

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_TEXT = 200


def assignable_mentors():
    """Mentors who may be recommended or assigned: active, available, with a verified account (US-14).

    Pending and verified-but-not-activated mentors never appear. Recommendations (US-04) and
    assignment (US-16) must start from this query.
    """
    return (
        db.session.query(Mentor)
        .join(User, User.id == Mentor.user_id)
        .filter(Mentor.verification_status == ACTIVE, Mentor.available.is_(True), User.email_verified_at.isnot(None))
    )


def mentor_pool() -> list[Mentor]:
    return db.session.query(Mentor).order_by(Mentor.name, Mentor.id).all()


def pool_loads() -> tuple[dict[int, int], set[int]]:
    """Each mentor's load (pending and active mentorships) and who has an open capacity request."""
    loads = dict(
        db.session.query(Mentorship.mentor_id, func.count(Mentorship.id))
        .filter(Mentorship.status.in_(PENDING_STATUSES | ACTIVE_STATUSES))
        .group_by(Mentorship.mentor_id)
        .all()
    )
    asked = {mentor_id for (mentor_id,) in db.session.query(CapacityRequest.mentor_id).filter_by(status="pending")}
    return loads, asked


def serialize_pool_mentor(mentor: Mentor, loads: dict[int, int], asked: set[int]) -> dict:
    return {
        "id": mentor.id,
        "name": mentor.name,
        "email": mentor.user.email,
        "headline": mentor.headline,
        "status": mentor.verification_status,
        "available": mentor.available,
        "capacity": mentor.capacity,
        "load": loads.get(mentor.id, 0),
        "expertise": sorted(tag.name for tag in mentor.tags),
        "experience": mentor.experience or [],
        "channel": mentor.preferred_channel,
        "contact": mentor.contact,
        "timezone": mentor.time_zone,
        "availability": [f"{a.day_of_week} {a.start_time}-{a.end_time}" for a in mentor.availabilities],
        "capacity_requested": mentor.id in asked,
        "verified_by": display_name(mentor.verified_by),
        "verified_at": mentor.verified_at,
    }


def serialize_one(mentor: Mentor) -> dict:
    loads, asked = pool_loads()
    return serialize_pool_mentor(mentor, loads, asked)


def get_pool_mentor(mentor_id: int) -> Mentor:
    mentor = db.session.get(Mentor, mentor_id)
    if mentor is None:
        abort(404, message=f"No mentor with ID {mentor_id}.")
    return mentor


def _split(text) -> list[str]:
    """CSV cells list several values separated by semicolons: "SQL and database design; Data engineering"."""
    return [part.strip() for part in (text or "").split(";") if part.strip()]


def _tags_by_name() -> dict[str, TopicTag]:
    return {tag.name.lower(): tag for tag in db.session.query(TopicTag).filter_by(retired=False)}


def _pick_tags(names: list[str], tags: dict[str, TopicTag]) -> list[TopicTag]:
    """The tags named, each once: names match whatever their capitalisation."""
    return list({name.strip().lower(): tags[name.strip().lower()] for name in names}.values())


def _new_mentor(name: str, email: str, *, headline=None) -> Mentor:
    user = User(email=email, roles=get_roles([MENTOR]))  # no password until the mentor activates
    mentor = Mentor(user=user, name=name, headline=headline, verification_status=PENDING, available=False)
    db.session.add(mentor)
    return mentor


def add_mentor(name: str, email: str, headline: str | None, *, actor: User) -> Mentor:
    """Add one mentor as pending verification. 409 if the email already has an account."""
    email = normalize_email(email)
    if db.session.query(User.id).filter_by(email=email).first() is not None:
        abort(409, message="A mentor or another account with this email already exists.")
    mentor = _new_mentor(" ".join(name.split()), email, headline=(headline or "").strip() or None)
    db.session.flush()
    audit.record("add_mentor", "mentor", mentor.id, actor=actor, details=f"Added {email}.")
    db.session.commit()
    return mentor


def _mentor_row_problem(name, email, expertise, experience, unknown, user, seen) -> str | None:
    if not name:
        return "Name is missing."
    if len(name) > 128:
        return "Name is longer than 128 characters."
    if not EMAIL.match(email) or len(email) > 254:
        return "Email is not valid."
    if email in seen:
        return f"Email {email} is already in row {seen[email]} of this file."
    if unknown:
        return f"Unknown topic tag: {unknown[0]}."
    if any(len(entry) > MAX_TEXT for entry in experience):
        return f"An experience entry is longer than {MAX_TEXT} characters."
    if user is not None and user.mentor_profile is None:
        return f"Email {email} belongs to an account that is not a mentor."
    return None


def import_mentors(file_name: str, rows: list[dict], *, actor: User) -> dict:
    """US-14: add mentors from CSV rows as pending verification, or update those already added.

    A row is saved whole or not at all. A refused row is reported with its CSV row number (the
    header is row 1) and the reason. An email already used by a student or staff account is refused.
    """
    tags = _tags_by_name()
    emails = [normalize_email(row.get("email") or "") for row in rows]
    users = {user.email: user for user in db.session.query(User).filter(User.email.in_(emails))}
    seen: dict[str, int] = {}
    added = updated = 0
    errors = []

    for row_number, (row, email) in enumerate(zip(rows, emails, strict=True), start=2):
        name = " ".join((row.get("name") or "").split())
        expertise = _split(row.get("expertise_tags"))
        experience = _split(row.get("experience"))
        unknown = [tag for tag in expertise if tag.lower() not in tags]
        user = users.get(email)
        reason = _mentor_row_problem(name, email, expertise, experience, unknown, user, seen)
        if reason is not None:
            errors.append({"row": row_number, "reason": reason})
            continue

        seen[email] = row_number
        if user is None:
            mentor = _new_mentor(name, email)
            users[email] = mentor.user
            added += 1
        else:
            mentor = user.mentor_profile
            mentor.name = name
            updated += 1
        mentor.tags = _pick_tags(expertise, tags)
        mentor.experience = experience

    audit.record(
        "import_mentors",
        "mentor",
        None,
        actor=actor,
        details=f"{file_name}: {added} added, {updated} updated, {len(errors)} rows refused.",
    )
    db.session.commit()
    return {
        "file": file_name,
        "imported_by": actor.email,
        "imported_at": utcnow(),
        "added": added,
        "updated": updated,
        "errors": errors,
    }


def verify_mentor(mentor_id: int, expertise: list[str], *, actor: User) -> Mentor:
    """IIC verifies a pending mentor: records who and when, sets their expertise, emails the activation link."""
    mentor = get_pool_mentor(mentor_id)
    if mentor.verification_status != PENDING:
        abort(409, message=f"{mentor.name} is not pending verification.")
    tags = _tags_by_name()
    unknown = [tag for tag in expertise if tag.strip().lower() not in tags]
    if unknown:
        abort(422, message=f"Unknown topic tag: {unknown[0]}.")
    mentor.tags = _pick_tags(expertise, tags)
    mentor.verification_status = VERIFIED
    mentor.verified_at = utcnow()
    mentor.verified_by = actor
    send_activation_link(mentor)
    audit.record("verify_mentor", "mentor", mentor.id, actor=actor, details="Verified; activation link sent.")
    db.session.commit()
    return mentor


def resend_activation(mentor_id: int, *, actor: User) -> Mentor:
    """Send a verified mentor a new activation link. Their older links stop working."""
    mentor = get_pool_mentor(mentor_id)
    if mentor.verification_status != VERIFIED:
        abort(409, message=f"{mentor.name} is not waiting to activate their account.")
    send_activation_link(mentor)
    audit.record("resend_activation", "mentor", mentor.id, actor=actor, details="Activation link sent again.")
    db.session.commit()
    return mentor
