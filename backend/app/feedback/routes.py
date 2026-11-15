from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "feedback",
    __name__,
    url_prefix="/api/feedback",
    description=("C10 Progress feedback: Progress status from student and mentor, seen only by IIC (US-08, US-12)."),
)
