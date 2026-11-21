"""Shared pytest fixtures for the mentoring platform (SCRUM-74).

Provides:
- Isolated test database with automatic rollback/drop
- Unauthenticated client fixture
- Dynamic make_user and login_as helpers
- Per-role user fixtures (student, mentor, iic, leadership)
- Per-role auth header fixtures (Authorization: Bearer <token>)
- Per-role authenticated client fixtures
- Realistic domain entity fixtures (sample_student, sample_mentor, sample_problem, sample_mentorship)
"""

import itertools
from datetime import UTC, datetime, timedelta

import pytest

from app import create_app
from app.auth import services as auth_services
from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.auth.tokens import issue_token
from app.extensions import db
from app.mentors.models import Availability, Mentor
from app.mentorships.models import Mentorship
from app.problems.models import Problem
from app.seed import seed_tags_and_windows
from app.settings.models import EmailDomain
from app.students.models import RosterEntry, Student

PASSWORD = "correct-horse-battery"
_counter = itertools.count(1)


@pytest.fixture
def app():
    """Create an isolated test application with a fresh in-memory / test SQLite database."""
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        auth_services.ensure_roles()
        # Seed domain, tags and timing windows
        if not EmailDomain.query.filter_by(domain="ds.study.iitm.ac.in").first():
            db.session.add(EmailDomain(domain="ds.study.iitm.ac.in", enabled=True))
        seed_tags_and_windows()
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Unauthenticated Flask test client."""
    return app.test_client()


@pytest.fixture
def make_user(app):
    """Create a user: make_user("student"), make_user("iic", email=..., verified=False)."""

    def make(*roles, email=None, password=PASSWORD, verified=True):
        email = email or f"user{next(_counter)}@ds.study.iitm.ac.in"
        domain = EmailDomain.query.filter_by(domain="ds.study.iitm.ac.in").first()
        user = auth_services.create_user(email, password=password, roles=roles, verified=verified)
        if domain:
            user.email_domain_id = domain.id
            db.session.commit()
        return user

    return make


@pytest.fixture
def login_as(make_user):
    """Headers for a request as a user with the given roles: client.get(url, headers=login_as("iic"))."""

    def login(*roles, user=None):
        user = user or make_user(*roles)
        token, _ = issue_token(user)
        return {"Authorization": f"Bearer {token}"}

    return login


# ---------------------------------------------------------------------------
# Per-role User Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def student_user(make_user):
    """A verified user account with the student role."""
    return make_user(STUDENT)


@pytest.fixture
def mentor_user(make_user):
    """A verified user account with the mentor role."""
    return make_user(MENTOR)


@pytest.fixture
def iic_user(make_user):
    """A verified user account with the IIC coordinator role."""
    return make_user(IIC)


@pytest.fixture
def leadership_user(make_user):
    """A verified user account with the programme leadership role."""
    return make_user(LEADERSHIP)


# ---------------------------------------------------------------------------
# Per-role Auth Header Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def auth_headers_student(login_as, student_user):
    """Authorization headers carrying a JWT for student_user."""
    return login_as(user=student_user)


@pytest.fixture
def auth_headers_mentor(login_as, mentor_user):
    """Authorization headers carrying a JWT for mentor_user."""
    return login_as(user=mentor_user)


@pytest.fixture
def auth_headers_iic(login_as, iic_user):
    """Authorization headers carrying a JWT for iic_user."""
    return login_as(user=iic_user)


@pytest.fixture
def auth_headers_leadership(login_as, leadership_user):
    """Authorization headers carrying a JWT for leadership_user."""
    return login_as(user=leadership_user)


# ---------------------------------------------------------------------------
# Per-role Authenticated Client Fixtures
# ---------------------------------------------------------------------------


class AuthenticatedClient:
    """Wrapper around test client that injects authorization headers by default."""

    def __init__(self, client, headers):
        self._client = client
        self._headers = headers

    def _merge_headers(self, kwargs):
        headers = dict(kwargs.get("headers") or {})
        for k, v in self._headers.items():
            headers.setdefault(k, v)
        kwargs["headers"] = headers
        return kwargs

    def get(self, *args, **kwargs):
        return self._client.get(*args, **self._merge_headers(kwargs))

    def post(self, *args, **kwargs):
        return self._client.post(*args, **self._merge_headers(kwargs))

    def put(self, *args, **kwargs):
        return self._client.put(*args, **self._merge_headers(kwargs))

    def patch(self, *args, **kwargs):
        return self._client.patch(*args, **self._merge_headers(kwargs))

    def delete(self, *args, **kwargs):
        return self._client.delete(*args, **self._merge_headers(kwargs))


@pytest.fixture
def student_client(client, auth_headers_student):
    """Pre-authenticated client for student requests."""
    return AuthenticatedClient(client, auth_headers_student)


@pytest.fixture
def mentor_client(client, auth_headers_mentor):
    """Pre-authenticated client for mentor requests."""
    return AuthenticatedClient(client, auth_headers_mentor)


@pytest.fixture
def iic_client(client, auth_headers_iic):
    """Pre-authenticated client for IIC coordinator requests."""
    return AuthenticatedClient(client, auth_headers_iic)


@pytest.fixture
def leadership_client(client, auth_headers_leadership):
    """Pre-authenticated client for leadership requests."""
    return AuthenticatedClient(client, auth_headers_leadership)


# ---------------------------------------------------------------------------
# Domain Model Sample Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def sample_student(student_user):
    """A registered student profile linked to student_user, on IIC's roster as every student is."""
    number = f"22F{next(_counter):07d}"
    student = Student(
        user_id=student_user.id,
        student_number=number,
        name="Sample Student",
        programme="BS",
        cohort="Jan 2022",
        cgpa=8.5,
        completed_courses="Math 1, Python, Linear Algebra, Machine Learning Foundations",
        career_interest="Computer Vision and Deep Learning",
    )
    db.session.add(student)
    db.session.add(RosterEntry(student_number=number, name=student.name, email=student_user.email))
    db.session.commit()
    return student


@pytest.fixture
def sample_mentor(mentor_user, iic_user):
    """An active verified mentor with tags and availability."""
    mentor = Mentor(
        user_id=mentor_user.id,
        name="Sample Mentor",
        biography="Industry engineer with 5+ years of production ML experience.",
        organisation="AI Systems Ltd",
        mentoring_style="Practical guidance and code reviews.",
        preferred_channel="Google Meet",
        time_zone="Asia/Kolkata",
        verification_status="active",
        verified_at=datetime.now(UTC),
        verified_by_user_id=iic_user.id,
        capacity=2,
        available=True,
    )
    db.session.add(mentor)
    db.session.flush()

    avail = Availability(
        mentor_id=mentor.id,
        day_of_week="Saturday",
        start_time="10:00",
        end_time="11:30",
        time_zone="Asia/Kolkata",
    )
    db.session.add(avail)
    db.session.commit()
    return mentor


@pytest.fixture
def sample_problem(sample_student):
    """A problem submitted by sample_student."""
    problem = Problem(
        student_id=sample_student.id,
        title="Sample Problem on Computer Vision Project",
        description="Need guidance on selecting an object detection architecture for course project.",
        status="submitted",
        desired_outcome="Clarity on YOLO vs Faster-RCNN.",
        submitted_at=datetime.now(UTC),
    )
    db.session.add(problem)
    db.session.commit()
    return problem


@pytest.fixture
def sample_mentorship(sample_problem, sample_mentor):
    """An active mentorship pairing sample_problem with sample_mentor."""
    sample_problem.status = "mentor_assigned"
    mentorship = Mentorship(
        problem_id=sample_problem.id,
        mentor_id=sample_mentor.id,
        status="active",
        goal="Complete course project and review benchmarking results.",
        next_steps="1. Train baseline model, 2. Review code on Google Meet.",
        assigned_at=datetime.now(UTC) - timedelta(days=2),
        answered_at=datetime.now(UTC) - timedelta(days=1),
        reached_out_at=datetime.now(UTC) - timedelta(days=1),
    )
    db.session.add(mentorship)
    db.session.commit()
    return mentorship
