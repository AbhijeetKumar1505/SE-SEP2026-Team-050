from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from . import services
from .schemas import CaseCreateSchema, CaseSchema

blp = ApiBlueprint(
    "cases",
    __name__,
    url_prefix="/api/cases",
    description="C8 Cases: Change, end and misconduct cases, decided by IIC (US-07, US-18).",
)


@blp.route("", methods=["POST"])
@blp.stories("US-07")
@blp.auth("student", "mentor")
@blp.errors(403, 404, 409, 422)
@blp.arguments(CaseCreateSchema)
@blp.response(201, CaseSchema)
def open_case(values):
    """Ask IIC to change or end a mentorship

    The student (or the mentor) explains what happened. IIC reviews it and decides; the other
    participant is not told until then. Only one case per mentorship can be open at a time, so a
    second one gets 409.
    """
    case = services.open_case(values["mentorship_id"], values, user=get_current_user())
    return services.serialize_case(case)
