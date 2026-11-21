from ..auth.access import get_current_user
from ..mentorships.services import active_mentorship_for
from ..openapi import ApiBlueprint
from ..problems.services import latest_problem, serialize_problem
from ..settings.services import timing_hours
from . import services
from .schemas import (
    HomeSchema,
    RemoveReasonSchema,
    RosterAddSchema,
    RosterImportResultSchema,
    RosterImportSchema,
    RosterSchema,
    RosterStudentSchema,
    StudentProfileSchema,
    StudentProfileUpdateSchema,
)

blp = ApiBlueprint(
    "students",
    __name__,
    url_prefix="/api/students",
    description=(
        "C2 Students and roster: IIC's roster of registered students and each student's profile (US-02, US-15)."
    ),
)


@blp.route("/roster")
@blp.stories("US-15")
@blp.auth("iic")
@blp.response(200, RosterSchema)
def get_roster():
    """List the roster

    Every student IIC has registered and not removed, by name, with whether they have signed up
    (verified their email) and completed their profile. `last_import` is the result of the latest
    CSV import, or null.
    """
    rows = [services.serialize_roster_row(*row) for row in services.roster_with_accounts()]
    record = services.last_import()
    return {"students": rows, "last_import": services.serialize_import(record) if record else None}


@blp.route("/roster/import", methods=["POST"])
@blp.stories("US-15")
@blp.auth("iic")
@blp.arguments(RosterImportSchema)
@blp.response(200, RosterImportResultSchema)
def import_roster(values):
    """Import the roster from a CSV file

    The CSV template has three columns: `name`, `roll number` and `institute email`. The web app
    reads the file and sends its rows here as `name`, `roll_number` and `institute_email`.

    Each row is checked on its own. Valid rows are saved: a roll number already on the roster is
    updated instead of duplicated, and a removed student is put back. Invalid rows are returned in
    `errors` with their CSV row number (the header is row 1) and the reason, for example an invalid
    roll number, an email outside the approved domains, or a roll number repeated in the file.
    """
    record = services.import_roster(values["file"], values["rows"], actor=get_current_user())
    return services.serialize_import(record)


@blp.route("/roster", methods=["POST"])
@blp.stories("US-15")
@blp.auth("iic")
@blp.errors(409)
@blp.arguments(RosterAddSchema)
@blp.response(201, RosterStudentSchema)
def add_to_roster(values):
    """Add one student to the roster

    Uses the same checks as the CSV import: 422 with the reason for an invalid name, roll number
    or email, and 409 when the roll number is already on the roster or the email belongs to another
    roll number. A removed student is put back.
    """
    entry = services.add_to_roster(
        values["name"], values["roll_number"], values["institute_email"], actor=get_current_user()
    )
    student = services.student_with_number(entry.student_number)
    return services.serialize_roster_row(entry, student, student.user.email_verified_at if student else None)


@blp.route("/roster/<int:entry_id>/remove", methods=["POST"])
@blp.stories("US-15")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.arguments(RemoveReasonSchema)
@blp.response(204)
def remove_from_roster(values, entry_id):
    """Remove a student from the roster

    The student can no longer sign up or submit a new problem: both are refused with "You are not
    registered with IIC". An account they already have, and any mentorship in progress, carry on.
    The reason is kept in the audit log.
    """
    services.remove_from_roster(entry_id, values["reason"], actor=get_current_user())


@blp.route("/me")
@blp.stories("US-02")
@blp.auth("student")
@blp.errors(404)
@blp.response(200, StudentProfileSchema)
def get_profile():
    """Get my profile

    The student's name and roll number come from IIC's roster and cannot be edited here. `complete`
    is false until the student has filled in the programme, CGPA, courses and career interest.
    """
    return services.serialize_profile(services.get_student(get_current_user()))


@blp.route("/me", methods=["PUT"])
@blp.stories("US-02")
@blp.auth("student")
@blp.errors(404, 422)
@blp.arguments(StudentProfileUpdateSchema)
@blp.response(200, StudentProfileSchema)
def update_profile(values):
    """Update my profile

    Saves the programme level, CGPA, completed courses and career interest. The CGPA is visible only
    to IIC.
    """
    student = services.get_student(get_current_user())
    return services.serialize_profile(services.update_profile(student, values, actor=get_current_user()))


@blp.route("/me/home")
@blp.stories("US-02", "US-03", "US-05")
@blp.auth("student")
@blp.errors(404)
@blp.response(200, HomeSchema)
def home():
    """My student home

    One request for the student's home page: their latest problem, their active mentorship if a
    mentor has accepted, and a summary of their profile. `accept_hours` is the time a mentor has to
    respond, from IIC's timing settings.
    """
    student = services.get_student(get_current_user())
    problem = latest_problem(student.id)
    mentorship = active_mentorship_for(student.id)
    profile = (
        {
            "level": student.programme,
            "career_interest": student.career_interest,
            "course_count": len([course for course in (student.completed_courses or "").split(",") if course.strip()]),
        }
        if services.is_complete(student)
        else None
    )
    return {
        "problem": serialize_problem(problem) if problem is not None else None,
        "mentorship": (
            {"reached_out": mentorship.reached_out_at is not None, "mentor": mentorship.mentor.name}
            if mentorship is not None
            else None
        ),
        "profile": profile,
        "accept_hours": timing_hours("assignment_response", 72),
    }
