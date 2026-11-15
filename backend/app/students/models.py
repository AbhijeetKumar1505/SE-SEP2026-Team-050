"""C2 tables: STUDENT."""

from ..extensions import db
from ..models import utcnow


class Student(db.Model):
    """A student profile linked 1:1 to an IITM BS student's User account."""

    __tablename__ = "student"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True)
    student_number = db.Column(db.String(32), nullable=False, unique=True)  # Roll number
    name = db.Column(db.String(128), nullable=False)
    programme = db.Column(db.String(16), nullable=False)  # 'BSc' or 'BS'
    cohort = db.Column(db.String(32))
    cgpa = db.Column(db.Float)
    completed_courses = db.Column(db.Text)  # comma-separated course codes or JSON
    career_interest = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", backref=db.backref("student_profile", uselist=False))

    def __repr__(self) -> str:
        return f"<Student {self.student_number} {self.name}>"
