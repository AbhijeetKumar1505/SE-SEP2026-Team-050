"""C1 tables: USER, ROLE and USER_ROLE as in the Milestone 2 ER diagram, plus REVOKED_TOKEN and EMAIL_VERIFICATION.

REVOKED_TOKEN is not in the ER diagram. It records logged-out tokens until they expire, so a
token stops working at logout instead of when it runs out (SCRUM-71).
"""

from ..extensions import db
from ..models import utcnow

# The four roles. Their names travel in the login token and are checked by @blp.auth(...).
STUDENT, MENTOR, IIC, LEADERSHIP = "student", "mentor", "iic", "leadership"
ROLES = (STUDENT, MENTOR, IIC, LEADERSHIP)

user_role = db.Table(
    "user_role",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
    db.Column("role_id", db.Integer, db.ForeignKey("role.id", ondelete="CASCADE"), primary_key=True),
)


class Role(db.Model):
    __tablename__ = "role"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<Role {self.name}>"


class User(db.Model):
    """One account. A student or mentor profile (C2, C3) points back to it."""

    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), nullable=False, unique=True)  # stored lower-case
    # Empty until the user sets a password: at sign-up (US-01) or on mentor activation (US-14).
    password_hash = db.Column(db.String(255))
    # Empty until the email link is used. Nobody can log in before that.
    email_verified_at = db.Column(db.DateTime(timezone=True))
    email_domain_id = db.Column(db.Integer, db.ForeignKey("email_domain.id"))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    roles = db.relationship(Role, secondary=user_role, lazy="selectin")
    email_domain = db.relationship("EmailDomain")

    @property
    def role_names(self) -> list[str]:
        return sorted(role.name for role in self.roles)

    def __repr__(self) -> str:
        return f"<User {self.id} {self.email}>"


class RevokedToken(db.Model):
    __tablename__ = "revoked_token"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)  # the token's unique ID
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)  # safe to delete after this


VERIFY_EMAIL, ACTIVATE_MENTOR = "verify_email", "activate_mentor"


class EmailVerification(db.Model):
    """A one-time link sent by email: sign-up verification (24 hours, US-01) or mentor activation (7 days, US-14).

    Only a hash of the token is stored. A link works only for its purpose.
    """

    __tablename__ = "email_verification"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    purpose = db.Column(db.String(32), nullable=False, default=VERIFY_EMAIL, server_default=VERIFY_EMAIL)
    token_hash = db.Column(db.String(255), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", backref=db.backref("email_verifications", cascade="all, delete-orphan"))

    def __repr__(self) -> str:
        return f"<EmailVerification user_id={self.user_id}>"
