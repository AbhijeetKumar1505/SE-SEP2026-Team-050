"""C2 tables: STUDENT, and ROSTER_ENTRY for IIC's roster of registered students.

ROSTER_ENTRY resolves the Milestone 2 diagram review note on the roster: IIC registers students
before they sign up, so the roster has its own table and STUDENT.user_id stays required.
"""

from ..extensions import db
from ..models import utcnow


class RosterEntry(db.Model):
    """A student IIC has registered for the programme (US-15). Sign-up checks it (US-01)."""

    __tablename__ = "roster_entry"

    id = db.Column(db.Integer, primary_key=True)
    student_number = db.Column(db.String(32), nullable=False, unique=True)  # roll number, stored upper-case
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(254), nullable=False, unique=True)  # institute email, stored lower-case
    # Set when IIC removes the student. A removed student cannot sign up (C2).
    removed_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    def __repr__(self) -> str:
        return f"<RosterEntry {self.student_number}>"


class Student(db.Model):
    """A student profile linked 1:1 to an IITM BS student's User account."""

    __tablename__ = "student"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True)
    student_number = db.Column(db.String(32), nullable=False, unique=True)  # Roll number
    name = db.Column(db.String(128), nullable=False)
    # 'BSc' or 'BS'. Empty from sign-up (US-01) until the student completes their profile (US-02).
    programme = db.Column(db.String(16))
    cohort = db.Column(db.String(32))
    cgpa = db.Column(db.Float)
    completed_courses = db.Column(db.Text)  # comma-separated course codes or JSON
    career_interest = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", backref=db.backref("student_profile", uselist=False))

    def __repr__(self) -> str:
        return f"<Student {self.student_number} {self.name}>"
