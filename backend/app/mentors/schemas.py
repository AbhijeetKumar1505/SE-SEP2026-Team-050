from marshmallow import Schema, fields, validate


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
