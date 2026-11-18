"""C2 business rules for a student's own profile (US-02)."""

from flask_smorest import abort

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from .models import Student


def get_student(user: User) -> Student:
    """The student profile of the logged-in user, or 404 for an account without one."""
    student = db.session.query(Student).filter_by(user_id=user.id).one_or_none()
    if student is None:
        abort(404, message="You do not have a student profile.")
    return student


def is_complete(student: Student) -> bool:
    """A profile is complete once the student has filled in every field the form asks for."""
    return bool(
        student.programme
        and student.cgpa is not None
        and student.completed_courses
        and student.completed_courses.strip()
        and student.career_interest
        and student.career_interest.strip()
    )


def serialize_profile(student: Student) -> dict:
    return {
        "name": student.name,
        "student_number": student.student_number,
        "email": student.user.email,
        "programme": student.programme,
        "cohort": student.cohort,
        "cgpa": student.cgpa,
        "completed_courses": student.completed_courses,
        "career_interest": student.career_interest,
        "complete": is_complete(student),
    }


def update_profile(student: Student, values: dict, *, actor: User) -> Student:
    """Save the fields the student may edit. CGPA is kept here for IIC only."""
    student.programme = values["programme"]
    student.cgpa = values["cgpa"]
    student.completed_courses = " ".join(values["completed_courses"].split())
    student.career_interest = values["career_interest"].strip()
    audit.record("update_student_profile", "student", student.id, actor=actor, details="Student updated their profile.")
    db.session.commit()
    return student
