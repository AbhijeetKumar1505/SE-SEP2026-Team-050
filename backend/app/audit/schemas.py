from marshmallow import Schema, ValidationError, fields, validate, validates_schema

from .services import NAME

name_field = {"validate": validate.Regexp(NAME, error="Use a snake_case name, such as 'verify_mentor'.")}


class AuditQuerySchema(Schema):
    entity_type = fields.String(
        metadata={"description": "Only entries about this kind of record, such as `mentor`", "example": "mentor"},
        **name_field,
    )
    entity_id = fields.Integer(
        validate=validate.Range(min=1),
        metadata={"description": "Only entries about this record. Needs `entity_type`", "example": 3},
    )
    action = fields.String(
        metadata={"description": "Only entries for this action", "example": "verify_mentor"},
        **name_field,
    )

    @validates_schema
    def entity_id_needs_a_type(self, data, **_kwargs):
        if "entity_id" in data and "entity_type" not in data:
            raise ValidationError("Give entity_type together with entity_id.", field_name="entity_id")


class ActorSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 2})
    email = fields.Email(required=True, metadata={"example": "deepa.krishnan@iitm.ac.in"})


class AuditEntrySchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 41})
    created_at = fields.DateTime(required=True, metadata={"description": "When it happened (UTC)"})
    actor = fields.Nested(
        ActorSchema,
        allow_none=True,
        required=True,
        metadata={"description": "Who did it. Empty for automatic actions, such as the daily checks"},
    )
    action = fields.String(required=True, metadata={"example": "verify_mentor"})
    entity_type = fields.String(required=True, metadata={"example": "mentor"})
    entity_id = fields.Integer(allow_none=True, required=True, metadata={"example": 3})
    details = fields.String(
        allow_none=True, required=True, metadata={"example": "Verified after checking LinkedIn and employer."}
    )
