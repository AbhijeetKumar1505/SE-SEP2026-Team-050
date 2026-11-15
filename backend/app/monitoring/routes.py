from ..openapi import ApiBlueprint

blp = ApiBlueprint(
    "monitoring",
    __name__,
    url_prefix="/api/monitoring",
    description=("C11 Monitoring and alerts: IIC's monitoring view and the daily escalation checks (US-17, US-21)."),
)
