"""C8 tables: CASE_RECORD."""

from ..extensions import db
from ..models import utcnow


class CaseRecord(db.Model):
    """A change, termination, or misconduct case about a mentorship."""

    __tablename__ = "case_record"

    id = db.Column(db.Integer, primary_key=True)
    mentorship_id = db.Column(db.Integer, db.ForeignKey("mentorship.id", ondelete="CASCADE"), nullable=False)
    reporter_user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    case_type = db.Column(db.String(32), nullable=False)  # change, end, misconduct
    status = db.Column(db.String(32), nullable=False, default="under_review")  # under_review, decided
    details = db.Column(db.Text, nullable=False)
    other_party_response = db.Column(db.Text)
    decision = db.Column(db.String(64))  # no_change, reassign, end_mentorship, remove_mentor
    decision_reason = db.Column(db.Text)
    decided_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    opened_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    resolved_at = db.Column(db.DateTime(timezone=True))

    mentorship = db.relationship("Mentorship", backref=db.backref("cases", cascade="all, delete-orphan"))
    reporter = db.relationship("User", foreign_keys=[reporter_user_id])
    decided_by = db.relationship("User", foreign_keys=[decided_by_user_id])

    def __repr__(self) -> str:
        return f"<CaseRecord {self.id} type={self.case_type} status={self.status}>"
