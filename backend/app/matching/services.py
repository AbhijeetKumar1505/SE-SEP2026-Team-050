"""C6 business rules: rank the mentors IIC can assign to a problem (US-04).

The rule is deterministic, with no machine learning: most topic tags shared with the problem first,
then fewest active mentees, then the lowest mentor ID. Only mentors who could take the student now
are ranked: active and available (mentors.services.assignable_mentors), and below their capacity.
Recommendations are worked out on each request and not stored.
"""

from typing import NamedTuple

from flask_smorest import abort

from ..extensions import db
from ..mentors.models import Mentor
from ..mentors.services import assignable_mentors, pool_loads, serialize_pool_mentor
from ..problems.models import Problem

MAX_RECOMMENDATIONS = 4
# A problem can be matched until a mentor has accepted it, and again when it needs reassignment.
MATCHABLE_STATUSES = {"submitted", "under_review", "awaiting_mentor", "reassignment_needed"}


class Candidate(NamedTuple):
    mentor: Mentor
    shared_tags: list[str]
    load: int


def get_matchable_problem(problem_id: int) -> Problem:
    """The problem, if it is still waiting for a mentor: 404 if unknown, 409 if assigned, closed or withdrawn."""
    problem = db.session.get(Problem, problem_id)
    if problem is None:
        abort(404, message=f"No problem with ID {problem_id}.")
    if problem.status not in MATCHABLE_STATUSES:
        abort(409, message="This problem is not waiting for a mentor.")
    return problem


def ranked_candidates(problem: Problem, loads: dict[int, int]) -> list[Candidate]:
    """Every mentor who could take this student now, best match first."""
    problem_tags = {tag.id: tag.name for tag in problem.tags}
    candidates = []
    for mentor in assignable_mentors():
        load = loads.get(mentor.id, 0)
        if load >= mentor.capacity:
            continue
        shared = sorted(problem_tags[tag.id] for tag in mentor.tags if tag.id in problem_tags)
        candidates.append(Candidate(mentor, shared, load))
    candidates.sort(key=lambda c: (-len(c.shared_tags), c.load, c.mentor.id))
    return candidates


def recommendations(problem: Problem, loads: dict[int, int]) -> list[Candidate]:
    """Up to four candidates who share at least one topic tag with the problem (US-04)."""
    return [c for c in ranked_candidates(problem, loads) if c.shared_tags][:MAX_RECOMMENDATIONS]


def serialize(candidates: list[Candidate], loads: dict[int, int], asked: set[int]) -> list[dict]:
    return [
        {
            **serialize_pool_mentor(c.mentor, loads, asked),
            "shared_tags": c.shared_tags,
            "shared_tags_count": len(c.shared_tags),
        }
        for c in candidates
    ]


def recommended_for(problem_id: int) -> list[dict]:
    problem = get_matchable_problem(problem_id)
    loads, asked = pool_loads()
    return serialize(recommendations(problem, loads), loads, asked)


def eligible_for(problem_id: int) -> list[dict]:
    problem = get_matchable_problem(problem_id)
    loads, asked = pool_loads()
    return serialize(ranked_candidates(problem, loads), loads, asked)
