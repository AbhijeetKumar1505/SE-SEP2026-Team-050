"""C5 and C7 business rules for IIC: the problem queue, review, assignment and closure (US-16).

Kept apart from problems/services.py because assignment needs the mentor pool, which in turn
depends on the mentorship services.
"""

from datetime import timedelta

from flask_smorest import abort

from ..audit import services as audit
from ..auth.models import User
from ..auth.services import display_name
from ..extensions import db
from ..mentors.models import Mentor
from ..mentors.services import assignable_mentors, pool_loads
from ..mentorships.models import Mentorship
from ..models import as_utc, utcnow
from ..notifications import services as notifications
from ..settings.services import timing_hours
from .models import Problem

# The queue: problems IIC still has to act on, problems needing a new mentor first.
QUEUE_STATUSES = ("reassignment_needed", "submitted", "under_review", "awaiting_mentor")
ASSIGNABLE_STATUSES = {"submitted", "under_review", "reassignment_needed"}
CLOSABLE_STATUSES = ASSIGNABLE_STATUSES
LIVE_MENTORSHIP = ("pending", "active")


def queue() -> list[Problem]:
    """Problems waiting for IIC: reassignments first, then the oldest first (US-16)."""
    problems = db.session.query(Problem).filter(Problem.status.in_(QUEUE_STATUSES)).all()
    return sorted(problems, key=lambda p: (p.status != "reassignment_needed", p.submitted_at, p.id))


def get_problem(problem_id: int) -> Problem:
    problem = db.session.get(Problem, problem_id)
    if problem is None:
        abort(404, message=f"No problem with ID {problem_id}.")
    return problem


def open_for_review(problem_id: int, *, actor: User) -> Problem:
    """IIC opens a problem. A submitted problem moves to Under review, which the student sees (US-05)."""
    problem = get_problem(problem_id)
    if problem.status == "submitted":
        problem.status = "under_review"
        audit.record("review_problem", "problem", problem.id, actor=actor, details="IIC opened the problem.")
        db.session.commit()
    return problem


def current_mentorship(problem: Problem) -> Mentorship | None:
    live = [m for m in problem.mentorships if m.status in LIVE_MENTORSHIP]
    return max(live, key=lambda m: m.assigned_at, default=None)


def serialize(problem: Problem) -> dict:
    student = problem.student
    mentorship = current_mentorship(problem)
    pending = mentorship is not None and mentorship.status == "pending"
    respond_by = (
        as_utc(mentorship.assigned_at) + timedelta(hours=timing_hours("assignment_response", 72)) if pending else None
    )
    return {
        "id": problem.id,
        "title": problem.title,
        "status": problem.status,
        "submitted_at": problem.submitted_at,
        "description": problem.description,
        "tags": sorted(tag.name for tag in problem.tags),
        "desired_outcome": problem.desired_outcome,
        "guidance_preferences": problem.guidance_preferences,
        "close_reason": problem.close_reason if problem.status == "closed" else None,
        "closed_at": problem.closed_at,
        "reassign_reason": problem.close_reason if problem.status == "reassignment_needed" else None,
        "student": {
            "name": student.name,
            "roll": student.student_number,
            "email": student.user.email,
            "level": student.programme,
            "cgpa": student.cgpa,
            "career_interest": student.career_interest,
            "courses": student.completed_courses,
        },
        "mentor": mentorship.mentor.name if mentorship else None,
        "assigned_by": display_name(mentorship.assigned_by) if mentorship else None,
        "assigned_at": as_utc(mentorship.assigned_at) if mentorship else None,
        "respond_by": respond_by,
    }


def assign_mentor(problem_id: int, mentor_id: int, *, actor: User) -> Problem:
    """IIC assigns a mentor (US-16). The mentor is asked to accept within the response window (US-09).

    409 when the problem is not waiting for a mentor, the student already has one, the mentor
    cannot take students now, or the mentor is at capacity until they agree to an extra student.
    """
    problem = get_problem(problem_id)
    if problem.status not in ASSIGNABLE_STATUSES:
        abort(409, message="This problem is not waiting for a mentor.")
    student_has_mentor = (
        db.session.query(Mentorship.id)
        .join(Problem, Problem.id == Mentorship.problem_id)
        .filter(Problem.student_id == problem.student_id, Mentorship.status.in_(LIVE_MENTORSHIP))
        .first()
    )
    if student_has_mentor is not None:
        abort(409, message="This student already has a mentor or a pending assignment.")
    mentor = db.session.get(Mentor, mentor_id)
    if mentor is None:
        abort(404, message=f"No mentor with ID {mentor_id}.")
    if assignable_mentors().filter(Mentor.id == mentor.id).first() is None:
        abort(409, message=f"{mentor.name} cannot take students now: not active, or not available.")
    loads, _asked = pool_loads()
    load = loads.get(mentor.id, 0)
    if load >= mentor.capacity:
        abort(
            409,
            message=(
                f"{mentor.name} is at capacity ({load} of {mentor.capacity}). Ask them to take an extra student first."
            ),
        )

    mentorship = Mentorship(problem=problem, mentor=mentor, status="pending", assigned_at=utcnow(), assigned_by=actor)
    db.session.add(mentorship)
    problem.status = "awaiting_mentor"
    problem.close_reason = None
    db.session.flush()
    audit.record("assign_mentor", "mentorship", mentorship.id, actor=actor, details=f"Asked {mentor.name}.")
    notifications.notify(mentor.user, "assignment_notice", link="/mentor", mentor_name=mentor.name)
    notifications.notify(
        problem.student.user,
        "mentor_requested",
        link="/student",
        student_name=problem.student.name,
        title=problem.title,
    )
    db.session.commit()
    return problem


def close_problem(problem_id: int, reason: str, *, actor: User) -> Problem:
    """IIC closes a problem without assigning a mentor, with a reason the student is told (US-16)."""
    problem = get_problem(problem_id)
    if problem.status not in CLOSABLE_STATUSES:
        abort(409, message="Only a problem that is waiting for a mentor can be closed here.")
    reason = " ".join(reason.split())
    problem.status = "closed"
    problem.closed_at = utcnow()
    problem.close_reason = reason
    audit.record("close_problem", "problem", problem.id, actor=actor, details=reason)
    notifications.notify(
        problem.student.user,
        "problem_closed",
        link="/student",
        student_name=problem.student.name,
        title=problem.title,
        reason=reason,
    )
    db.session.commit()
    return problem
