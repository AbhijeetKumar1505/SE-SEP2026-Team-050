"""Tests verifying the realistic seed dataset (SCRUM-70)."""

from app.mentors.models import Mentor
from app.mentorships.models import Mentorship
from app.seed import seed_database
from app.students.models import Student


def test_seed_database_creates_full_dataset(app):
    """Verify seed_database creates mentors, students, tags, problems, and mentorships."""
    counts = seed_database()

    assert counts["topic_tags"] >= 30
    assert counts["timing_windows"] >= 8
    assert counts["mentors"] >= 5
    assert counts["students"] >= 4
    assert counts["problems"] >= 3
    assert counts["mentorships"] >= 2
    assert counts["sessions"] >= 3
    assert counts["feedbacks"] >= 2

    # Verify specific mentor with tags
    arun = Mentor.query.filter_by(name="Arun Kumar").first()
    assert arun is not None
    tag_names = {t.name for t in arun.tags}
    assert "Computer vision" in tag_names
    assert "Deep learning" in tag_names

    # Verify student with roll number
    rahul = Student.query.filter_by(student_number="21F1000001").first()
    assert rahul is not None
    assert rahul.name == "Rahul Sundaram"

    # Verify active mentorship has sessions
    active_m = Mentorship.query.filter_by(status="active").first()
    assert active_m is not None
    assert len(active_m.sessions) > 0
