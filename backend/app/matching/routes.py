from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "matching",
    __name__,
    url_prefix="/api/matching",
    description="C6 Recommendations: Up to 4 ranked mentors for a problem, with reasons (US-04).",
)
