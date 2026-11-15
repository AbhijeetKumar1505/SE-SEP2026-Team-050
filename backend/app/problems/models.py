"""C5 tables: PROBLEM and PROBLEM_TAG."""

from ..extensions import db
from ..models import utcnow

problem_tag = db.Table(
    "problem_tag",
    db.Column("problem_id", db.Integer, db.ForeignKey("problem.id", ondelete="CASCADE"), primary_key=True),
    db.Column("topic_tag_id", db.Integer, db.ForeignKey("topic_tag.id", ondelete="CASCADE"), primary_key=True),
)


class Problem(db.Model):
    """A student's problem submitted for mentoring help."""

    __tablename__ = "problem"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    # submitted, under_review, awaiting_mentor, mentor_assigned, reassignment_needed, closed, withdrawn
    status = db.Column(db.String(32), nullable=False, default="submitted")
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    closed_at = db.Column(db.DateTime(timezone=True))
    close_reason = db.Column(db.Text)
    desired_outcome = db.Column(db.Text)
    guidance_preferences = db.Column(db.Text)

    student = db.relationship("Student", backref=db.backref("problems", lazy="selectin"))
    tags = db.relationship("TopicTag", secondary=problem_tag, lazy="selectin")

    def __repr__(self) -> str:
        return f"<Problem {self.id} {self.title[:20]}>"
