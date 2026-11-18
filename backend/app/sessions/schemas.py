from marshmallow import Schema, fields, validate


class SessionSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 5})
    date = fields.Date(required=True, metadata={"example": "2026-11-20"})
    time = fields.String(
        allow_none=True,
        metadata={"description": "The start time of a planned session, HH:MM", "example": "18:00"},
    )
    duration = fields.Integer(allow_none=True, metadata={"description": "Minutes, for a held session", "example": 45})
    topic = fields.String(allow_none=True, metadata={"example": "Project code review"})
    channel = fields.String(allow_none=True, metadata={"example": "Google Meet"})
    link = fields.String(allow_none=True, metadata={"description": "Meeting link, if any"})
    status = fields.String(required=True, metadata={"description": "planned, held or cancelled", "example": "planned"})
    confirmed = fields.Boolean(
        required=True,
        metadata={"description": "True once the other participant confirms a held session"},
    )
    logged_by = fields.String(
        allow_none=True,
        metadata={"description": "Which side logged it: student or mentor", "example": "student"},
    )


class SessionWriteSchema(Schema):
    mentorship_id = fields.Integer(
        load_default=None,
        metadata={"description": "Only on create: which mentorship the session belongs to"},
    )
    status = fields.String(required=True, validate=validate.OneOf(["planned", "held"]), metadata={"example": "planned"})
    date = fields.Date(required=True, metadata={"example": "2026-11-20"})
    time = fields.Time(
        allow_none=True,
        metadata={"description": "Start time of a planned session, HH:MM", "example": "18:00"},
    )
    duration = fields.Integer(
        allow_none=True,
        validate=validate.Range(min=5, max=480),
        metadata={"description": "Minutes, for a held session", "example": 45},
    )
    topic = fields.String(
        allow_none=True,
        validate=validate.Length(max=100),
        metadata={"example": "Project code review"},
    )
    channel = fields.String(allow_none=True, validate=validate.Length(max=64), metadata={"example": "Google Meet"})
    link = fields.String(
        allow_none=True,
        validate=validate.Length(max=300),
        metadata={"example": "https://meet.google.com/abc"},
    )
