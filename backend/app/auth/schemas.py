from marshmallow import Schema, fields, pre_load, validate

from .models import ROLES


class LoginSchema(Schema):
    email = fields.Email(required=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"})

    @pre_load
    def strip_email(self, data, **_kwargs):
        """Pasted emails often carry spaces; drop them before validating."""
        if isinstance(data, dict) and isinstance(data.get("email"), str):
            data = {**data, "email": data["email"].strip()}
        return data

    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=1, max=128),
        metadata={"example": "a-strong-password"},
    )


class UserSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 7})
    email = fields.Email(required=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"})
    roles = fields.List(
        fields.String(validate=validate.OneOf(ROLES)),
        required=True,
        attribute="role_names",
        metadata={"example": ["student"]},
    )


class TokenSchema(Schema):
    access_token = fields.String(required=True, metadata={"description": "Send as: Authorization: Bearer <token>"})
    token_type = fields.String(required=True, metadata={"example": "Bearer"})
    expires_in = fields.Integer(required=True, metadata={"description": "Seconds until the token expires"})
    user = fields.Nested(UserSchema, required=True)
