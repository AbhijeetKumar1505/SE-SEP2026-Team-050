from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "mentorships",
    __name__,
    url_prefix="/api/mentorships",
    description=(
        "C7 Mentorships: Assignment, accept or decline, goal, next steps and ending"
        " (US-05, US-06, US-09, US-13, US-16)."
    ),
)
