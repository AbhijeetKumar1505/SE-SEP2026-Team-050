from marshmallow import Schema, fields, validate


class FeedbackWriteSchema(Schema):
    mentorship_id = fields.Integer(required=True, metadata={"example": 2})
    progress_status = fields.String(
        required=True,
        validate=validate.OneOf(["no_progress", "some_progress", "goal_met"]),
        metadata={"example": "some_progress"},
    )
    comment = fields.String(
        allow_none=True,
        validate=validate.Length(max=500),
        metadata={"description": "Optional comment; only IIC reads it"},
    )


class FeedbackSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 7})
    mentorship_id = fields.Integer(required=True)
    progress_status = fields.String(required=True, metadata={"example": "some_progress"})
    comment = fields.String(allow_none=True)
    checkpoint_number = fields.Integer(required=True, metadata={"example": 1})
    submitted_at = fields.DateTime(required=True)
    author_side = fields.String(required=True, metadata={"description": "student or mentor", "example": "student"})
