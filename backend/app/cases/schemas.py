from marshmallow import Schema, fields, validate

CASE_TYPES = ["change", "end", "misconduct"]


class CaseCreateSchema(Schema):
    mentorship_id = fields.Integer(required=True, metadata={"example": 2})
    case_type = fields.String(
        required=True,
        validate=validate.OneOf(CASE_TYPES),
        metadata={"description": "change, end or misconduct", "example": "change"},
    )
    details = fields.String(
        required=True,
        validate=validate.Length(min=10, max=500),
        metadata={"description": "What happened, in the reporter's words"},
    )


class CaseSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 3})
    mentorship_id = fields.Integer(required=True)
    case_type = fields.String(required=True, metadata={"example": "change"})
    status = fields.String(required=True, metadata={"example": "under_review"})
    details = fields.String(required=True)
    decision = fields.String(allow_none=True, metadata={"example": "reassign"})
    decision_reason = fields.String(allow_none=True)
    opened_at = fields.DateTime(required=True)
    resolved_at = fields.DateTime(allow_none=True)
