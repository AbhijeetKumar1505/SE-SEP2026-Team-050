"""SCRUM-121 (US-04): up to four recommended mentors for a problem, ranked by a deterministic rule."""

from datetime import UTC, datetime

import pytest

from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.extensions import db
from app.mentors.models import ACTIVE, PENDING, REMOVED, VERIFIED, Mentor
from app.mentorships.models import Mentorship
from app.settings.models import TopicTag

PROBLEM_TAGS = ["Computer vision", "Choosing electives", "Finding internships"]


def url(problem_id, what="recommendations"):
    return f"/api/matching/problems/{problem_id}/{what}"


def tags(*names):
    return [db.session.query(TopicTag).filter_by(name=name).one() for name in names]


@pytest.fixture
def problem(sample_problem):
    sample_problem.tags = tags(*PROBLEM_TAGS)
    db.session.commit()
    return sample_problem


@pytest.fixture
def make_mentor(make_user, problem):
    """An assignable mentor unless told otherwise; `load` adds that many active mentorships."""

    def make(name, tag_names, *, capacity=2, load=0, available=True, status=ACTIVE, verified=True):
        user = make_user(MENTOR, verified=verified)
        mentor = Mentor(
            user_id=user.id,
            name=name,
            verification_status=status,
            capacity=capacity,
            available=available,
            tags=tags(*tag_names),
        )
        db.session.add(mentor)
        db.session.flush()
        for _ in range(load):
            db.session.add(
                Mentorship(problem_id=problem.id, mentor_id=mentor.id, status="active", assigned_at=datetime.now(UTC))
            )
        db.session.commit()
        return mentor

    return make


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


def test_up_to_four_mentors_by_shared_tags_then_fewest_mentees_then_id(client, iic, problem, make_mentor):
    three = make_mentor("Three shared", PROBLEM_TAGS)
    two_busy = make_mentor("Two shared, one mentee", ["Computer vision", "Choosing electives"], load=1)
    two_free = make_mentor("Two shared, free", ["Finding internships", "Computer vision"])
    one_first = make_mentor("One shared", ["Choosing electives", "Job search strategy"])
    make_mentor("One shared, later ID", ["Finding internships"])
    make_mentor("None shared", ["Job search strategy"])

    response = client.get(url(problem.id), headers=iic)

    assert response.status_code == 200
    body = response.get_json()
    assert [m["id"] for m in body] == [three.id, two_free.id, two_busy.id, one_first.id]
    first = body[0]
    assert first["shared_tags"] == sorted(PROBLEM_TAGS)
    assert first["shared_tags_count"] == 3
    busy = body[2]
    assert (busy["shared_tags"], busy["load"], busy["capacity"]) == (["Choosing electives", "Computer vision"], 1, 2)
    assert set(first) >= {"availability", "load", "capacity", "expertise", "status", "available"}


@pytest.mark.parametrize(
    "kwargs",
    [
        {"status": PENDING},
        {"status": VERIFIED},  # verified by IIC but not activated yet
        {"status": REMOVED},
        {"verified": False},
        {"available": False},
        {"capacity": 1, "load": 1},
    ],
    ids=["pending", "not-activated", "removed", "account-unverified", "unavailable", "at-capacity"],
)
def test_mentors_who_cannot_take_the_student_are_left_out(client, iic, problem, make_mentor, kwargs):
    left_out = make_mentor("Left out", PROBLEM_TAGS, **kwargs)
    eligible = make_mentor("Eligible", ["Computer vision"])

    for what in ("recommendations", "eligible-mentors"):
        ids = [m["id"] for m in client.get(url(problem.id, what), headers=iic).get_json()]
        assert left_out.id not in ids
        assert eligible.id in ids


def test_with_no_shared_tag_the_list_is_empty_and_every_eligible_mentor_can_be_browsed(
    client, iic, problem, make_mentor
):
    busy = make_mentor("Busy", ["Job search strategy"], load=1)
    free = make_mentor("Free", ["Technical interview preparation"])
    make_mentor("Unavailable", PROBLEM_TAGS, available=False)

    assert client.get(url(problem.id), headers=iic).get_json() == []

    response = client.get(url(problem.id, "eligible-mentors"), headers=iic)
    assert response.status_code == 200
    body = response.get_json()
    assert [m["id"] for m in body] == [free.id, busy.id]  # fewest mentees first
    assert [m["shared_tags_count"] for m in body] == [0, 0]


def test_eligible_mentors_are_ranked_like_the_recommendations(client, iic, problem, make_mentor):
    none = make_mentor("None shared", ["Job search strategy"])
    two = make_mentor("Two shared", ["Computer vision", "Finding internships"])
    one = make_mentor("One shared", ["Computer vision"])
    body = client.get(url(problem.id, "eligible-mentors"), headers=iic).get_json()
    assert [m["id"] for m in body] == [two.id, one.id, none.id]


def test_fewer_than_four_when_fewer_mentors_share_a_tag(client, iic, problem, make_mentor):
    only = make_mentor("Only match", ["Choosing electives"])
    make_mentor("No match", ["Job search strategy"])
    assert [m["id"] for m in client.get(url(problem.id), headers=iic).get_json()] == [only.id]


@pytest.mark.parametrize("status", ["mentor_assigned", "closed", "withdrawn"])
def test_only_a_problem_waiting_for_a_mentor_gets_recommendations(client, iic, problem, status):
    problem.status = status
    db.session.commit()
    for what in ("recommendations", "eligible-mentors"):
        response = client.get(url(problem.id, what), headers=iic)
        assert response.status_code == 409
        assert response.get_json()["message"] == "This problem is not waiting for a mentor."


def test_a_problem_needing_reassignment_gets_recommendations(client, iic, problem, make_mentor):
    problem.status = "reassignment_needed"
    db.session.commit()
    mentor = make_mentor("Match", ["Computer vision"])
    assert [m["id"] for m in client.get(url(problem.id), headers=iic).get_json()] == [mentor.id]


def test_an_unknown_problem_is_404(client, iic):
    assert client.get(url(999), headers=iic).status_code == 404


@pytest.mark.parametrize("what", ["recommendations", "eligible-mentors"])
@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_sees_recommendations(client, login_as, problem, what, role):
    assert client.get(url(problem.id, what), headers=login_as(role)).status_code == 403
    assert client.get(url(problem.id, what)).status_code == 401
