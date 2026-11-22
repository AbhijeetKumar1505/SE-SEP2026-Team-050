"""C7 tables: MENTORSHIP."""

from ..extensions import db
from ..models import utcnow


class Mentorship(db.Model):
    """A pairing between a student's problem and an assigned mentor."""

    __tablename__ = "mentorship"

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problem.id", ondelete="CASCADE"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("mentor.id", ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String(32), nullable=False, default="active")  # active, ended_by_mentor, ended_by_iic
    goal = db.Column(db.Text)
    next_steps = db.Column(db.Text)
    assigned_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    assigned_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))  # the IIC coordinator
    answered_at = db.Column(db.DateTime(timezone=True))
    ended_at = db.Column(db.DateTime(timezone=True))
    end_reason = db.Column(db.Text)
    reached_out_at = db.Column(db.DateTime(timezone=True))

    problem = db.relationship("Problem", backref=db.backref("mentorships", lazy="selectin"))
    mentor = db.relationship("Mentor", backref=db.backref("mentorships", lazy="selectin"))
    assigned_by = db.relationship("User", foreign_keys=[assigned_by_user_id])

    def __repr__(self) -> str:
        return f"<Mentorship {self.id} problem_id={self.problem_id} mentor_id={self.mentor_id}>"
