from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "settings",
    __name__,
    url_prefix="/api/settings",
    description=("C4 Settings and tags: Topic tags, approved email domains and timing windows (US-01, US-03, US-21)."),
)
