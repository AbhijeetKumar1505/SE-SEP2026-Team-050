"""System endpoints that belong to no user story: a health check for the host and for CI."""

from flask import current_app
from marshmallow import Schema, fields

from .openapi import ApiBlueprint

blp = ApiBlueprint("system", __name__, url_prefix="/api", description="Health check for the host and CI.")


class HealthSchema(Schema):
    status = fields.String(required=True, metadata={"example": "ok"})
    version = fields.String(required=True, metadata={"example": "0.1.0"})


@blp.route("/health")
@blp.response(200, HealthSchema)
def health():
    """Report that the API is running

    Used by the host's health check and by CI. Needs no login.
    """
    return {"status": "ok", "version": current_app.config["API_VERSION"]}
