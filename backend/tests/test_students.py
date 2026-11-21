"""SCRUM-04/05: a student's profile and their home page (C2)."""

from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.problems.models import Problem

ME = "/api/students/me"
HOME = "/api/students/me/home"


# ---------- Profile ----------


def test_student_reads_their_own_profile(student_client, sample_student):
    response = student_client.get(ME)
    assert response.status_code == 200
    assert response.get_json() == {
        "name": "Sample Student",
        "student_number": sample_student.student_number,
        "email": sample_student.user.email,
        "programme": "BS",
        "cohort": "Jan 2022",
        "cgpa": 8.5,
        "completed_courses": sample_student.completed_courses,
        "career_interest": sample_student.career_interest,
        "complete": True,
    }


def test_profile_is_incomplete_until_every_field_is_filled(student_client, sample_student):
    sample_student.completed_courses = ""
    db.session.commit()
    assert student_client.get(ME).get_json()["complete"] is False


def test_student_updates_their_own_profile(student_client, sample_student):
    response = student_client.put(
        ME,
        json={
            "programme": "BSc",
            "cgpa": 9.1,
            "completed_courses": "Python,  Linear Algebra,\nStatistics",
            "career_interest": "Data engineering",
        },
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["programme"] == "BSc"
    assert body["cgpa"] == 9.1
    assert body["completed_courses"] == "Python, Linear Algebra, Statistics"
    assert body["career_interest"] == "Data engineering"
    assert body["complete"] is True


def test_profile_update_validates_its_fields(student_client, sample_student):
    response = student_client.put(
        ME,
        json={"programme": "PhD", "cgpa": 11, "completed_courses": "", "career_interest": ""},
    )
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"programme", "cgpa", "completed_courses", "career_interest"}


def test_profile_update_boundary_cgpa(student_client, sample_student):
    # Boundary: 0.0 and 10.0 are valid
    res_0 = student_client.put(
        ME,
        json={"programme": "BS", "cgpa": 0.0, "completed_courses": "Intro CS", "career_interest": "Research"},
    )
    assert res_0.status_code == 200
    assert res_0.get_json()["cgpa"] == 0.0

    res_10 = student_client.put(
        ME,
        json={"programme": "BS", "cgpa": 10.0, "completed_courses": "Intro CS", "career_interest": "Research"},
    )
    assert res_10.status_code == 200
    assert res_10.get_json()["cgpa"] == 10.0

    # Negative CGPA is invalid
    res_neg = student_client.put(
        ME,
        json={"programme": "BS", "cgpa": -0.5, "completed_courses": "Intro CS", "career_interest": "Research"},
    )
    assert res_neg.status_code == 422
    assert "cgpa" in res_neg.get_json()["errors"]["json"]


def test_profile_update_ignores_immutable_fields(student_client, sample_student):
    original_name = sample_student.name
    original_number = sample_student.student_number
    response = student_client.put(
        ME,
        json={
            "programme": "BS",
            "cgpa": 8.0,
            "completed_courses": "Intro CS",
            "career_interest": "Software",
            "name": "Hacked Name",
            "student_number": "99F9999999",
        },
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["name"] == original_name
    assert body["student_number"] == original_number


def test_a_mentor_has_no_student_profile(mentor_client):
    assert mentor_client.get(ME).status_code == 403


def test_profile_needs_a_login(client):
    assert client.get(ME).status_code == 401
    assert client.get(HOME).status_code == 401


def test_an_account_without_a_student_profile_gets_404(student_client):
    assert student_client.get(ME).status_code == 404


# ---------- Home ----------


def test_home_shows_the_latest_problem_and_no_mentorship(student_client, sample_student, sample_problem):
    response = student_client.get(HOME)
    assert response.status_code == 200
    body = response.get_json()
    assert body["problem"]["id"] == sample_problem.id
    assert body["problem"]["status"] == "submitted"
    assert body["problem"]["tags"] == []
    assert body["mentorship"] is None
    assert body["profile"] == {"level": "BS", "career_interest": sample_student.career_interest, "course_count": 4}
    assert body["accept_hours"] == 72


def test_home_shows_the_mentor_once_they_have_accepted(student_client, sample_mentorship):
    body = student_client.get(HOME).get_json()
    assert body["mentorship"] == {"reached_out": True, "mentor": "Sample Mentor"}
    assert body["problem"]["status"] == "mentor_assigned"


def test_home_has_no_profile_summary_until_the_profile_is_complete(student_client, sample_student):
    sample_student.career_interest = None
    db.session.commit()
    body = student_client.get(HOME).get_json()
    assert body["profile"] is None


def test_home_uses_the_latest_problem(student_client, sample_student, sample_problem):
    sample_problem.status = "withdrawn"
    newer = Problem(
        student_id=sample_student.id,
        title="A newer problem",
        description="A newer problem the student submitted after withdrawing the first one.",
        status="submitted",
        submitted_at=datetime.now(UTC) + timedelta(minutes=1),
    )
    db.session.add(newer)
    db.session.commit()
    body = student_client.get(HOME).get_json()
    assert body["problem"]["id"] == newer.id
    assert body["problem"]["status"] == "submitted"
