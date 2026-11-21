"""C1 business rules for accounts, sign-up and login. Tested directly, without HTTP."""

import hashlib
import secrets
from datetime import timedelta

from flask_smorest import abort
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import as_utc, utcnow
from ..notifications.services import send_email
from ..settings.services import approved_domain
from ..students import services as roster
from ..students.models import Student
from .models import ROLES, STUDENT, EmailVerification, Role, User

MIN_PASSWORD_LENGTH = 8
WRONG_LOGIN = "Email or password is incorrect."

# Sign-up (US-01). The messages are the ones in the story's acceptance criteria.
VERIFICATION_HOURS = 24
NOT_INSTITUTE_EMAIL = "Use your IITM BS institute email."
NOT_ON_ROSTER = roster.NOT_REGISTERED
NOT_ROSTER_EMAIL = "Use the institute email IIC registered for this roll number."
ACCOUNT_EXISTS = "An account already exists for this roll number. Log in instead."
EMAIL_TAKEN = "An account already exists for this email. Log in instead."
LINK_INVALID = "This link is not valid. Use the newest link we sent, or ask for a new one."
LINK_USED = "Your email is already verified. Log in instead."
LINK_EXPIRED = "This link has expired. Ask for a new one."
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


def sign_up(email: str, roll_number: str, password: str) -> User:
    """US-01: create an unverified student account and email it a verification link.

    Refusals store nothing. In order:
    1. the email must be on an approved, enabled domain (C4), otherwise 422;
    2. the roll number must be on IIC's roster and not removed (C2), otherwise 403;
    3. the email must be the one IIC registered for that roll number, otherwise 422;
    4. no verified account may exist for the roll number or the email, otherwise 409.

    Signing up again before verifying sets the new password and sends a new link, and older links
    stop working. The student's name and roll number come from the roster.
    """
    email = normalize_email(email)
    domain = approved_domain(email)
    if domain is None:
        abort(422, message=NOT_INSTITUTE_EMAIL, errors={"json": {"email": [NOT_INSTITUTE_EMAIL]}})
    entry = roster.roster_entry(roll_number)
    if entry is None:
        abort(403, message=NOT_ON_ROSTER)
    if normalize_email(entry.email) != email:
        abort(422, message=NOT_ROSTER_EMAIL, errors={"json": {"email": [NOT_ROSTER_EMAIL]}})

    student = roster.student_with_number(entry.student_number)
    if student is not None:
        user = student.user
        if user.email_verified_at is not None or user.email != email:
            abort(409, message=ACCOUNT_EXISTS)
    else:
        if db.session.query(User.id).filter_by(email=email).first() is not None:
            abort(409, message=EMAIL_TAKEN)
        user = User(email=email, roles=get_roles([STUDENT]), email_domain=domain)
        db.session.add(user)
        db.session.add(Student(user=user, student_number=entry.student_number, name=entry.name))

    user.password_hash = generate_password_hash(password)
    _send_verification_link(user, name=entry.name)
    db.session.commit()
    return user


def resend_verification(email: str) -> None:
    """Send a new link to a student who signed up but has not verified yet; otherwise do nothing.

    The caller always gets the same answer, so it does not reveal which emails have accounts.
    """
    user = db.session.query(User).filter_by(email=normalize_email(email)).one_or_none()
    if user is None or user.email_verified_at is not None or user.student_profile is None:
        return
    _send_verification_link(user, name=user.student_profile.name)
    db.session.commit()


def verify_email(token: str) -> User:
    """Use a verification link: 404 if unknown or replaced, 409 if already used, 410 if expired."""
    link = db.session.query(EmailVerification).filter_by(token_hash=_hash_token(token)).one_or_none()
    if link is None:
        abort(404, message=LINK_INVALID)
    if link.used_at is not None:
        abort(409, message=LINK_USED)
    now = utcnow()
    if as_utc(link.expires_at) <= now:
        abort(410, message=LINK_EXPIRED)
    link.used_at = now
    link.user.email_verified_at = now
    db.session.commit()
    return link.user


def _send_verification_link(user: User, *, name: str) -> None:
    """Replace the user's unused links with a new one, emailed after the commit.

    Only a hash of the token is stored, so a copy of the database cannot be used to verify accounts.
    """
    user.email_verifications = [link for link in user.email_verifications if link.used_at is not None]
    token = secrets.token_urlsafe(32)
    user.email_verifications.append(
        EmailVerification(token_hash=_hash_token(token), expires_at=utcnow() + timedelta(hours=VERIFICATION_HOURS))
    )
    send_email(user.email, "email_verification", link=f"/verify-email/{token}", name=name, hours=VERIFICATION_HOURS)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
