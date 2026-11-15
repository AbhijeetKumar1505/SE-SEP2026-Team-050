"""Login tokens (JWT): what they contain, how logout revokes them, and the 401 responses.

A token's subject is the user ID, and its "roles" claim lists the user's roles, so role checks
need no database query. Every JWT failure returns the shared JSON error format with status 401.
"""

from datetime import UTC, datetime

from flask_jwt_extended import create_access_token, decode_token, get_jwt

from ..errors import error_response
from ..extensions import db, jwt
from .models import RevokedToken, User


def issue_token(user: User) -> tuple[str, int]:
    """Return a new access token for the user and its lifetime in seconds."""
    token = create_access_token(identity=str(user.id), additional_claims={"roles": user.role_names})
    claims = decode_token(token)
    return token, claims["exp"] - claims["iat"]


def revoke_current_token() -> None:
    """Log out: the current token is refused from now on."""
    claims = get_jwt()
    db.session.add(RevokedToken(jti=claims["jti"], expires_at=datetime.fromtimestamp(claims["exp"], UTC)))
    db.session.commit()


@jwt.user_lookup_loader
def load_user(_header, claims):
    """Makes flask_jwt_extended.current_user the logged-in User. None (deleted user) gives a 401."""
    return db.session.get(User, int(claims["sub"]))


@jwt.token_in_blocklist_loader
def is_revoked(_header, claims) -> bool:
    return db.session.query(RevokedToken.id).filter_by(jti=claims["jti"]).first() is not None


@jwt.unauthorized_loader
def missing_token(_reason):
    return error_response(401, "Log in to continue.")


@jwt.invalid_token_loader
def invalid_token(_reason):
    return error_response(401, "The login token is invalid. Log in again.")


@jwt.expired_token_loader
def expired_token(_header, _claims):
    return error_response(401, "Your login has expired. Log in again.")


@jwt.revoked_token_loader
def revoked_token(_header, _claims):
    return error_response(401, "You have logged out. Log in again.")


@jwt.user_lookup_error_loader
def deleted_user(_header, _claims):
    return error_response(401, "This account no longer exists.")
