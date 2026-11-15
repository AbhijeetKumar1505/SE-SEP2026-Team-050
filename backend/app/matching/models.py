"""C6 tables: RECOMMENDATION."""

from ..extensions import db
from ..models import utcnow


class Recommendation(db.Model):
    """A mentor recommendation generated for a problem."""

    __tablename__ = "recommendation"

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problem.id", ondelete="CASCADE"), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey("mentor.id", ondelete="CASCADE"), nullable=False)
    score = db.Column(db.Float, default=0.0)
    rank = db.Column(db.Integer, default=1)
    shared_tags_count = db.Column(db.Integer, default=0)
    generated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    problem = db.relationship("Problem", backref=db.backref("recommendations", cascade="all, delete-orphan"))
    mentor = db.relationship("Mentor")

    def __repr__(self) -> str:
        return f"<Recommendation problem_id={self.problem_id} mentor_id={self.mentor_id} rank={self.rank}>"
