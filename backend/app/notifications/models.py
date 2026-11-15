"""C13 tables: EMAIL_TEMPLATE and NOTIFICATION."""

from ..extensions import db
from ..models import utcnow


class EmailTemplate(db.Model):
    """Email and notice templates."""

    __tablename__ = "email_template"

    id = db.Column(db.Integer, primary_key=True)
    template_key = db.Column(db.String(64), nullable=False, unique=True)
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)

    def __repr__(self) -> str:
        return f"<EmailTemplate {self.template_key}>"


class Notification(db.Model):
    """A notification notice sent or queued for a user."""

    __tablename__ = "notification"

    id = db.Column(db.Integer, primary_key=True)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    email_template_id = db.Column(db.Integer, db.ForeignKey("email_template.id"))
    subject = db.Column(db.String(255))
    body = db.Column(db.Text)
    link = db.Column(db.String(255))
    status = db.Column(db.String(32), nullable=False, default="queued")  # queued, sent, failed
    read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    sent_at = db.Column(db.DateTime(timezone=True))

    recipient = db.relationship(
        "User", backref=db.backref("notifications", cascade="all, delete-orphan", lazy="selectin")
    )
    template = db.relationship("EmailTemplate")

    def __repr__(self) -> str:
        return f"<Notification {self.id} recipient={self.recipient_user_id} read={self.read}>"
