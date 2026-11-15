from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "audit",
    __name__,
    url_prefix="/api/audit",
    description="C14 Audit log: Permanent record of decisions and status changes (US-14, US-18).",
)
