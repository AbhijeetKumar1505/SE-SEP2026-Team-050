"""Who may act on a mentorship: its student or its mentor."""

from flask_smorest import abort

from ..auth.models import User
from .models import Mentorship


def participant_side(mentorship: Mentorship, user: User) -> str:
    """Return "student" or "mentor" for a participant; 403 for anyone else."""
    if mentorship.problem.student.user_id == user.id:
        return "student"
    if mentorship.mentor.user_id == user.id:
        return "mentor"
    abort(403, message="You are not part of this mentorship.")
