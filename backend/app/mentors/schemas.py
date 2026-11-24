from marshmallow import EXCLUDE, Schema, fields, validate

from ..students.schemas import RowErrorSchema
from .models import MENTOR_STATUSES


class MentorProfileSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 2})
    name = fields.String(required=True, metadata={"example": "Arun Kumar"})
    available = fields.Boolean(required=True, metadata={"example": True})
    channel = fields.String(required=True, metadata={"example": "Google Meet"})
    contact = fields.String(required=True, metadata={"example": "arun.mentor@ds.study.iitm.ac.in"})
    availability = fields.String(required=True, metadata={"example": "Monday 18:00–19:00"})
    timezone = fields.String(required=True, metadata={"example": "Asia/Kolkata"})
    capacity = fields.Integer(required=True, metadata={"example": 1})
    expertise = fields.List(fields.String(), required=True, metadata={"example": ["Computer vision", "Deep learning"]})
    experience = fields.List(fields.String(), required=True, metadata={"example": ["Robotics India"]})


class MentorProfileUpdateSchema(Schema):
    available = fields.Boolean(load_default=True, metadata={"example": True})
    channel = fields.String(
        validate=validate.OneOf(["Google Meet", "Phone", "Email", "Other"]),
        metadata={"example": "Google Meet"},
    )
    contact = fields.String(
        validate=validate.Length(max=120),
        metadata={"example": "arun.mentor@ds.study.iitm.ac.in"},
    )
    availability = fields.String(
        validate=validate.Length(max=200),
        metadata={"example": "Monday 18:00–19:00, Saturday 10:00–11:30"},
    )
    timezone = fields.String(
        validate=validate.Length(max=64),
        metadata={"example": "Asia/Kolkata"},
    )


class AssignmentSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 3})
    assigned_by = fields.String(required=True, metadata={"example": "deepa"})
    assigned_at = fields.DateTime(required=True)
    tags = fields.List(fields.String(), required=True, metadata={"example": ["Computer vision"]})
    problem = fields.String(required=True, metadata={"example": "Choosing electives..."})
    goal = fields.String(required=True, metadata={"example": "Clarity on electives"})
    student = fields.Dict(
        required=True,
        metadata={"example": {"name": "Rahul", "level": "BS", "careerInterest": "Job", "courses": "Python, DBMS"}},
    )
    deadline = fields.DateTime(required=True, metadata={"description": "When the mentor must respond (UTC)"})


class MentorshipSummarySchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 2})
    student = fields.Dict(required=True)
    started_at = fields.DateTime(required=True)
    held = fields.Integer(required=True, metadata={"example": 3})
    next_session = fields.Dict(allow_none=True)


class MentorshipDetailSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 2})
    status = fields.String(required=True, metadata={"example": "active"})
    goal = fields.String(required=True, metadata={"example": "Finalize elective selections"})
    steps = fields.List(
        fields.Dict(),
        required=True,
        metadata={"example": [{"id": "s1", "text": "Review syllabus", "done": False}]},
    )
    assigned_at = fields.DateTime(required=True)
    answered_at = fields.DateTime(allow_none=True)
    reached_out_at = fields.DateTime(allow_none=True)
    checkpoint_due = fields.Date(allow_none=True, metadata={"example": "2026-11-30"})
    topics = fields.List(fields.String(), required=True, metadata={"example": ["Computer vision"]})
    problem = fields.String(required=True, metadata={"example": "Choosing electives..."})
    student = fields.Dict(required=True)
    mentor = fields.Dict(required=True)
    sessions = fields.List(fields.Dict(), required=True, metadata={"example": [{"id": 5, "status": "planned"}]})


class DashboardSchema(Schema):
    capacity = fields.Integer(required=True, metadata={"example": 2})
    load = fields.Integer(required=True, metadata={"example": 1})
    assignments = fields.Nested(AssignmentSchema, many=True, required=True)
    mentorships = fields.Nested(MentorshipSummarySchema, many=True, required=True)
    sessions_this_month = fields.Integer(required=True, metadata={"example": 4})
    confirmed = fields.Integer(required=True, metadata={"example": 3})
    next_checkpoint = fields.Dict(
        allow_none=True,
        metadata={"example": {"date": "2026-11-30", "student": {"name": "Rahul"}}},
    )
    capacity_request = fields.Dict(allow_none=True, metadata={"example": {"id": 1, "by": "deepa", "from": 1, "to": 2}})


class CapacityRequestAnswerSchema(Schema):
    accept = fields.Boolean(required=True, metadata={"example": True})


class CapacityRequestCreatedSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 3})
    mentor_id = fields.Integer(required=True, metadata={"example": 4})
    status = fields.String(required=True, metadata={"example": "pending"})
    by = fields.String(required=True, metadata={"description": "The IIC coordinator who asked"})
    from_ = fields.Integer(
        required=True, attribute="from", data_key="from", metadata={"description": "Capacity now", "example": 1}
    )
    to = fields.Integer(required=True, metadata={"description": "Capacity if the mentor accepts", "example": 2})
    created_at = fields.DateTime(required=True)


class CapacityRequestResponseSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 1})
    status = fields.String(required=True, metadata={"example": "accepted"})
    capacity = fields.Integer(required=True, metadata={"example": 2})


class DeclineAssignmentSchema(Schema):
    reason = fields.String(
        required=True,
        validate=validate.OneOf(["Outside my expertise", "No time right now", "Not a good fit", "Other"]),
        metadata={"example": "No time right now"},
    )
    note = fields.String(
        allow_none=True,
        validate=validate.Length(max=500),
        metadata={"description": "Details for IIC (optional)", "example": "I'm travelling next month."},
    )


class DeclineResponseSchema(Schema):
    id = fields.Integer(required=True, metadata={"description": "The problem that goes back to IIC's queue"})
    status = fields.String(required=True, metadata={"example": "reassignment_needed"})


# IIC's mentor pool (US-14)

MAX_IMPORT_ROWS = 2000


class PoolMentorSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 4})
    name = fields.String(required=True, metadata={"example": "Rahul Menon"})
    email = fields.String(required=True, metadata={"example": "rahul.menon@example.com"})
    headline = fields.String(allow_none=True, metadata={"example": "Data scientist at Flipkart"})
    status = fields.String(
        required=True,
        validate=validate.OneOf(MENTOR_STATUSES),
        metadata={"description": "pending_verification, verified (not activated yet), active or removed"},
    )
    available = fields.Boolean(required=True)
    capacity = fields.Integer(required=True, metadata={"example": 1})
    load = fields.Integer(required=True, metadata={"description": "Pending and active mentorships", "example": 1})
    expertise = fields.List(fields.String(), required=True, metadata={"example": ["SQL and database design"]})
    experience = fields.List(fields.String(), required=True, metadata={"example": ["Internship at TCS (3 months)"]})
    channel = fields.String(allow_none=True, metadata={"example": "Google Meet"})
    contact = fields.String(allow_none=True)
    timezone = fields.String(allow_none=True, metadata={"example": "Asia/Kolkata"})
    availability = fields.List(fields.String(), required=True, metadata={"example": ["Saturday 10:00-12:00"]})
    capacity_requested = fields.Boolean(required=True, metadata={"description": "IIC has asked for one more student"})
    verified_by = fields.String(allow_none=True, metadata={"description": "The IIC coordinator who verified them"})
    verified_at = fields.DateTime(allow_none=True)


class MentorAddSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=128), metadata={"example": "Rahul Menon"})
    email = fields.Email(
        required=True, validate=validate.Length(max=254), metadata={"example": "rahul.menon@example.com"}
    )
    headline = fields.String(
        load_default=None, allow_none=True, validate=validate.Length(max=200), metadata={"example": "Data scientist"}
    )


class MentorRowSchema(Schema):
    """One CSV row. Rows are checked one by one, so a bad row is reported instead of failing the import."""

    class Meta:
        unknown = EXCLUDE

    name = fields.String(load_default="", allow_none=True, metadata={"example": "Rahul Menon"})
    email = fields.String(load_default="", allow_none=True, metadata={"example": "rahul.menon@example.com"})
    expertise_tags = fields.String(
        load_default="",
        allow_none=True,
        metadata={"description": "Topic tag names separated by semicolons", "example": "SQL and database design"},
    )
    experience = fields.String(
        load_default="",
        allow_none=True,
        metadata={"description": "Entries separated by semicolons", "example": "Internship at TCS (3 months)"},
    )


class MentorImportSchema(Schema):
    file = fields.String(required=True, validate=validate.Length(min=1, max=255), metadata={"example": "mentors.csv"})
    rows = fields.List(
        fields.Nested(MentorRowSchema),
        required=True,
        validate=validate.Length(min=1, max=MAX_IMPORT_ROWS),
        metadata={"description": f"The CSV's rows after the header, in order; at most {MAX_IMPORT_ROWS}"},
    )


class MentorImportResultSchema(Schema):
    file = fields.String(required=True, metadata={"example": "mentors.csv"})
    imported_by = fields.String(required=True, metadata={"example": "deepa.iic@ds.study.iitm.ac.in"})
    imported_at = fields.DateTime(required=True)
    added = fields.Integer(required=True, metadata={"example": 12})
    updated = fields.Integer(required=True, metadata={"example": 1})
    errors = fields.List(fields.Nested(RowErrorSchema), required=True)


class VerifyMentorSchema(Schema):
    expertise = fields.List(
        fields.String(validate=validate.Length(min=1, max=100)),
        required=True,
        validate=validate.Length(min=1, max=10),
        metadata={"description": "The mentor's expertise: one to ten topic tag names", "example": ["Data engineering"]},
    )


class ActivationInfoSchema(Schema):
    valid = fields.Boolean(required=True, metadata={"example": True})
    name = fields.String(required=True, metadata={"example": "Rahul Menon"})
    verified_by = fields.String(required=True, metadata={"description": "Who in IIC verified the mentor"})


class ActivateSchema(Schema):
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128),
        metadata={"description": "At least 8 characters", "example": "a-strong-password"},
    )
