"""C1 business rules for accounts and login. Tested directly, without HTTP."""

from flask_smorest import abort
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import utcnow
from .models import ROLES, Role, User

MIN_PASSWORD_LENGTH = 8
WRONG_LOGIN = "Email or password is incorrect."
# Checked when the email is unknown, so a wrong email takes as long as a wrong password.
_DUMMY_HASH = generate_password_hash("timing-equaliser")


class DuplicateEmail(ValueError):
    pass


def normalize_email(email: str) -> str:
    return email.strip().lower()


def ensure_roles() -> None:
    """Create any of the four roles that are missing. The first migration also adds them."""
    existing = {name for (name,) in db.session.query(Role.name)}
    for name in ROLES:
        if name not in existing:
            db.session.add(Role(name=name))
    db.session.flush()


def get_roles(names) -> list[Role]:
    unknown = [name for name in names if name not in ROLES]
    if unknown:
        raise ValueError(f"Unknown role {unknown}; use {', '.join(ROLES)}.")
    ensure_roles()
    return db.session.query(Role).filter(Role.name.in_(names)).all()


def create_user(email: str, *, password: str | None = None, roles=(), verified: bool = False) -> User:
    """Create an account. Students and mentors normally come through sign-up (US-01) and activation (US-14)."""
    email = normalize_email(email)
    if db.session.query(User.id).filter_by(email=email).first():
        raise DuplicateEmail(f"An account for {email} already exists.")
    if password is not None and len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Use at least {MIN_PASSWORD_LENGTH} characters for the password.")
    user = User(
        email=email,
        password_hash=generate_password_hash(password) if password else None,
        email_verified_at=utcnow() if verified else None,
        roles=get_roles(roles),
    )
    db.session.add(user)
    db.session.commit()
    return user


def authenticate(email: str, password: str) -> User:
    """Return the user for a correct email and password.

    401 for an unknown email or a wrong password, with the same message, so the response does not
    reveal which emails have accounts. 403 when the password is right but the email is not verified.
    """
    user = db.session.query(User).filter_by(email=normalize_email(email)).first()
    if user is None or user.password_hash is None:
        check_password_hash(_DUMMY_HASH, password)
        abort(401, message=WRONG_LOGIN)
    if not check_password_hash(user.password_hash, password):
        abort(401, message=WRONG_LOGIN)
    if user.email_verified_at is None:
        abort(403, message="Verify your email address before logging in.")
    return user
