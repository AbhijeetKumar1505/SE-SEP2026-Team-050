"""C2 business rules: IIC's roster (US-15) and a student's own profile (US-02)."""

from flask_smorest import abort
from sqlalchemy import func

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from .models import RosterEntry, Student


def normalize_roll_number(roll_number: str) -> str:
    """Roll numbers are compared without case or surrounding spaces: 23f1002345 is 23F1002345."""
    return roll_number.strip().upper()


def roster_entry(roll_number: str) -> RosterEntry | None:
    """The roster entry for a roll number, if IIC has registered the student and not removed them."""
    return (
        db.session.query(RosterEntry)
        .filter(RosterEntry.student_number == normalize_roll_number(roll_number), RosterEntry.removed_at.is_(None))
        .one_or_none()
    )


def student_with_number(roll_number: str) -> Student | None:
    """The student profile, and so the account, already created for a roll number."""
    return (
        db.session.query(Student)
        .filter(func.upper(Student.student_number) == normalize_roll_number(roll_number))
        .one_or_none()
    )


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
