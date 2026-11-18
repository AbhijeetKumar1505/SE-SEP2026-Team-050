from marshmallow import Schema, fields, validate

from ..sessions.schemas import SessionSchema


class StepSchema(Schema):
    id = fields.String(required=True, metadata={"example": "8f14e45fceea167a5a36dedd4bea2543"})
    text = fields.String(required=True, metadata={"example": "Implement a baseline object detector"})
    done = fields.Boolean(required=True)


class MentorSummarySchema(Schema):
    """What a student may see of their mentor once the mentor has accepted."""

    name = fields.String(required=True, metadata={"example": "Arun Kumar"})
    headline = fields.String(required=True, metadata={"example": "Senior Computer Vision Engineer at Robotics India"})
    contact = fields.String(
        required=True,
        metadata={"description": "The mentor's email", "example": "arun@example.com"},
    )
    channel = fields.String(required=True, metadata={"example": "Google Meet"})
    availability = fields.String(required=True, metadata={"example": "Monday 18:00–19:00, Saturday 10:00–11:30"})
    time_zone = fields.String(required=True, metadata={"example": "Asia/Kolkata"})
    expertise = fields.List(fields.String(), required=True, metadata={"example": ["Computer vision", "Deep learning"]})
    experience = fields.List(fields.String(), required=True, metadata={"example": ["Robotics India"]})


class MentorshipSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 2})
    status = fields.String(required=True, metadata={"example": "active"})
    goal = fields.String(allow_none=True)
    steps = fields.Nested(StepSchema, many=True, required=True)
    assigned_at = fields.DateTime(required=True, metadata={"description": "When IIC assigned the mentor (UTC)"})
    answered_at = fields.DateTime(allow_none=True, metadata={"description": "When the mentor accepted"})
    reached_out_at = fields.DateTime(allow_none=True, metadata={"description": "When the student first made contact"})
    ended_at = fields.DateTime(allow_none=True)
    end_reason = fields.String(allow_none=True)
    checkpoint_due = fields.Date(
        required=True,
        metadata={"description": "When the student's next progress feedback is due", "example": "2026-11-30"},
    )
    case_open = fields.Boolean(required=True, metadata={"description": "True while IIC is reviewing a case"})
    topics = fields.List(fields.String(), required=True, metadata={"description": "The problem's topic tags"})
    mentor = fields.Nested(MentorSummarySchema, required=True)
    sessions = fields.Nested(SessionSchema, many=True, required=True)


class MyMentorshipSchema(Schema):
    mentorship = fields.Nested(MentorshipSchema, allow_none=True)


class MentorshipUpdateSchema(Schema):
    goal = fields.String(
        required=True,
        validate=validate.Length(min=10, max=300),
        metadata={"example": "Land a data engineering internship."},
    )


class StepWriteSchema(Schema):
    text = fields.String(
        required=True,
        validate=validate.Length(min=1, max=200),
        metadata={"example": "Review the syllabus"},
    )
