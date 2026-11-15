"""C11 tables: MONITORING_FLAG."""

from ..extensions import db
from ..models import utcnow


class MonitoringFlag(db.Model):
    """An automated or manual monitoring flag raised on a mentorship."""

    __tablename__ = "monitoring_flag"

    id = db.Column(db.Integer, primary_key=True)
    mentorship_id = db.Column(db.Integer, db.ForeignKey("mentorship.id", ondelete="CASCADE"), nullable=False)
    timing_window_id = db.Column(db.Integer, db.ForeignKey("timing_window.id"))
    flag_type = db.Column(db.String(64), nullable=False)  # first_session_overdue, inactive, feedback_overdue, reassignment_needed
    status = db.Column(db.String(32), nullable=False, default="active")  # active, resolved
    raised_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    resolved_at = db.Column(db.DateTime(timezone=True))

    mentorship = db.relationship("Mentorship", backref=db.backref("monitoring_flags", cascade="all, delete-orphan"))
    timing_window = db.relationship("TimingWindow")

    def __repr__(self) -> str:
        return f"<MonitoringFlag {self.id} flag_type={self.flag_type}>"
