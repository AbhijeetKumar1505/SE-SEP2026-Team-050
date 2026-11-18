from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from . import services
from .schemas import FeedbackSchema, FeedbackWriteSchema

blp = ApiBlueprint(
    "feedback",
    __name__,
    url_prefix="/api/feedback",
    description=("C10 Progress feedback: Progress status from student and mentor, seen only by IIC (US-08, US-12)."),
)


@blp.route("", methods=["POST"])
@blp.stories("US-08")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 422)
@blp.arguments(FeedbackWriteSchema)
@blp.response(201, FeedbackSchema)
def submit_feedback(values):
    """Submit progress feedback

    The student and the mentor each report progress separately: no progress, some progress or goal
    met. The comment is optional. Only IIC reads it; it is never shown to the other participant.
    """
    feedback = services.submit_feedback(values["mentorship_id"], values, user=get_current_user())
    return services.serialize_feedback(feedback)
