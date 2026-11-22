from ..openapi import ApiBlueprint
from . import services
from .schemas import CandidateMentorSchema

blp = ApiBlueprint(
    "matching",
    __name__,
    url_prefix="/api/matching",
    description="C6 Recommendations: Up to 4 ranked mentors for a problem, with reasons (US-04).",
)


@blp.route("/problems/<int:problem_id>/recommendations")
@blp.stories("US-04")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.response(200, CandidateMentorSchema(many=True))
def recommendations(problem_id):
    """Recommend mentors for a problem

    Up to 4 mentors who share at least one topic tag with the problem, best match first: most shared
    tags, then fewest active mentees, then the lowest mentor ID. Only mentors who could take the
    student now are included: verified and activated, available, and below their capacity.

    Each mentor shows the shared tags, their availability and their load against capacity. When no
    eligible mentor shares a tag, the list is empty: browse the eligible mentors instead. 409 if the
    problem is no longer waiting for a mentor.
    """
    return services.recommended_for(problem_id)


@blp.route("/problems/<int:problem_id>/eligible-mentors")
@blp.stories("US-04", "US-16")
@blp.auth("iic")
@blp.errors(404, 409)
@blp.response(200, CandidateMentorSchema(many=True))
def eligible_mentors(problem_id):
    """List every mentor who could take the problem

    All verified, activated and available mentors below their capacity, ranked like the
    recommendations, including those who share no tag with the problem. For when IIC wants to look
    beyond the recommendations.
    """
    return services.eligible_for(problem_id)
