"""C2 business rules: IIC's roster (US-15) and a student's own profile (US-02)."""

import re

from flask_smorest import abort
from sqlalchemy import func

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..models import utcnow
from ..settings.services import approved_domain
from .models import RosterEntry, RosterImport, Student


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


def require_on_roster(student: Student) -> None:
    """403 for a student IIC has removed from the roster (US-15): no new problems."""
    if roster_entry(student.student_number) is None:
        abort(403, message=NOT_REGISTERED)


# IIC's roster (US-15). Columns of the CSV template: name, roll number, institute email.

NOT_REGISTERED = "You are not registered with IIC. Please contact IIC to register."
ROLL_NUMBER = re.compile(r"^\d{2}F\d{7}$")  # e.g. 23F1002345
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_NAME = 128


def roster_with_accounts():
    """Every student on the roster, by name, with their account and profile if they have signed up."""
    return (
        db.session.query(RosterEntry, Student, User.email_verified_at)
        .outerjoin(Student, func.upper(Student.student_number) == RosterEntry.student_number)
        .outerjoin(User, User.id == Student.user_id)
        .filter(RosterEntry.removed_at.is_(None))
        .order_by(RosterEntry.name, RosterEntry.student_number)
        .all()
    )


def serialize_roster_row(entry: RosterEntry, student: Student | None, verified_at) -> dict:
    signed_up = student is not None and verified_at is not None
    return {
        "id": entry.id,
        "name": entry.name,
        "roll": entry.student_number,
        "email": entry.email,
        "signed_up": signed_up,
        "profile_complete": signed_up and is_complete(student),
    }


def last_import() -> RosterImport | None:
    return db.session.query(RosterImport).order_by(RosterImport.created_at.desc(), RosterImport.id.desc()).first()


def serialize_import(record: RosterImport) -> dict:
    return {
        "file": record.file_name,
        "imported_by": record.imported_by.email if record.imported_by is not None else None,
        "imported_at": record.created_at,
        "added": record.added,
        "updated": record.updated,
        "errors": record.errors,
    }


def _clean_row(name, roll_number, email) -> tuple[str, str, str]:
    return " ".join((name or "").split()), normalize_roll_number(roll_number or ""), (email or "").strip().lower()


def _row_problem(name: str, roll_number: str, email: str) -> str | None:
    """Why a roster row cannot be saved, or None. The same rules apply to the import and to adding one."""
    if not name:
        return "Name is missing."
    if len(name) > MAX_NAME:
        return f"Name is longer than {MAX_NAME} characters."
    if not ROLL_NUMBER.match(roll_number):
        return "Roll number is not valid. Use the form 23f1002345."
    if not EMAIL.match(email) or len(email) > 254:
        return "Institute email is not a valid email address."
    if approved_domain(email) is None:
        return "Institute email is not on an approved domain."
    return None


def import_roster(file_name: str, rows: list[dict], *, actor: User) -> RosterImport:
    """US-15: add or update the roster from CSV rows, and report the rows that could not be saved.

    A roll number already on the roster is updated, not duplicated, and a removed student is put
    back. Signed-up students take the new name. Row numbers count the CSV header as row 1.
    """
    entries = {entry.student_number: entry for entry in db.session.query(RosterEntry)}
    by_email = {entry.email: entry for entry in entries.values()}
    students = {student.student_number.upper(): student for student in db.session.query(Student)}
    rows_seen: dict[str, int] = {}
    emails_seen: dict[str, int] = {}
    added = updated = 0
    errors = []

    for row_number, row in enumerate(rows, start=2):
        name, roll_number, email = _clean_row(row.get("name"), row.get("roll_number"), row.get("institute_email"))
        reason = _row_problem(name, roll_number, email)
        if reason is None and roll_number in rows_seen:
            reason = f"Roll number {roll_number} is already in row {rows_seen[roll_number]} of this file."
        if reason is None and email in emails_seen:
            reason = f"Institute email {email} is already in row {emails_seen[email]} of this file."
        entry = entries.get(roll_number)
        holder = by_email.get(email)
        if reason is None and holder is not None and holder is not entry:
            reason = f"Institute email {email} is already registered for roll number {holder.student_number}."
        if reason is not None:
            errors.append({"row": row_number, "reason": reason})
            continue

        rows_seen[roll_number] = emails_seen[email] = row_number
        if entry is None:
            entry = RosterEntry(student_number=roll_number, name=name, email=email)
            db.session.add(entry)
            entries[roll_number] = entry
            added += 1
        else:
            by_email.pop(entry.email, None)
            entry.name, entry.email, entry.removed_at = name, email, None
            updated += 1
        by_email[email] = entry
        if roll_number in students:
            students[roll_number].name = name

    record = RosterImport(file_name=file_name, imported_by=actor, added=added, updated=updated, errors=errors)
    db.session.add(record)
    db.session.flush()
    audit.record(
        "import_roster",
        "roster_import",
        record.id,
        actor=actor,
        details=f"{file_name}: {added} added, {updated} updated, {len(errors)} rows refused.",
    )
    db.session.commit()
    return record


def add_to_roster(name: str, roll_number: str, email: str, *, actor: User) -> RosterEntry:
    """Put one student on the roster: 422 for an invalid row, 409 if the roll number or email is taken."""
    name, roll_number, email = _clean_row(name, roll_number, email)
    reason = _row_problem(name, roll_number, email)
    if reason is not None:
        abort(422, message=reason)
    entry = db.session.query(RosterEntry).filter_by(student_number=roll_number).one_or_none()
    if entry is not None and entry.removed_at is None:
        abort(409, message=f"Roll number {roll_number} is already on the roster.")
    holder = db.session.query(RosterEntry).filter_by(email=email).one_or_none()
    if holder is not None and holder is not entry:
        abort(409, message=f"Institute email {email} is already registered for roll number {holder.student_number}.")
    if entry is None:
        entry = RosterEntry(student_number=roll_number, name=name, email=email)
        db.session.add(entry)
    else:  # a removed student is put back
        entry.name, entry.email, entry.removed_at = name, email, None
    db.session.flush()
    audit.record("add_to_roster", "roster_entry", entry.id, actor=actor, details=f"Added {roll_number}.")
    db.session.commit()
    return entry


def remove_from_roster(entry_id: int, reason: str, *, actor: User) -> None:
    """Take a student off the roster. They can no longer sign up or submit a new problem (US-15)."""
    entry = db.session.get(RosterEntry, entry_id)
    if entry is None:
        abort(404, message=f"No roster entry with ID {entry_id}.")
    if entry.removed_at is not None:
        abort(409, message=f"{entry.student_number} has already been removed from the roster.")
    entry.removed_at = utcnow()
    audit.record("remove_from_roster", "roster_entry", entry.id, actor=actor, details=reason.strip())
    db.session.commit()


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
