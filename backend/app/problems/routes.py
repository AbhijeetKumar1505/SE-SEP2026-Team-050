from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "problems",
    __name__,
    url_prefix="/api/problems",
    description=("C5 Problem intake: Students' problems, their status and IIC's queue (US-03, US-05, US-16, US-20)."),
)
