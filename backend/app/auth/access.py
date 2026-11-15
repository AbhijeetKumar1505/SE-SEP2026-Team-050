"""Role and ownership checks (SCRUM-71).

Endpoints declare who may call them with @blp.auth(...) (see app/openapi.py), which uses
require() below and also documents the rule in the OpenAPI file:

    @blp.auth()                  # any logged-in user, otherwise 401
    @blp.auth("iic")             # IIC coordinators only, otherwise 403
    @blp.auth("student", "iic")  # either role

Inside an endpoint, check ownership of a record with require_owner_or():

    problem = services.get_problem(problem_id)
    require_owner_or(problem.student.user_id, "iic")   # the student who owns it, or IIC

Roles are read from the token, so a role change takes effect at the next login.
"""

from functools import wraps

from flask_jwt_extended import current_user, get_jwt, verify_jwt_in_request
from flask_smorest import abort

from .models import ROLES, User


def check_roles(roles) -> tuple[str, ...]:
    unknown = [role for role in roles if role not in ROLES]
    if unknown:
        raise ValueError(f"Unknown role {unknown}; use {', '.join(ROLES)}.")
    return tuple(roles)


def require(*roles: str):
    """Decorator: a valid, unrevoked token (401 otherwise), with one of the roles if any are given (403)."""
    allowed = check_roles(roles)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if allowed and not set(get_jwt().get("roles", [])) & set(allowed):
                abort(403, message="Your role does not allow this.")
            return func(*args, **kwargs)

        return wrapper

    return decorator


def current_roles() -> set[str]:
    return set(get_jwt().get("roles", []))


def get_current_user() -> User:
    """The logged-in user. Only valid inside an endpoint protected by @blp.auth(...)."""
    return current_user


def require_owner_or(owner_user_id: int | None, *roles: str) -> None:
    """Allow the user who owns a record, or anyone with one of the roles; otherwise 403."""
    if owner_user_id is not None and owner_user_id == current_user.id:
        return
    if current_roles() & set(check_roles(roles)):
        return
    abort(403, message="You can only access your own records.")
