"""C2 tables: STUDENT, and ROSTER_ENTRY and ROSTER_IMPORT for IIC's roster of registered students.

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


class RosterImport(db.Model):
    """The result of one roster CSV import (US-15), shown to IIC on the roster page."""

    __tablename__ = "roster_import"

    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)
    imported_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="SET NULL"))
    added = db.Column(db.Integer, nullable=False)
    updated = db.Column(db.Integer, nullable=False)
    errors = db.Column(db.JSON, nullable=False)  # [{"row": 14, "reason": "..."}], row 1 being the header
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    imported_by = db.relationship("User")

    def __repr__(self) -> str:
        return f"<RosterImport {self.file_name}>"


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
