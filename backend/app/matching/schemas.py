from marshmallow import fields

from ..mentors.schemas import PoolMentorSchema


class CandidateMentorSchema(PoolMentorSchema):
    """A mentor IIC could assign to the problem, with why they match it."""

    shared_tags = fields.List(
        fields.String(),
        required=True,
        metadata={"description": "The problem's topic tags this mentor has", "example": ["Computer vision"]},
    )
    shared_tags_count = fields.Integer(required=True, metadata={"example": 1})
