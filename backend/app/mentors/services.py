"""C3 business rules for mentors: dashboard, assignments, capacity and profile (US-10, US-14, US-18)."""

from datetime import timedelta

from flask_smorest import abort

from ..audit import services as audit
from ..extensions import db
from ..mentorships.models import Mentorship
from ..mentorships.services import checkpoint_due, load_steps
from ..models import utcnow
from ..notifications import services as notifications
from ..sessions.services import serialize_session
from ..settings.services import timing_hours
from .models import CapacityRequest, Mentor

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
            "by": open_request.by_user.name,
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
        "assigned_by": mentorship.problem.student.user.email.split("@")[0],
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
