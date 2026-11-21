from marshmallow import Schema, fields, pre_load, validate

from .models import ROLES
from .services import MIN_PASSWORD_LENGTH


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


class SignUpSchema(Schema):
    email = fields.Email(
        required=True,
        validate=validate.Length(max=254),
        metadata={
            "description": "Institute email, as registered with IIC",
            "example": "23f1002345@ds.study.iitm.ac.in",
        },
    )
    roll_number = fields.String(
        required=True,
        validate=validate.Length(min=1, max=32),
        metadata={"description": "Roll number on IIC's roster; case does not matter", "example": "23f1002345"},
    )
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=MIN_PASSWORD_LENGTH, max=128),
        metadata={"description": f"At least {MIN_PASSWORD_LENGTH} characters", "example": "a-strong-password"},
    )

    @pre_load
    def strip_spaces(self, data, **_kwargs):
        """Pasted emails and roll numbers often carry spaces; drop them before validating."""
        if isinstance(data, dict):
            data = {
                **data,
                **{key: data[key].strip() for key in ("email", "roll_number") if isinstance(data.get(key), str)},
            }
        return data


class SignUpResultSchema(Schema):
    email = fields.Email(required=True, metadata={"description": "Where the verification link was sent"})
    link_valid_hours = fields.Integer(required=True, metadata={"example": 24})


class EmailSchema(Schema):
    email = fields.Email(required=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"})

    @pre_load
    def strip_email(self, data, **_kwargs):
        if isinstance(data, dict) and isinstance(data.get("email"), str):
            data = {**data, "email": data["email"].strip()}
        return data


class VerifyEmailSchema(Schema):
    token = fields.String(
        required=True,
        validate=validate.Length(min=1, max=128),
        metadata={
            "description": "The token at the end of the link in the email. The whole link is accepted too.",
            "example": "q8bT3xV0nR2-example-token-from-the-email",
        },
    )

    @pre_load
    def token_from_link(self, data, **_kwargs):
        """Accept a pasted link or a token with spaces around it. Tokens never contain a slash."""
        if isinstance(data, dict) and isinstance(data.get("token"), str):
            data = {**data, "token": data["token"].strip().rstrip("/").rpartition("/")[2]}
        return data


class UserSchema(Schema):
    id = fields.Integer(required=True, metadata={"example": 7})
    email = fields.Email(required=True, metadata={"example": "23f1002345@ds.study.iitm.ac.in"})
    roles = fields.List(
        fields.String(validate=validate.OneOf(ROLES)),
        required=True,
        attribute="role_names",
        metadata={"example": ["student"]},
    )
    # The name and roll number on the student or mentor profile, so the web app can greet the user
    # without a second request. Staff accounts have no profile and fall back to the email's first part.
    name = fields.Method(
        "get_name",
        required=True,
        metadata={"description": "Display name from the student or mentor profile", "example": "Ananya Rao"},
    )
    roll = fields.Method(
        "get_roll",
        allow_none=True,
        metadata={"description": "Student roll number; null for staff and mentors", "example": "23f1002345"},
    )

    def get_name(self, user) -> str:
        for profile in (user.student_profile, user.mentor_profile):
            if profile is not None:
                return profile.name
        return user.email.split("@")[0]

    def get_roll(self, user) -> str | None:
        return user.student_profile.student_number if user.student_profile is not None else None


class TokenSchema(Schema):
    access_token = fields.String(required=True, metadata={"description": "Send as: Authorization: Bearer <token>"})
    token_type = fields.String(required=True, metadata={"example": "Bearer"})
    expires_in = fields.Integer(required=True, metadata={"description": "Seconds until the token expires"})
    user = fields.Nested(UserSchema, required=True)
