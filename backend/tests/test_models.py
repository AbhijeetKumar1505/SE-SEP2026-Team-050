"""Tests verifying all 22 tables of the Milestone 2 ER design (SCRUM-70)."""

from datetime import UTC, datetime

from app.audit.models import AuditLog
from app.auth.models import EmailVerification, Role, User
from app.cases.models import CaseRecord
from app.extensions import db
from app.feedback.models import Feedback
from app.matching.models import Recommendation
from app.mentors.models import Availability, Mentor
from app.mentorships.models import Mentorship
from app.monitoring.models import MonitoringFlag
from app.notifications.models import EmailTemplate, Notification
from app.problems.models import Problem
from app.sessions.models import Session
from app.settings.models import EmailDomain, TimingWindow, TopicTag
from app.students.models import Student


def test_all_22_tables_registered_in_metadata(app):
    """Verify that all 22 tables from Section 3.1 (+ revoked_token) exist in db.metadata."""
    expected_tables = {
        "user",
        "role",
        "user_role",
        "revoked_token",
        "email_verification",
        "email_domain",
        "student",
        "mentor",
        "availability",
        "mentor_tag",
        "topic_tag",
        "problem",
        "problem_tag",
        "recommendation",
        "mentorship",
        "session",
        "feedback",
        "case_record",
        "timing_window",
        "monitoring_flag",
        "email_template",
        "notification",
        "audit_log",
    }
    actual_tables = set(db.metadata.tables.keys())
    missing = expected_tables - actual_tables
    assert not missing, f"Missing expected tables in metadata: {missing}"


def test_student_and_mentor_profile_creation(app, student_user, mentor_user, iic_user):
    """Verify student and mentor profile creation with relationships."""
    student = Student(
        user_id=student_user.id,
        student_number="21F9999999",
        name="Test Student",
        programme="BS",
        cohort="May 2021",
        cgpa=9.0,
    )
    db.session.add(student)

    mentor = Mentor(
        user_id=mentor_user.id,
        name="Test Mentor",
        biography="Experienced mentor",
        organisation="IIT Madras",
        verification_status="active",
        verified_by_user_id=iic_user.id,
        capacity=1,
    )
    db.session.add(mentor)
    db.session.commit()

    assert student.user.email == student_user.email
    assert student_user.student_profile.student_number == "21F9999999"

    assert mentor.user.email == mentor_user.email
    assert mentor_user.mentor_profile.name == "Test Mentor"
    assert mentor.verified_by.id == iic_user.id


def test_problem_tagging_and_recommendation(app, sample_student, sample_mentor):
    """Verify problem submission, topic tags, and recommendation link."""
    tag1 = TopicTag.query.filter_by(name="Computer vision").first()
    tag2 = TopicTag.query.filter_by(name="Deep learning").first()

    sample_mentor.tags.extend([tag1, tag2])
    db.session.commit()

    problem = Problem(
        student_id=sample_student.id,
        title="Vision model optimization",
        description="Help with quantizing deep learning models for deployment.",
        status="submitted",
    )
    problem.tags.extend([tag1, tag2])
    db.session.add(problem)
    db.session.commit()

    rec = Recommendation(
        problem_id=problem.id,
        mentor_id=sample_mentor.id,
        score=1.0,
        rank=1,
        shared_tags_count=2,
    )
    db.session.add(rec)
    db.session.commit()

    assert len(problem.tags) == 2
    assert problem.recommendations[0].mentor.name == sample_mentor.name
    assert rec.shared_tags_count == 2


def test_mentorship_lifecycle_session_and_feedback(app, sample_mentorship, student_user, mentor_user):
    """Verify mentorship lifecycle, sessions, progress feedback and audit logging."""
    session = Session(
        mentorship_id=sample_mentorship.id,
        status="held",
        duration_minutes=60,
        topic_category="Technical review",
        channel="Google Meet",
        logged_by_user_id=mentor_user.id,
        confirmed_by_user_id=student_user.id,
        held_at=datetime.now(UTC),
    )
    db.session.add(session)

    feedback = Feedback(
        mentorship_id=sample_mentorship.id,
        author_user_id=student_user.id,
        progress_status="goal_met",
        rating=5,
        comments="Great session, accomplished all goals.",
    )
    db.session.add(feedback)

    audit = AuditLog(
        actor_user_id=mentor_user.id,
        action="log_session",
        entity_type="session",
        entity_id=session.id,
        details="Logged 60 min session.",
    )
    db.session.add(audit)
    db.session.commit()

    assert sample_mentorship.sessions[0].duration_minutes == 60
    assert sample_mentorship.feedbacks[0].progress_status == "goal_met"
    assert audit.entity_type == "session"


def test_cases_and_monitoring_flags(app, sample_mentorship, student_user, iic_user):
    """Verify case records and monitoring flags."""
    case = CaseRecord(
        mentorship_id=sample_mentorship.id,
        reporter_user_id=student_user.id,
        case_type="change",
        status="under_review",
        details="Request to change project focus to Natural Language Processing.",
    )
    db.session.add(case)

    window = TimingWindow.query.filter_by(rule_name="first_session_overdue").first()
    flag = MonitoringFlag(
        mentorship_id=sample_mentorship.id,
        timing_window_id=window.id if window else None,
        flag_type="first_session_overdue",
        status="active",
    )
    db.session.add(flag)
    db.session.commit()

    assert case.status == "under_review"
    assert sample_mentorship.cases[0].case_type == "change"
    assert sample_mentorship.monitoring_flags[0].flag_type == "first_session_overdue"
