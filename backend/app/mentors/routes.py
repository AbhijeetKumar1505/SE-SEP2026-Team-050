from ..auth import services as auth_services
from ..auth.access import get_current_user
from ..auth.schemas import TokenSchema
from ..auth.tokens import issue_token
from ..openapi import ApiBlueprint
from . import services
from .schemas import (
    ActivateSchema,
    ActivationInfoSchema,
    CapacityRequestAnswerSchema,
    CapacityRequestResponseSchema,
    DashboardSchema,
    DeclineAssignmentSchema,
    DeclineResponseSchema,
    MentorAddSchema,
    MentorImportResultSchema,
    MentorImportSchema,
    MentorProfileSchema,
    MentorProfileUpdateSchema,
    MentorshipDetailSchema,
    MentorshipSummarySchema,
    PoolMentorSchema,
    VerifyMentorSchema,
)

blp = ApiBlueprint(
    "mentors",
    __name__,
    url_prefix="/api/mentors",
    description=("C3 Mentor pool: Verified mentors, their expertise, availability and capacity (US-10, US-14, US-18)."),
)


# IIC's mentor pool (US-14)


@blp.route("")
@blp.stories("US-14")
@blp.auth("iic")
@blp.response(200, PoolMentorSchema(many=True))
def list_mentors():
    """List the mentor pool

    Every mentor IIC has added, by name, with their status (`pending_verification`, `verified`
    while they have not activated yet, `active` or `removed`), expertise, availability and load.
    """
    loads, asked = services.pool_loads()
    return [services.serialize_pool_mentor(mentor, loads, asked) for mentor in services.mentor_pool()]


@blp.route("", methods=["POST"])
@blp.stories("US-14")
@blp.auth("iic")
@blp.errors(409)
@blp.arguments(MentorAddSchema)
@blp.response(201, PoolMentorSchema)
def add_mentor(values):
    """Add one mentor

    The mentor starts as *Pending verification*: they cannot log in, be recommended or be
    assigned until IIC verifies them and they activate their account. 409 if the email already
    has an account.
    """
    mentor = services.add_mentor(values["name"], values["email"], values["headline"], actor=get_current_user())
    return services.serialize_one(mentor)


@blp.route("/import", methods=["POST"])
@blp.stories("US-14")
@blp.auth("iic")
@blp.arguments(MentorImportSchema)
@blp.response(200, MentorImportResultSchema)
def import_mentors(values):
    """Import mentors from a CSV file

    The CSV template has four columns: `name`, `email`, `expertise tags` and `experience`; the last
    two list several values separated by semicolons. The web app reads the file and sends its rows
    here as `name`, `email`, `expertise_tags` and `experience`.

    Valid rows become mentors in *Pending verification*. A mentor whose email is already in the pool
    is updated, not duplicated. Each row is saved whole or not at all: refused rows are returned in
    `errors` with their CSV row number (the header is row 1) and the reason, for example a missing
    name, an invalid email or an unknown topic tag.
    """
    return services.import_mentors(values["file"], values["rows"], actor=get_current_user())


@blp.route("/<int:mentor_id>/verify", methods=["POST"])
@blp.stories("US-14")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.arguments(VerifyMentorSchema)
@blp.response(200, PoolMentorSchema)
def verify_mentor(values, mentor_id):
    """Verify a mentor

    For a mentor in *Pending verification*: sets their expertise tags, records who verified them
    and when, and emails them an activation link that works for 7 days. 409 if the mentor is not
    pending verification; 422 for an unknown tag.
    """
    mentor = services.verify_mentor(mentor_id, values["expertise"], actor=get_current_user())
    return services.serialize_one(mentor)


@blp.route("/<int:mentor_id>/resend-activation", methods=["POST"])
@blp.stories("US-14")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.response(200, PoolMentorSchema)
def resend_activation(mentor_id):
    """Send a new activation link

    For a verified mentor who has not activated their account yet. Older links stop working.
    """
    return services.serialize_one(services.resend_activation(mentor_id, actor=get_current_user()))


@blp.route("/activation/<string:token>")
@blp.stories("US-14")
@blp.errors(404, 410)
@blp.response(200, ActivationInfoSchema)
def activation_info(token):
    """Check an activation link

    No login needed: the mentor opens the link from their email. Returns their name and who in IIC
    verified them. 404 for an unknown or replaced link; 410 for a link that is used or older than
    7 days.
    """
    link = auth_services.activation_link(token)
    mentor = link.user.mentor_profile
    return {"valid": True, "name": mentor.name, "verified_by": auth_services.display_name(mentor.verified_by)}


@blp.route("/activation/<string:token>", methods=["POST"])
@blp.stories("US-14")
@blp.errors(404, 410)
@blp.arguments(ActivateSchema)
@blp.response(200, TokenSchema)
def activate(values, token):
    """Activate a mentor account

    Sets the mentor's password and makes their account active, then logs them in (the same response
    as login). Next they set their availability (US-10); only then can they be recommended.
    """
    user = auth_services.activate_mentor(token, values["password"])
    access_token, expires_in = issue_token(user)
    return {"access_token": access_token, "token_type": "Bearer", "expires_in": expires_in, "user": user}


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
