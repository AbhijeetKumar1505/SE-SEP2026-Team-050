"""C9 tables: SESSION."""

from ..extensions import db
from ..models import utcnow


class Session(db.Model):
    """A mentoring session held or planned between mentor and student."""

    __tablename__ = "session"

    id = db.Column(db.Integer, primary_key=True)
    mentorship_id = db.Column(db.Integer, db.ForeignKey("mentorship.id", ondelete="CASCADE"), nullable=False)
    planned_at = db.Column(db.DateTime(timezone=True))
    held_at = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(32), nullable=False, default="planned")  # planned, held, cancelled
    duration_minutes = db.Column(db.Integer)
    topic_category = db.Column(db.String(100))
    channel = db.Column(db.String(64), default="Google Meet")
    meeting_link = db.Column(db.String(255))
    logged_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    confirmed_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    private_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    mentorship = db.relationship("Mentorship", backref=db.backref("sessions", cascade="all, delete-orphan"))
    logged_by = db.relationship("User", foreign_keys=[logged_by_user_id])
    confirmed_by = db.relationship("User", foreign_keys=[confirmed_by_user_id])

    def __repr__(self) -> str:
        return f"<Session {self.id} mentorship_id={self.mentorship_id} status={self.status}>"
