from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "cases",
    __name__,
    url_prefix="/api/cases",
    description="C8 Cases: Change, end and misconduct cases, decided by IIC (US-07, US-18).",
)
