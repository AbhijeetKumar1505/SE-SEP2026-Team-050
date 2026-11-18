from marshmallow import Schema, fields, validate


class TagSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 3})
    name = fields.String(required=True, metadata={"example": "Data engineering"})
    group = fields.String(
        required=True,
        allow_none=True,
        metadata={"description": "The tag's group, as IIC lists it", "example": "Technical skills"},
    )
    problems = fields.Integer(required=True, metadata={"description": "Problems using this tag", "example": 12})
    active = fields.Boolean(required=True, metadata={"description": "False once IIC retires the tag"})


class TagCreateSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100),
        metadata={"example": "Data engineering"},
    )
    group = fields.String(
        required=True,
        validate=validate.Length(min=2, max=64),
        metadata={"example": "Technical skills"},
    )


class TagUpdateSchema(Schema):
    active = fields.Boolean(required=True, metadata={"description": "False retires the tag; true restores it"})
