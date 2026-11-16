from marshmallow import Schema, fields


class NoticeQuerySchema(Schema):
    unread = fields.Boolean(
        load_default=False,
        metadata={"description": "Only notices not yet marked as read (for the bell's count)"},
    )


class NotificationSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 12})
    subject = fields.String(required=True, metadata={"example": "New student problem assigned to you"})
    body = fields.String(
        required=True,
        metadata={
            "example": "Hello Rahul, a student has been assigned to you. Please review and respond within 72 hours."
        },
    )
    link = fields.String(
        allow_none=True, required=True, metadata={"description": "Page in the web app it opens", "example": "/mentor"}
    )
    read = fields.Boolean(required=True, metadata={"example": False})
    created_at = fields.DateTime(required=True, metadata={"description": "When it was raised (UTC)"})
