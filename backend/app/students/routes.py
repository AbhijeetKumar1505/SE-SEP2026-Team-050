from ..auth.access import get_current_user
from ..mentorships.services import active_mentorship_for
from ..openapi import ApiBlueprint
from ..problems.services import latest_problem, serialize_problem
from ..settings.services import timing_hours
from . import services
from .schemas import HomeSchema, StudentProfileSchema, StudentProfileUpdateSchema

blp = ApiBlueprint(
    "students",
    __name__,
    url_prefix="/api/students",
    description=(
        "C2 Students and roster: IIC's roster of registered students and each student's profile (US-02, US-15)."
    ),
)


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
