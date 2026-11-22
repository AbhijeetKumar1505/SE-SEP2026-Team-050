from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from ..students.services import get_student
from . import queue, services
from .schemas import (
    AssignSchema,
    CloseProblemSchema,
    ProblemReviewSchema,
    ProblemSchema,
    ProblemWriteSchema,
    QueueSchema,
    SubmitStatusSchema,
)

blp = ApiBlueprint(
    "problems",
    __name__,
    url_prefix="/api/problems",
    description=("C5 Problem intake: Students' problems, their status and IIC's queue (US-03, US-05, US-16, US-20)."),
)


# IIC's queue, review, assignment and closure (US-16)


@blp.route("/queue")
@blp.stories("US-16")
@blp.auth("iic")
@blp.response(200, QueueSchema)
def get_queue():
    """List IIC's problem queue

    Problems waiting for IIC: *Reassignment needed* first, then the oldest first. Each comes with
    the student's profile and, while a mentor is being asked, who was asked and by when they must
    answer.
    """
    return {"problems": [queue.serialize(problem) for problem in queue.queue()]}


@blp.route("/<int:problem_id>")
@blp.stories("US-16", "US-05", "US-20")
@blp.auth("iic")
@blp.errors(404)
@blp.response(200, ProblemReviewSchema)
def review_problem(problem_id):
    """Open a problem for review

    The problem, its topic tags and guidance preferences, and the student's profile. Opening a
    *Submitted* problem moves it to *Under review*, which the student sees. Recommended mentors come
    from `GET /api/matching/problems/{id}/recommendations`.
    """
    return queue.serialize(queue.open_for_review(problem_id, actor=get_current_user()))


@blp.route("/<int:problem_id>/assign", methods=["POST"])
@blp.stories("US-16", "US-09")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.arguments(AssignSchema)
@blp.response(200, ProblemReviewSchema)
def assign_mentor(values, problem_id):
    """Assign a mentor

    Creates a pending mentorship and asks the mentor to accept within the response window (72 hours
    by default). The problem moves to *Awaiting mentor*, the mentor's load rises by one, and both the
    mentor and the student are notified.

    409 when the problem is not waiting for a mentor, the student already has a mentor or a pending
    assignment, the mentor is not active or not available, or the mentor is at capacity. A mentor at
    capacity can be assigned once they agree to take an extra student (US-10).
    """
    return queue.serialize(queue.assign_mentor(problem_id, values["mentor_id"], actor=get_current_user()))


@blp.route("/<int:problem_id>/close", methods=["POST"])
@blp.stories("US-16")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.arguments(CloseProblemSchema)
@blp.response(200, ProblemReviewSchema)
def close_problem(values, problem_id):
    """Close a problem without a mentor

    For example when it is outside what the programme covers. The reason is required, kept in the
    audit log and sent to the student. 409 unless the problem is waiting for a mentor.
    """
    return queue.serialize(queue.close_problem(problem_id, values["reason"], actor=get_current_user()))


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
@blp.stories("US-03", "US-15")
@blp.auth("student")
@blp.errors(409, 422)
@blp.arguments(ProblemWriteSchema)
@blp.response(201, ProblemSchema)
def submit_problem(values):
    """Submit a problem

    The student describes their problem, picks one to five active topic tags and says what they want
    to achieve. IIC reviews it next. A student has one open problem at a time, and must finish their
    profile first, so a duplicate or an incomplete profile gets 409. A student IIC has removed from
    the roster gets 403 "You are not registered with IIC" (US-15).
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
