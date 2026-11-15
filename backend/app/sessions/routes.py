from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "sessions",
    __name__,
    url_prefix="/api/sessions",
    description="C9 Sessions: Scheduled and logged sessions, with no conversation content (US-11).",
)
