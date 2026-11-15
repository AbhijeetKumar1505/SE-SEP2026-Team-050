from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "mentors",
    __name__,
    url_prefix="/api/mentors",
    description=("C3 Mentor pool: Verified mentors, their expertise, availability and capacity (US-10, US-14, US-18)."),
)
