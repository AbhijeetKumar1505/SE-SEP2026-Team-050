"""C4 tables (Milestone 2 ER diagram): EMAIL_DOMAIN, TOPIC_TAG, TIMING_WINDOW."""

from ..extensions import db
from ..models import utcnow


class EmailDomain(db.Model):
    """An email domain allowed to register, such as ds.study.iitm.ac.in (US-01)."""

    __tablename__ = "email_domain"

    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(253), nullable=False, unique=True)
    enabled = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self) -> str:
        return f"<EmailDomain {self.domain}>"


class TopicTag(db.Model):
    """A topic tag shared by students' problems and mentors' expertise (C4)."""

    __tablename__ = "topic_tag"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(64))  # category/group name as defined in draft list
    retired = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    def __repr__(self) -> str:
        return f"<TopicTag {self.name}>"


class TimingWindow(db.Model):
    """Timing rule for reminders, escalations and checkpoints (C4, C11)."""

    __tablename__ = "timing_window"

    id = db.Column(db.Integer, primary_key=True)
    rule_name = db.Column(db.String(64), nullable=False, unique=True)
    hours = db.Column(db.Integer, nullable=False)
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    description = db.Column(db.String(255))

    def __repr__(self) -> str:
        return f"<TimingWindow {self.rule_name}={self.hours}h>"
