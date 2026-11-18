"""C10 business rules for progress feedback (US-08). Only IIC reads the answers."""

from flask_smorest import abort

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..mentorships.access import participant_side
from ..mentorships.models import Mentorship
from .models import Feedback


def submit_feedback(mentorship_id: int, values: dict, *, user: User) -> Feedback:
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    participant_side(mentorship, user)
    checkpoint = db.session.query(Feedback).filter_by(mentorship_id=mentorship.id, author_user_id=user.id).count() + 1
    feedback = Feedback(
        mentorship_id=mentorship.id,
        author_user_id=user.id,
        progress_status=values["progress_status"],
        comments=(values.get("comment") or "").strip() or None,
        checkpoint_number=checkpoint,
    )
    db.session.add(feedback)
    db.session.flush()
    audit.record("submit_feedback", "feedback", feedback.id, actor=user, details="Progress feedback submitted.")
    db.session.commit()
    return feedback


def serialize_feedback(feedback: Feedback) -> dict:
    return {
        "id": feedback.id,
        "mentorship_id": feedback.mentorship_id,
        "progress_status": feedback.progress_status,
        "comment": feedback.comments,
        "checkpoint_number": feedback.checkpoint_number,
        "submitted_at": feedback.submitted_at,
        "author_side": participant_side(feedback.mentorship, feedback.author),
    }
