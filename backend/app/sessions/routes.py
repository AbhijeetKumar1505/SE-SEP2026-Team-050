from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from . import services
from .schemas import SessionSchema, SessionWriteSchema

blp = ApiBlueprint(
    "sessions",
    __name__,
    url_prefix="/api/sessions",
    description="C9 Sessions: Scheduled and logged sessions, with no conversation content (US-11).",
)


@blp.route("", methods=["POST"])
@blp.stories("US-11")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 422)
@blp.arguments(SessionWriteSchema)
@blp.response(201, SessionSchema)
def create_session(values):
    """Schedule or log a session

    A planned session stores its date and start time; a held session stores its date and duration.
    Only the mentorship's student or mentor may add one, and the API records which side did.
    """
    return services.serialize_session(services.create_session(values, user=get_current_user()))


@blp.route("/<int:session_id>", methods=["PUT"])
@blp.stories("US-11")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 422)
@blp.arguments(SessionWriteSchema)
@blp.response(200, SessionSchema)
def update_session(values, session_id):
    """Edit a session

    Editing the details clears the other participant's confirmation, because a changed session needs
    confirming again.
    """
    session = services.get_participant_session(session_id, user=get_current_user())
    return services.serialize_session(services.update_session(session, values, user=get_current_user()))


@blp.route("/<int:session_id>/confirm", methods=["POST"])
@blp.stories("US-11")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 409)
@blp.response(200, SessionSchema)
def confirm_session(session_id):
    """Confirm a held session

    The participant who did not log the session confirms it. Confirming twice, or confirming your
    own log, gets 409.
    """
    session = services.get_participant_session(session_id, user=get_current_user())
    return services.serialize_session(services.confirm_session(session, user=get_current_user()))


@blp.route("/<int:session_id>/cancel", methods=["POST"])
@blp.stories("US-11")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 409)
@blp.response(200, SessionSchema)
def cancel_session(session_id):
    """Cancel a planned session

    The session stays in the list as cancelled and does not count as held. Only a planned session
    can be cancelled; anything else gets 409.
    """
    session = services.get_participant_session(session_id, user=get_current_user())
    return services.serialize_session(services.cancel_session(session, user=get_current_user()))
