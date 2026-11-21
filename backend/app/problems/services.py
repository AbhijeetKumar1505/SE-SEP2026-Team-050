"""C5 business rules for students' problems (US-03, US-05)."""

from flask_smorest import abort

from ..audit import services as audit
from ..auth.access import require_owner_or
from ..auth.models import User
from ..extensions import db
from ..models import utcnow
from ..settings.models import TopicTag
from ..students.services import is_complete, require_on_roster
from .models import Problem

# A student may edit or withdraw until a mentor accepts.
EDITABLE_STATUSES = {"submitted", "under_review", "awaiting_mentor"}
# These mean the student already has a problem in the queue or with a mentor.
OPEN_STATUSES = {"submitted", "under_review", "awaiting_mentor", "mentor_assigned", "reassignment_needed"}


def latest_problem(student_id: int) -> Problem | None:
    """The student's most recent problem, whatever its status."""
    return (
        db.session.query(Problem)
        .filter(Problem.student_id == student_id)
        .order_by(Problem.submitted_at.desc(), Problem.id.desc())
        .first()
    )


def has_open_problem(student_id: int) -> bool:
    return (
        db.session.query(Problem.id).filter(Problem.student_id == student_id, Problem.status.in_(OPEN_STATUSES)).first()
        is not None
    )


def get_owned_problem(problem_id: int, *, user: User) -> Problem:
    problem = db.session.get(Problem, problem_id)
    if problem is None:
        abort(404, message=f"No problem with ID {problem_id}.")
    require_owner_or(problem.student.user_id)
    return problem


def serialize_problem(problem: Problem) -> dict:
    return {
        "id": problem.id,
        "title": problem.title,
        "description": problem.description,
        "status": problem.status,
        "submitted_at": problem.submitted_at,
        "closed_at": problem.closed_at,
        "close_reason": problem.close_reason,
        "desired_outcome": problem.desired_outcome,
        "guidance_preferences": problem.guidance_preferences,
        "tags": [tag.name for tag in problem.tags],
    }


def derive_title(description: str) -> str:
    """The form asks for a description, not a title, so the first line becomes a short title."""
    text = " ".join(description.split())
    return text[:120].rstrip() + ("…" if len(text) > 120 else "")


def _resolve_tags(names: list[str]) -> list[TopicTag]:
    tags = db.session.query(TopicTag).filter(TopicTag.name.in_(names)).all()
    by_name = {tag.name: tag for tag in tags}
    missing = [name for name in names if name not in by_name]
    if missing:
        abort(
            422,
            message="Some topic tags are not in IIC's list.",
            errors={"json": {"tags": [f"Unknown topic tag {name!r}." for name in missing]}},
        )
    retired = [name for name in names if by_name[name].retired]
    if retired:
        abort(
            422,
            message="Some topic tags have been retired.",
            errors={"json": {"tags": [f"Topic tag {name!r} is retired." for name in retired]}},
        )
    return [by_name[name] for name in names]


def submit_problem(student, values: dict, *, actor: User) -> Problem:
    require_on_roster(student)
    if not is_complete(student):
        abort(409, message="Complete your profile first.")
    if has_open_problem(student.id):
        abort(409, message="You already have an open problem.")
    problem = Problem(
        student_id=student.id,
        title=derive_title(values["description"]),
        description=values["description"].strip(),
        status="submitted",
        desired_outcome=values["desired_outcome"].strip(),
        guidance_preferences=(values.get("guidance_preferences") or "").strip() or None,
        tags=_resolve_tags(values["tags"]),
    )
    db.session.add(problem)
    db.session.flush()
    audit.record("submit_problem", "problem", problem.id, actor=actor, details="Student submitted a problem.")
    db.session.commit()
    return problem


def update_problem(problem: Problem, values: dict, *, actor: User) -> Problem:
    if problem.status not in EDITABLE_STATUSES:
        abort(409, message="This request can no longer be edited.")
    problem.title = derive_title(values["description"])
    problem.description = values["description"].strip()
    problem.desired_outcome = values["desired_outcome"].strip()
    problem.guidance_preferences = (values.get("guidance_preferences") or "").strip() or None
    problem.tags = _resolve_tags(values["tags"])
    audit.record("update_problem", "problem", problem.id, actor=actor, details="Student edited their problem.")
    db.session.commit()
    return problem


def withdraw_problem(problem: Problem, *, actor: User) -> Problem:
    if problem.status not in EDITABLE_STATUSES:
        abort(409, message="This request can no longer be withdrawn.")
    problem.status = "withdrawn"
    problem.closed_at = utcnow()
    problem.close_reason = "Withdrawn by the student."
    audit.record("withdraw_problem", "problem", problem.id, actor=actor, details="Student withdrew their problem.")
    db.session.commit()
    return problem
