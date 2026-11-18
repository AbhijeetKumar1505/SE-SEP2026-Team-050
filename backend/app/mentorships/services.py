"""C7 business rules for a mentorship: goal, next steps, reaching out and the student's view (US-05, US-06)."""

import json
import re
import uuid
from datetime import timedelta

from flask_smorest import abort
from sqlalchemy import func

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..feedback.models import Feedback
from ..models import utcnow
from ..problems.models import Problem
from ..sessions.services import serialize_session
from ..settings.services import timing_hours
from .access import participant_side
from .models import Mentorship

LEGACY_STEP = re.compile(r"(?:^|\s)\d+\.\s*|\s*;\s*|\n+")


def active_mentorship_for(student_id: int) -> Mentorship | None:
    """The student's current mentorship, if a mentor has accepted and it has not ended."""
    return (
        db.session.query(Mentorship)
        .join(Problem)
        .filter(Problem.student_id == student_id, Mentorship.status == "active")
        .order_by(Mentorship.assigned_at.desc(), Mentorship.id.desc())
        .first()
    )


def get_participant_mentorship(mentorship_id: int, *, user: User) -> Mentorship:
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    participant_side(mentorship, user)
    return mentorship


def load_steps(mentorship: Mentorship) -> list[dict]:
    """Next steps are stored as JSON. Older rows hold plain text, which is split into steps."""
    text = (mentorship.next_steps or "").strip()
    if not text:
        return []
    try:
        data = json.loads(text)
    except (TypeError, ValueError):
        data = None
    if isinstance(data, list):
        steps = []
        for index, item in enumerate(data):
            if isinstance(item, dict) and item.get("text"):
                steps.append(
                    {
                        "id": str(item.get("id") or f"step-{index + 1}"),
                        "text": str(item["text"]),
                        "done": bool(item.get("done")),
                    }
                )
            elif isinstance(item, str) and item.strip():
                steps.append({"id": f"step-{index + 1}", "text": item.strip(), "done": False})
        return steps
    return [
        {"id": f"step-{index + 1}", "text": part.strip(), "done": False}
        for index, part in enumerate(part for part in LEGACY_STEP.split(text) if part.strip())
    ]


def save_steps(mentorship: Mentorship, steps: list[dict]) -> None:
    mentorship.next_steps = json.dumps(steps)


def checkpoint_due(mentorship: Mentorship):
    """The student's next feedback checkpoint: the last student feedback plus IIC's interval."""
    hours = timing_hours("feedback_checkpoint", 336)
    student_user_id = mentorship.problem.student.user_id
    latest = (
        db.session.query(func.max(Feedback.submitted_at))
        .filter(Feedback.mentorship_id == mentorship.id, Feedback.author_user_id == student_user_id)
        .scalar()
    )
    base = latest or mentorship.reached_out_at or mentorship.assigned_at or utcnow()
    return (base + timedelta(hours=hours)).date()


def serialize_mentor(mentor) -> dict:
    biography = (mentor.biography or "").strip()
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", biography) if part.strip()]
    experience = sentences[:3] or ([mentor.organisation] if mentor.organisation else [])
    slots = ", ".join(f"{slot.day_of_week} {slot.start_time}–{slot.end_time}" for slot in mentor.availabilities)
    availability = slots or "Flexible"
    return {
        "name": mentor.name,
        "headline": mentor.organisation or (sentences[0] if sentences else "Mentor"),
        "contact": mentor.user.email,
        "channel": mentor.preferred_channel or "Google Meet",
        "availability": availability,
        "time_zone": mentor.time_zone or "Asia/Kolkata",
        "expertise": [tag.name for tag in mentor.tags],
        "experience": experience,
    }


def serialize_mentorship(mentorship: Mentorship) -> dict:
    return {
        "id": mentorship.id,
        "status": mentorship.status,
        "goal": mentorship.goal,
        "steps": load_steps(mentorship),
        "assigned_at": mentorship.assigned_at,
        "answered_at": mentorship.answered_at,
        "reached_out_at": mentorship.reached_out_at,
        "ended_at": mentorship.ended_at,
        "end_reason": mentorship.end_reason,
        "checkpoint_due": checkpoint_due(mentorship),
        "case_open": any(case.status == "under_review" for case in mentorship.cases),
        "topics": [tag.name for tag in mentorship.problem.tags],
        "mentor": serialize_mentor(mentorship.mentor),
        "sessions": [serialize_session(session) for session in mentorship.sessions],
    }


def mark_reached_out(mentorship: Mentorship, *, actor: User) -> None:
    if mentorship.reached_out_at is None:
        mentorship.reached_out_at = utcnow()
        audit.record(
            "mark_reached_out",
            "mentorship",
            mentorship.id,
            actor=actor,
            details="Student made first contact.",
        )
        db.session.commit()


def update_goal(mentorship: Mentorship, goal: str, *, actor: User) -> Mentorship:
    mentorship.goal = goal.strip()
    audit.record("update_goal", "mentorship", mentorship.id, actor=actor, details="Mentorship goal updated.")
    db.session.commit()
    return mentorship


def add_step(mentorship: Mentorship, text: str, *, actor: User) -> list[dict]:
    steps = load_steps(mentorship)
    steps.append({"id": uuid.uuid4().hex, "text": text.strip(), "done": False})
    save_steps(mentorship, steps)
    audit.record("add_next_step", "mentorship", mentorship.id, actor=actor, details="Next step added.")
    db.session.commit()
    return steps


def toggle_step(mentorship: Mentorship, step_id: str, *, actor: User) -> list[dict]:
    steps = load_steps(mentorship)
    step = next((item for item in steps if item["id"] == step_id), None)
    if step is None:
        abort(404, message=f"No next step with ID {step_id}.")
    step["done"] = not step["done"]
    save_steps(mentorship, steps)
    audit.record(
        "toggle_next_step",
        "mentorship",
        mentorship.id,
        actor=actor,
        details="Next step marked done or not done.",
    )
    db.session.commit()
    return steps


def delete_step(mentorship: Mentorship, step_id: str, *, actor: User) -> list[dict]:
    steps = load_steps(mentorship)
    if not any(item["id"] == step_id for item in steps):
        abort(404, message=f"No next step with ID {step_id}.")
    steps = [item for item in steps if item["id"] != step_id]
    save_steps(mentorship, steps)
    audit.record("delete_next_step", "mentorship", mentorship.id, actor=actor, details="Next step removed.")
    db.session.commit()
    return steps
