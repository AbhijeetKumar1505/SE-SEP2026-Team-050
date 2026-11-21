from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from ..students.services import get_student
from . import services
from .schemas import (
    MentorshipSchema,
    MentorshipUpdateSchema,
    MyMentorshipSchema,
    StepSchema,
    StepWriteSchema,
)

blp = ApiBlueprint(
    "mentorships",
    __name__,
    url_prefix="/api/mentorships",
    description=(
        "C7 Mentorships: Assignment, accept or decline, goal, next steps and ending"
        " (US-05, US-06, US-09, US-13, US-16)."
    ),
)


@blp.route("/me")
@blp.stories("US-05", "US-06")
@blp.auth("student")
@blp.errors(404)
@blp.response(200, MyMentorshipSchema)
def my_mentorship():
    """Get my mentorship

    The student's active mentorship, with the mentor's contact details, the goal, next steps, sessions
    and the next feedback checkpoint. `mentorship` is null until a mentor accepts.
    """
    student = get_student(get_current_user())
    mentorship = services.active_mentorship_for(student.id)
    return {"mentorship": services.serialize_mentorship(mentorship) if mentorship is not None else None}


@blp.route("/<int:mentorship_id>", methods=["PUT"])
@blp.stories("US-06")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 422)
@blp.arguments(MentorshipUpdateSchema)
@blp.response(200, MentorshipSchema)
def update_goal(values, mentorship_id):
    """Update the mentorship goal

    Either participant may reword the goal they are working towards. It is shared with the other
    participant and with IIC.
    """
    mentorship = services.get_participant_mentorship(mentorship_id, user=get_current_user())
    return services.serialize_mentorship(services.update_goal(mentorship, values["goal"], actor=get_current_user()))


@blp.route("/<int:mentorship_id>/reached-out", methods=["POST"])
@blp.stories("US-05")
@blp.auth("student")
@blp.errors(403, 404)
@blp.response(204)
def mark_reached_out(mentorship_id):
    """Record that I reached out

    The student makes the first contact themselves; this records the date so the mentor and IIC can
    see it. Sending it again changes nothing.
    """
    mentorship = services.get_participant_mentorship(mentorship_id, user=get_current_user())
    services.mark_reached_out(mentorship, actor=get_current_user())


@blp.route("/<int:mentorship_id>/steps", methods=["POST"])
@blp.stories("US-06")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 422)
@blp.arguments(StepWriteSchema)
@blp.response(201, StepSchema(many=True))
def add_step(values, mentorship_id):
    """Add a next step

    Both participants share one checklist. The response is the updated list.
    """
    mentorship = services.get_participant_mentorship(mentorship_id, user=get_current_user())
    return services.add_step(mentorship, values["text"], actor=get_current_user())


@blp.route("/<int:mentorship_id>/steps/<string:step_id>/toggle", methods=["POST"])
@blp.stories("US-06")
@blp.auth("student", "mentor")
@blp.errors(403, 404)
@blp.response(200, StepSchema(many=True))
def toggle_step(mentorship_id, step_id):
    """Mark a next step done or not done

    The response is the updated list.
    """
    mentorship = services.get_participant_mentorship(mentorship_id, user=get_current_user())
    return services.toggle_step(mentorship, step_id, actor=get_current_user())


@blp.route("/<int:mentorship_id>/steps/<string:step_id>", methods=["DELETE"])
@blp.stories("US-06")
@blp.auth("student", "mentor")
@blp.errors(403, 404)
@blp.response(200, StepSchema(many=True))
def delete_step(mentorship_id, step_id):
    """Remove a next step

    The response is the updated list.
    """
    mentorship = services.get_participant_mentorship(mentorship_id, user=get_current_user())
    return services.delete_step(mentorship, step_id, actor=get_current_user())
