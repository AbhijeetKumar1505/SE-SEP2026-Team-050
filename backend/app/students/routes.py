from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "students",
    __name__,
    url_prefix="/api/students",
    description=(
        "C2 Students and roster: IIC's roster of registered students and each student's profile (US-02, US-15)."
    ),
)
