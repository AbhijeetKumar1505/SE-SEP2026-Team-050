from marshmallow import Schema, fields, validate

# The API uses the database's short names. The web app maps them to the labels it shows.


class ProblemSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 4})
    title = fields.String(required=True, metadata={"example": "Choosing electives and project advice"})
    description = fields.String(required=True)
    status = fields.String(
        required=True,
        metadata={
            "description": (
                "submitted, under_review, awaiting_mentor, mentor_assigned, reassignment_needed, closed or withdrawn"
            ),
            "example": "submitted",
        },
    )
    submitted_at = fields.DateTime(required=True, metadata={"description": "When the student submitted it (UTC)"})
    closed_at = fields.DateTime(allow_none=True)
    close_reason = fields.String(allow_none=True)
    desired_outcome = fields.String(allow_none=True)
    guidance_preferences = fields.String(allow_none=True)
    tags = fields.List(
        fields.String(),
        required=True,
        metadata={"example": ["Data engineering", "SQL and database design"]},
    )


class ProblemWriteSchema(Schema):
    description = fields.String(
        required=True,
        validate=validate.Length(min=30, max=1000),
        metadata={"description": "The student's problem, in their own words"},
    )
    tags = fields.List(
        fields.String(validate=validate.Length(min=1, max=100)),
        required=True,
        validate=validate.Length(min=1, max=5),
        metadata={"description": "One to five topic tag names"},
    )
    desired_outcome = fields.String(
        required=True,
        validate=validate.Length(min=1, max=300),
        metadata={"description": "What the student wants to achieve"},
    )
    guidance_preferences = fields.String(
        allow_none=True,
        validate=validate.Length(max=300),
        metadata={"description": "How the student likes to be guided (optional)"},
    )


class SubmitStatusSchema(Schema):
    has_open_problem = fields.Boolean(required=True, metadata={"example": False})
