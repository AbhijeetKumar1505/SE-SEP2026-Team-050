from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications",
    description="C13 Notifications: Email and dashboard notices for every event (Most stories).",
)
