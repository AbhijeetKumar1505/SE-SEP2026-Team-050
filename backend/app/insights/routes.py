from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "insights",
    __name__,
    url_prefix="/api/insights",
    description=("C12 Programme insights: Aggregate demand, supply and outcome figures for leadership (US-19)."),
)
