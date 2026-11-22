from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from . import services
from .schemas import (
    CapacityRequestAnswerSchema,
    CapacityRequestResponseSchema,
    DashboardSchema,
    DeclineAssignmentSchema,
    DeclineResponseSchema,
    MentorProfileSchema,
    MentorProfileUpdateSchema,
    MentorshipDetailSchema,
    MentorshipSummarySchema,
)

blp = ApiBlueprint(
    "mentors",
    __name__,
    url_prefix="/api/mentors",
    description=("C3 Mentor pool: Verified mentors, their expertise, availability and capacity (US-10, US-14, US-18)."),
)


@blp.route("/me/dashboard")
@blp.stories("US-10")
@blp.auth("mentor")
@blp.response(200, DashboardSchema)
def dashboard():
    """My mentor dashboard

    Capacity and load, pending assignments waiting for a response, active mentorships,
    session stats this month and the next progress-feedback checkpoint.
    """
    return services.get_dashboard(get_current_user().mentor_profile)


@blp.route("/me")
@blp.stories("US-10")
@blp.auth("mentor")
@blp.response(200, MentorProfileSchema)
def get_profile():
    """Get my profile

    Availability, contact details, capacity and expertise. Capacity and expertise are
    read-only here; they are set by IIC.
    """
    return services.get_mentor_profile(get_current_user().mentor_profile)


@blp.route("/me", methods=["PUT"])
@blp.stories("US-10")
@blp.auth("mentor")
@blp.errors(422)
@blp.arguments(MentorProfileUpdateSchema)
@blp.response(200, MentorProfileSchema)
def update_profile(values):
    """Update my availability and contact details

    Saves whether the mentor is available for new students, their preferred channel,
    contact details, when they are free and their time zone.
    """
    return services.update_mentor_profile(get_current_user().mentor_profile, values)


@blp.route("/capacity-requests/<int:request_id>/answer", methods=["POST"])
@blp.stories("US-18")
@blp.auth("mentor")
@blp.errors(403, 404, 409)
@blp.arguments(CapacityRequestAnswerSchema)
@blp.response(200, CapacityRequestResponseSchema)
def answer_capacity_request(values, request_id):
    """Accept or decline a capacity increase request

    IIC asks whether the mentor can take on one more student. Accepting raises the
    mentor's capacity by one; declining leaves it unchanged.
    """
    return services.answer_capacity_request(request_id, values["accept"], get_current_user().mentor_profile)


@blp.route("/mentorships/<int:mentorship_id>/accept", methods=["POST"])
@blp.stories("US-05", "US-09")
@blp.auth("mentor")
@blp.errors(403, 404, 409)
@blp.response(200, MentorshipSummarySchema)
def accept_assignment(mentorship_id):
    """Accept a pending assignment

    Activates the mentorship, notifies the student and moves the problem to
    "mentor assigned". Only the assigned mentor may accept.
    """
    return services.accept_assignment(mentorship_id, get_current_user().mentor_profile)


@blp.route("/mentorships/<int:mentorship_id>/decline", methods=["POST"])
@blp.stories("US-05", "US-09")
@blp.auth("mentor")
@blp.errors(403, 404, 409, 422)
@blp.arguments(DeclineAssignmentSchema)
@blp.response(200, DeclineResponseSchema)
def decline_assignment(values, mentorship_id):
    """Decline a pending assignment

    The problem goes back to IIC's queue so another mentor can be assigned.
    Only the assigned mentor may decline.
    """
    return services.decline_assignment(
        mentorship_id, values["reason"], values.get("note"), get_current_user().mentor_profile
    )


@blp.route("/mentorships/<int:mentorship_id>")
@blp.stories("US-10")
@blp.auth("mentor")
@blp.errors(403, 404)
@blp.response(200, MentorshipDetailSchema)
def get_mentorship(mentorship_id):
    """Get a mentorship's detail

    The mentor's view of an active mentorship: student, start date, sessions held
    and the next planned session.
    """
    return services.get_mentorship_detail(mentorship_id, get_current_user().mentor_profile)
