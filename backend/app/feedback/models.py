"""C10 tables: FEEDBACK."""

from ..extensions import db
from ..models import utcnow


class Feedback(db.Model):
    """Progress feedback submitted for a mentorship."""

    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    mentorship_id = db.Column(db.Integer, db.ForeignKey("mentorship.id", ondelete="CASCADE"), nullable=False)
    author_user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    progress_status = db.Column(db.String(32), nullable=False)  # no_progress, some_progress, goal_met
    rating = db.Column(db.Integer)  # optional 1-5
    comments = db.Column(db.Text)
    checkpoint_number = db.Column(db.Integer, default=1)
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    mentorship = db.relationship("Mentorship", backref=db.backref("feedbacks", cascade="all, delete-orphan"))
    author = db.relationship("User")

    def __repr__(self) -> str:
        return f"<Feedback {self.id} mentorship_id={self.mentorship_id} status={self.progress_status}>"
