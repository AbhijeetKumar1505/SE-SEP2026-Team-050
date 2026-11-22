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


# IIC's queue, review, assignment and closure (US-16)


class ReviewStudentSchema(Schema):
    name = fields.String(required=True, metadata={"example": "Rahul Sundaram"})
    roll = fields.String(required=True, metadata={"example": "21F1000001"})
    email = fields.String(required=True)
    level = fields.String(allow_none=True, metadata={"example": "BS"})
    cgpa = fields.Float(allow_none=True, metadata={"description": "Visible to IIC only", "example": 8.75})
    career_interest = fields.String(allow_none=True)
    courses = fields.String(allow_none=True, metadata={"description": "Completed courses, comma separated"})


class ProblemReviewSchema(Schema):
    """A problem as IIC sees it: the problem, the student's profile and the current assignment."""

    id = fields.Integer(required=True, metadata={"example": 3})
    title = fields.String(required=True)
    status = fields.String(
        required=True,
        metadata={"description": "submitted, under_review, awaiting_mentor, reassignment_needed, closed, ..."},
    )
    submitted_at = fields.DateTime(required=True)
    description = fields.String(required=True)
    tags = fields.List(fields.String(), required=True, metadata={"example": ["Computer vision"]})
    desired_outcome = fields.String(allow_none=True)
    guidance_preferences = fields.String(allow_none=True)
    close_reason = fields.String(allow_none=True, metadata={"description": "Why IIC closed it, once closed"})
    closed_at = fields.DateTime(allow_none=True)
    reassign_reason = fields.String(allow_none=True, metadata={"description": "Why it needs a new mentor"})
    student = fields.Nested(ReviewStudentSchema, required=True)
    mentor = fields.String(allow_none=True, metadata={"description": "The assigned mentor's name, if any"})
    assigned_by = fields.String(allow_none=True, metadata={"description": "The IIC coordinator who assigned them"})
    assigned_at = fields.DateTime(allow_none=True)
    respond_by = fields.DateTime(
        allow_none=True, metadata={"description": "When the mentor's time to accept ends, while they have not answered"}
    )


class QueueSchema(Schema):
    problems = fields.List(fields.Nested(ProblemReviewSchema), required=True)


class AssignSchema(Schema):
    mentor_id = fields.Integer(required=True, metadata={"example": 4})


class CloseProblemSchema(Schema):
    reason = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=1000), validate.Regexp(r"\S", error="Give a reason.")],
        metadata={"description": "Told to the student", "example": "This is outside what the programme covers."},
    )
