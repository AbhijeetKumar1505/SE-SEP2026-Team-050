from marshmallow import Schema, fields, validate

from ..problems.schemas import ProblemSchema


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
