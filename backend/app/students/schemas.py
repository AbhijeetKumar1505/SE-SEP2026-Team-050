from marshmallow import EXCLUDE, Schema, fields, validate

from ..problems.schemas import ProblemSchema

# IIC's roster (US-15)

MAX_IMPORT_ROWS = 5000


class RosterRowSchema(Schema):
    """One CSV row. Rows are checked one by one, so a bad row is reported instead of failing the import."""

    class Meta:
        unknown = EXCLUDE

    name = fields.String(load_default="", allow_none=True, metadata={"example": "Sneha Pillai"})
    roll_number = fields.String(load_default="", allow_none=True, metadata={"example": "23f1002345"})
    institute_email = fields.String(
        load_default="", allow_none=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"}
    )


class RosterImportSchema(Schema):
    file = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        metadata={"description": "Name of the CSV file, shown with the result", "example": "roster_nov_2026.csv"},
    )
    rows = fields.List(
        fields.Nested(RosterRowSchema),
        required=True,
        validate=validate.Length(min=1, max=MAX_IMPORT_ROWS),
        metadata={"description": f"The CSV's rows after the header, in order; at most {MAX_IMPORT_ROWS}"},
    )


class RowErrorSchema(Schema):
    row = fields.Integer(required=True, metadata={"description": "CSV row number; the header is row 1", "example": 14})
    reason = fields.String(required=True, metadata={"example": "Roll number is not valid. Use the form 23f1002345."})


class RosterImportResultSchema(Schema):
    file = fields.String(required=True, metadata={"example": "roster_nov_2026.csv"})
    imported_by = fields.String(required=True, allow_none=True, metadata={"example": "deepa.iic@ds.study.iitm.ac.in"})
    imported_at = fields.DateTime(required=True)
    added = fields.Integer(required=True, metadata={"example": 310})
    updated = fields.Integer(required=True, metadata={"example": 2})
    errors = fields.List(fields.Nested(RowErrorSchema), required=True)


class RosterStudentSchema(Schema):
    id = fields.Integer(required=True, metadata={"description": "Roster entry ID, used to remove the student"})
    name = fields.String(required=True, metadata={"example": "Sneha Pillai"})
    roll = fields.String(required=True, metadata={"example": "23F1002345"})
    email = fields.String(required=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"})
    signed_up = fields.Boolean(required=True, metadata={"description": "Has an account with a verified email"})
    profile_complete = fields.Boolean(required=True)


class RosterSchema(Schema):
    students = fields.List(fields.Nested(RosterStudentSchema), required=True)
    last_import = fields.Nested(RosterImportResultSchema, required=True, allow_none=True)


class RosterAddSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=128), metadata={"example": "Sneha Pillai"})
    roll_number = fields.String(
        required=True, validate=validate.Length(min=1, max=32), metadata={"example": "23f1002345"}
    )
    institute_email = fields.String(
        required=True, validate=validate.Length(min=3, max=254), metadata={"example": "23f1002345@ds.study.iitm.ac.in"}
    )


class RemoveReasonSchema(Schema):
    reason = fields.String(
        required=True,
        validate=[validate.Length(min=1, max=500), validate.Regexp(r"\S", error="Give a reason.")],
        metadata={
            "description": "Why IIC removed the student; kept in the audit log",
            "example": "Left the programme.",
        },
    )


class StudentProfileSchema(Schema):
    name = fields.String(required=True, metadata={"example": "Rahul Sundaram"})
    student_number = fields.String(required=True, metadata={"example": "21F1000001"})
    email = fields.Email(required=True)
    programme = fields.String(required=True, allow_none=True, metadata={"example": "BS"})
    cohort = fields.String(allow_none=True)
    cgpa = fields.Float(allow_none=True, metadata={"description": "Visible to IIC only"})
    completed_courses = fields.String(allow_none=True, metadata={"description": "Course names, comma separated"})
    career_interest = fields.String(allow_none=True)
    complete = fields.Boolean(
        required=True,
        metadata={"description": "True once the student has filled in every field"},
    )


class StudentProfileUpdateSchema(Schema):
    programme = fields.String(required=True, validate=validate.OneOf(["BSc", "BS"]), metadata={"example": "BS"})
    cgpa = fields.Float(required=True, validate=validate.Range(min=0, max=10), metadata={"example": 8.75})
    completed_courses = fields.String(
        required=True,
        validate=validate.Length(min=1, max=500),
        metadata={"example": "Math 1, Python, Linear Algebra"},
    )
    career_interest = fields.String(
        required=True,
        validate=validate.Length(min=1, max=200),
        metadata={"example": "Job"},
    )


class HomeProfileSchema(Schema):
    level = fields.String(required=True, metadata={"example": "BS"})
    career_interest = fields.String(required=True, metadata={"example": "Job"})
    course_count = fields.Integer(required=True, metadata={"example": 5})


class HomeMentorshipSchema(Schema):
    reached_out = fields.Boolean(required=True)
    mentor = fields.String(required=True, metadata={"example": "Arun Kumar"})


class HomeSchema(Schema):
    problem = fields.Nested(ProblemSchema, allow_none=True)
    mentorship = fields.Nested(HomeMentorshipSchema, allow_none=True)
    profile = fields.Nested(HomeProfileSchema, allow_none=True)
    accept_hours = fields.Integer(
        required=True,
        metadata={"description": "Hours a mentor has to respond", "example": 72},
    )
