from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from ..students.services import get_student
from . import services
from .schemas import ProblemSchema, ProblemWriteSchema, SubmitStatusSchema

blp = ApiBlueprint(
    "problems",
    __name__,
    url_prefix="/api/problems",
    description=("C5 Problem intake: Students' problems, their status and IIC's queue (US-03, US-05, US-16, US-20)."),
)


@blp.route("/me/status")
@blp.stories("US-03")
@blp.auth("student")
@blp.response(200, SubmitStatusSchema)
def submit_status():
    """Can I submit a problem?

    Students have one open problem at a time. `has_open_problem` is true while a submitted problem is
    still with IIC or a mentor, so the form is closed until it is withdrawn or closed.
    """
    student = get_student(get_current_user())
    return {"has_open_problem": services.has_open_problem(student.id)}


@blp.route("", methods=["POST"])
@blp.stories("US-03")
@blp.auth("student")
@blp.errors(409, 422)
@blp.arguments(ProblemWriteSchema)
@blp.response(201, ProblemSchema)
def submit_problem(values):
    """Submit a problem

    The student describes their problem, picks one to five active topic tags and says what they want
    to achieve. IIC reviews it next. A student has one open problem at a time, and must finish their
    profile first, so a duplicate or an incomplete profile gets 409.
    """
    student = get_student(get_current_user())
    return services.serialize_problem(services.submit_problem(student, values, actor=get_current_user()))


@blp.route("/<int:problem_id>", methods=["PUT"])
@blp.stories("US-03")
@blp.auth("student")
@blp.errors(403, 404, 409, 422)
@blp.arguments(ProblemWriteSchema)
@blp.response(200, ProblemSchema)
def update_problem(values, problem_id):
    """Edit my problem

    Only the student who submitted it may edit it, and only until a mentor accepts. After that the
    request is read-only and gets 409.
    """
    problem = services.get_owned_problem(problem_id, user=get_current_user())
    return services.serialize_problem(services.update_problem(problem, values, actor=get_current_user()))


@blp.route("/<int:problem_id>/withdraw", methods=["POST"])
@blp.stories("US-03")
@blp.auth("student")
@blp.errors(403, 404, 409)
@blp.response(200, ProblemSchema)
def withdraw_problem(problem_id):
    """Withdraw my problem

    IIC stops working on it. Like editing, this is only possible until a mentor accepts; after that
    the student asks IIC to change or end the mentorship instead.
    """
    problem = services.get_owned_problem(problem_id, user=get_current_user())
    return services.serialize_problem(services.withdraw_problem(problem, actor=get_current_user()))
