"""Seed data for development, testing, and sprint submissions (SCRUM-70).

Seeds:
- Standard roles and email domains
- 30 Topic Tags from Milestone 2 design (docs/topic-tags/01-topic-tags.md)
- Standard Timing Windows (C4/C11)
- Verified mentors with tags, availability, and profiles
- Registered students with complete profiles and roll numbers
- Realistic problem submissions, recommendations, mentorship pairings, sessions, and feedback
"""

from datetime import UTC, datetime, timedelta

import click
from flask.cli import with_appcontext

from .audit.models import AuditLog
from .auth import services as auth_services
from .auth.models import IIC, LEADERSHIP, MENTOR, STUDENT, User
from .extensions import db
from .feedback.models import Feedback
from .matching.models import Recommendation
from .mentors.models import Availability, Mentor
from .mentorships.models import Mentorship
from .notifications.services import ensure_templates
from .problems.models import Problem
from .sessions.models import Session
from .settings.models import EmailDomain, TimingWindow, TopicTag
from .students.models import Student

DEFAULT_PASSWORD = "Password123!"

TOPIC_TAGS_DATA = [
    # Career direction
    ("Choosing a career path", "Career direction"),
    ("Industry and role requirements", "Career direction"),
    # Jobs and internships
    ("Finding internships", "Jobs and internships"),
    ("Job search strategy", "Jobs and internships"),
    ("Technical interview preparation", "Jobs and internships"),
    ("Resume and portfolio", "Jobs and internships"),
    # Technical skills
    ("Data structures and algorithms (DSA)", "Technical skills"),
    ("SQL and database design", "Technical skills"),
    ("Python programming", "Technical skills"),
    ("Deep learning", "Technical skills"),
    ("Computer vision", "Technical skills"),
    ("Speech technology", "Technical skills"),
    ("Natural language processing", "Technical skills"),
    ("Data and business analytics", "Technical skills"),
    ("Web and app development", "Technical skills"),
    ("Data engineering", "Technical skills"),
    ("VLSI and core electronics", "Technical skills"),
    # Higher studies and research
    ("Master's or PhD abroad", "Higher studies and research"),
    ("Research careers", "Higher studies and research"),
    ("GATE and higher studies in India", "Higher studies and research"),
    ("Computational neuroscience", "Higher studies and research"),
    # Courses and academics
    ("Choosing electives", "Courses and academics"),
    ("Planning a term's course load", "Courses and academics"),
    ("Getting through a difficult course", "Courses and academics"),
    ("Improving CGPA", "Courses and academics"),
    # Projects
    ("Stuck on a course project", "Projects"),
    ("Niche or research project", "Projects"),
    # Entrepreneurship
    ("Starting a startup", "Entrepreneurship"),
    ("Joining or growing a family business", "Entrepreneurship"),
    # Catch-all
    ("Other", "Catch-all"),
]

TIMING_WINDOWS_DATA = [
    ("assignment_reminder", 48, "Reminder to mentor 48 hours after assignment"),
    ("assignment_response", 72, "Window for mentor to accept or decline before expiry"),
    ("first_session_reminder", 168, "Reminder to both participants after 7 days without a held session"),
    ("first_session_overdue", 240, "Flag first session overdue after 10 days without a session"),
    ("session_inactive", 336, "Flag mentorship inactive after 14 days without a held session"),
    ("reassignment_needed", 504, "Reassignment needed flag 7 days after inactive flag"),
    ("feedback_checkpoint", 336, "Feedback checkpoint interval every 14 days / 2 weeks"),
    ("feedback_overdue", 168, "Flag feedback overdue 7 days after checkpoint falls due"),
]


def seed_tags_and_windows() -> dict[str, TopicTag]:
    """Seed topic tags and timing windows if not already present."""
    tag_map = {}
    for name, category in TOPIC_TAGS_DATA:
        tag = TopicTag.query.filter_by(name=name).first()
        if not tag:
            tag = TopicTag(name=name, category=category, retired=False)
            db.session.add(tag)
        tag_map[name] = tag

    for rule_name, hours, desc in TIMING_WINDOWS_DATA:
        window = TimingWindow.query.filter_by(rule_name=rule_name).first()
        if not window:
            window = TimingWindow(rule_name=rule_name, hours=hours, enabled=True, description=desc)
            db.session.add(window)

    db.session.flush()
    return tag_map


def seed_database() -> dict[str, int]:
    """Populate full realistic dataset and return counts of created entities."""
    auth_services.ensure_roles()

    # 1. Approved email domains
    for domain_name in ("ds.study.iitm.ac.in", "study.iitm.ac.in"):
        if not EmailDomain.query.filter_by(domain=domain_name).first():
            db.session.add(EmailDomain(domain=domain_name, enabled=True))
    db.session.flush()
    email_domain = EmailDomain.query.filter_by(domain="ds.study.iitm.ac.in").first()

    # 2. Topic Tags & Timing Windows
    tags = seed_tags_and_windows()

    # Helper to get or create a user
    def get_or_create_user(email: str, roles: tuple[str, ...]) -> User:
        user = User.query.filter_by(email=email).first()
        if not user:
            user = auth_services.create_user(
                email=email,
                password=DEFAULT_PASSWORD,
                roles=roles,
                verified=True,
            )
            if email_domain:
                user.email_domain_id = email_domain.id
                db.session.flush()
        return user

    # 3. Staff accounts
    iic_user = get_or_create_user("deepa.iic@ds.study.iitm.ac.in", (IIC,))
    get_or_create_user("leadership@ds.study.iitm.ac.in", (LEADERSHIP,))

    # 4. Mentors
    mentors_spec = [
        {
            "email": "arun.mentor@ds.study.iitm.ac.in",
            "name": "Arun Kumar",
            "bio": (
                "Senior Computer Vision Engineer at Robotics India with 6+ years in deep learning, "
                "object detection and edge deployment."
            ),
            "org": "Robotics India",
            "style": "Code reviews, architecture diagrams and hands-on debugging.",
            "channel": "Google Meet",
            "tags": ["Computer vision", "Deep learning", "Python programming"],
            "slots": [("Monday", "18:00", "19:00"), ("Saturday", "10:00", "11:30")],
        },
        {
            "email": "priya.mentor@ds.study.iitm.ac.in",
            "name": "Dr. Priya Sharma",
            "bio": (
                "Research Scientist specializing in Speech recognition and NLP. Alumna of IIT Madras with "
                "publications at INTERSPEECH and ICASSP."
            ),
            "org": "SpeechAI Research Labs",
            "style": "Research methodology, literature reading strategies and paper critique.",
            "channel": "Google Meet",
            "tags": ["Speech technology", "Natural language processing", "Research careers"],
            "slots": [("Wednesday", "19:00", "20:00"), ("Sunday", "11:00", "12:00")],
        },
        {
            "email": "rohit.mentor@ds.study.iitm.ac.in",
            "name": "Rohit Verma",
            "bio": (
                "Staff Backend Engineer with expertise in relational database architecture, distributed systems, "
                "and Python/Flask microservices."
            ),
            "org": "FinTech Core Corp",
            "style": "System design reviews, database indexing strategies and industry best practices.",
            "channel": "Google Meet",
            "tags": ["SQL and database design", "Python programming", "Web and app development"],
            "slots": [("Tuesday", "18:30", "19:30"), ("Thursday", "18:30", "19:30")],
        },
        {
            "email": "sneha.mentor@ds.study.iitm.ac.in",
            "name": "Sneha Patel",
            "bio": (
                "Lead Data Analyst experienced in business analytics, KPI modelling, and transitioning from college "
                "to corporate analytics roles."
            ),
            "org": "Retail Insights Global",
            "style": "Portfolio assessment, resume restructuring and mock technical interviews.",
            "channel": "Google Meet",
            "tags": ["Data and business analytics", "Choosing a career path", "Data structures and algorithms (DSA)"],
            "slots": [("Friday", "17:00", "18:00")],
        },
        {
            "email": "vikram.mentor@ds.study.iitm.ac.in",
            "name": "Vikram Iyer",
            "bio": (
                "Doctoral Researcher in Computational Neuroscience and Machine Learning at European Research Institute."
            ),
            "org": "NeuroTech Institute",
            "style": "Academic guidance, foreign university admissions and scholarship navigation.",
            "channel": "Google Meet",
            "tags": ["Master's or PhD abroad", "Computational neuroscience", "Technical interview preparation"],
            "slots": [("Saturday", "15:00", "16:30")],
        },
    ]

    mentor_records = []
    now = datetime.now(UTC)

    for spec in mentors_spec:
        user = get_or_create_user(spec["email"], (MENTOR,))
        mentor = Mentor.query.filter_by(user_id=user.id).first()
        if not mentor:
            mentor = Mentor(
                user_id=user.id,
                name=spec["name"],
                biography=spec["bio"],
                organisation=spec["org"],
                mentoring_style=spec["style"],
                preferred_channel=spec["channel"],
                time_zone="Asia/Kolkata",
                verification_status="active",
                verified_at=now - timedelta(days=20),
                verified_by_user_id=iic_user.id,
                capacity=2,
                available=True,
            )
            for t_name in spec["tags"]:
                if t_name in tags:
                    mentor.tags.append(tags[t_name])
            db.session.add(mentor)
            db.session.flush()

            for day, start_t, end_t in spec["slots"]:
                db.session.add(
                    Availability(
                        mentor_id=mentor.id,
                        day_of_week=day,
                        start_time=start_t,
                        end_time=end_t,
                        time_zone="Asia/Kolkata",
                    )
                )
        mentor_records.append(mentor)

    # 5. Students
    students_spec = [
        {
            "email": "rahul.student@ds.study.iitm.ac.in",
            "number": "21F1000001",
            "name": "Rahul Sundaram",
            "programme": "BS",
            "cohort": "May 2021",
            "cgpa": 8.75,
            "courses": "Math 1, Python, Linear Algebra, Machine Learning Practice, Deep Learning",
            "interest": "Computer Vision engineering and autonomous robotics",
        },
        {
            "email": "ananya.student@ds.study.iitm.ac.in",
            "number": "22F2000002",
            "name": "Ananya Sen",
            "programme": "BS",
            "cohort": "Jan 2022",
            "cgpa": 9.15,
            "courses": "Python, Machine Learning Foundations, Speech Technology, Deep Learning",
            "interest": "Speech Recognition and Natural Language Processing research",
        },
        {
            "email": "karthik.student@ds.study.iitm.ac.in",
            "number": "23F3000003",
            "name": "Karthik Nair",
            "programme": "BSc",
            "cohort": "Sep 2023",
            "cgpa": 7.90,
            "courses": "Mathematics for DS, Programming in Python, Database Management Systems",
            "interest": "Backend engineering and relational schema design",
        },
        {
            "email": "pooja.student@ds.study.iitm.ac.in",
            "number": "22F2000004",
            "name": "Pooja Gupta",
            "programme": "BS",
            "cohort": "Jan 2022",
            "cgpa": 8.40,
            "courses": "Business Data Management, Tools for DS, Machine Learning Techniques",
            "interest": "Data Analytics and business intelligence in e-commerce",
        },
    ]

    student_records = []
    for spec in students_spec:
        user = get_or_create_user(spec["email"], (STUDENT,))
        student = Student.query.filter_by(user_id=user.id).first()
        if not student:
            student = Student(
                user_id=user.id,
                student_number=spec["number"],
                name=spec["name"],
                programme=spec["programme"],
                cohort=spec["cohort"],
                cgpa=spec["cgpa"],
                completed_courses=spec["courses"],
                career_interest=spec["interest"],
            )
            db.session.add(student)
            db.session.flush()
        student_records.append(student)

    # 6. Problems
    problems_spec = [
        {
            "student": student_records[0],
            "title": "Choosing electives and practical project advice for Computer Vision",
            "desc": (
                "I am planning my term electives and want to decide between Deep Learning for Computer Vision "
                "and Advanced AI. I also need guidance on structuring a portfolio project."
            ),
            "status": "mentor_assigned",
            "tags": ["Choosing electives", "Computer vision", "Deep learning"],
            "desired_outcome": "Clarity on elective difficulty and an outline for an end-to-end vision project.",
        },
        {
            "student": student_records[1],
            "title": "Shortlisting research topics in Speech Technology for Master's applications",
            "desc": (
                "I want to apply for higher studies abroad in Speech AI and would like advice on reading papers "
                "and finding research internships."
            ),
            "status": "mentor_assigned",
            "tags": ["Speech technology", "Research careers", "Master's or PhD abroad"],
            "desired_outcome": "A reading list of key recent papers and strategy for professor outreach.",
        },
        {
            "student": student_records[2],
            "title": "DSA problem-solving strategy and SQL schema optimization",
            "desc": (
                "Struggling with medium DSA questions on trees and dynamic programming, plus writing efficient "
                "multi-table joins for course projects."
            ),
            "status": "submitted",
            "tags": ["Data structures and algorithms (DSA)", "SQL and database design"],
            "desired_outcome": "Weekly study plan and guidance on schema normalization.",
        },
    ]

    problem_records = []
    for spec in problems_spec:
        prob = Problem.query.filter_by(student_id=spec["student"].id, title=spec["title"]).first()
        if not prob:
            prob = Problem(
                student_id=spec["student"].id,
                title=spec["title"],
                description=spec["desc"],
                status=spec["status"],
                desired_outcome=spec["desired_outcome"],
                submitted_at=now - timedelta(days=12),
            )
            for t_name in spec["tags"]:
                if t_name in tags:
                    prob.tags.append(tags[t_name])
            db.session.add(prob)
            db.session.flush()
        problem_records.append(prob)

    # 7. Recommendations for Problem 3
    if problem_records[2].recommendations == []:
        # Rank Rohit (shares SQL), Sneha (shares DSA), Arun
        recs = [
            (mentor_records[2], 0.95, 1, 1),
            (mentor_records[3], 0.90, 2, 1),
            (mentor_records[0], 0.60, 3, 0),
        ]
        for mentor, score, rank, shared in recs:
            db.session.add(
                Recommendation(
                    problem_id=problem_records[2].id,
                    mentor_id=mentor.id,
                    score=score,
                    rank=rank,
                    shared_tags_count=shared,
                    generated_at=now - timedelta(days=2),
                )
            )

    # 8. Mentorships
    # Mentorship 1: Student 0 and Mentor 0
    m1 = Mentorship.query.filter_by(problem_id=problem_records[0].id, mentor_id=mentor_records[0].id).first()
    if not m1:
        m1 = Mentorship(
            problem_id=problem_records[0].id,
            mentor_id=mentor_records[0].id,
            status="active",
            goal="Finalize elective selections and build a benchmarked object detection project for resume.",
            next_steps=(
                "1. Review elective syllabus; 2. Implement baseline YOLO detection; 3. Document inference benchmarks."
            ),
            assigned_at=now - timedelta(days=10),
            answered_at=now - timedelta(days=9),
            reached_out_at=now - timedelta(days=9),
        )
        db.session.add(m1)
        db.session.flush()

        # Sessions for Mentorship 1
        s1 = Session(
            mentorship_id=m1.id,
            planned_at=now - timedelta(days=7),
            held_at=now - timedelta(days=7),
            status="held",
            duration_minutes=45,
            topic_category="Electives discussion",
            channel="Google Meet",
            logged_by_user_id=mentor_records[0].user_id,
            confirmed_by_user_id=student_records[0].user_id,
        )
        s2 = Session(
            mentorship_id=m1.id,
            planned_at=now + timedelta(days=3),
            status="planned",
            duration_minutes=60,
            topic_category="Project code review",
            channel="Google Meet",
            logged_by_user_id=student_records[0].user_id,
        )
        db.session.add_all([s1, s2])

        # Feedback for Mentorship 1
        f1 = Feedback(
            mentorship_id=m1.id,
            author_user_id=student_records[0].user_id,
            progress_status="some_progress",
            rating=5,
            comments="Very clear advice on the workload of the computer vision course.",
            checkpoint_number=1,
            submitted_at=now - timedelta(days=6),
        )
        f2 = Feedback(
            mentorship_id=m1.id,
            author_user_id=mentor_records[0].user_id,
            progress_status="some_progress",
            rating=5,
            comments="Student is well-prepared and asked sharp questions about prerequisites.",
            checkpoint_number=1,
            submitted_at=now - timedelta(days=6),
        )
        db.session.add_all([f1, f2])

    # Mentorship 2: Student 1 and Mentor 1
    m2 = Mentorship.query.filter_by(problem_id=problem_records[1].id, mentor_id=mentor_records[1].id).first()
    if not m2:
        m2 = Mentorship(
            problem_id=problem_records[1].id,
            mentor_id=mentor_records[1].id,
            status="active",
            goal="Formulate research problem statement for speech feature extraction.",
            next_steps="Read Wav2Vec2 and Whisper papers and outline experimental comparison.",
            assigned_at=now - timedelta(days=8),
            answered_at=now - timedelta(days=7),
            reached_out_at=now - timedelta(days=7),
        )
        db.session.add(m2)
        db.session.flush()

        s3 = Session(
            mentorship_id=m2.id,
            planned_at=now - timedelta(days=5),
            held_at=now - timedelta(days=5),
            status="held",
            duration_minutes=50,
            topic_category="Research roadmap",
            channel="Google Meet",
            logged_by_user_id=mentor_records[1].user_id,
            confirmed_by_user_id=student_records[1].user_id,
        )
        db.session.add(s3)

    # 9. Audit Logs
    if AuditLog.query.count() == 0:
        db.session.add_all(
            [
                AuditLog(
                    actor_user_id=iic_user.id,
                    action="verify_mentor",
                    entity_type="mentor",
                    entity_id=mentor_records[0].id,
                    details="Verified Arun Kumar after credential review.",
                    created_at=now - timedelta(days=20),
                ),
                AuditLog(
                    actor_user_id=iic_user.id,
                    action="assign_mentor",
                    entity_type="mentorship",
                    entity_id=m1.id,
                    details="Assigned mentor Arun Kumar to problem #1.",
                    created_at=now - timedelta(days=10),
                ),
                AuditLog(
                    actor_user_id=mentor_records[0].user_id,
                    action="accept_assignment",
                    entity_type="mentorship",
                    entity_id=m1.id,
                    details="Mentor accepted assignment.",
                    created_at=now - timedelta(days=9),
                ),
            ]
        )

    # 10. Email templates, copied from app/notifications/templates.py
    ensure_templates()

    db.session.commit()

    return {
        "users": User.query.count(),
        "mentors": Mentor.query.count(),
        "students": Student.query.count(),
        "topic_tags": TopicTag.query.count(),
        "timing_windows": TimingWindow.query.count(),
        "problems": Problem.query.count(),
        "mentorships": Mentorship.query.count(),
        "sessions": Session.query.count(),
        "feedbacks": Feedback.query.count(),
    }


@click.command("seed-data")
@with_appcontext
def seed_data_command():
    """Populate realistic dummy seed data for testing and demonstration."""
    counts = seed_database()
    click.echo("Seeded realistic dataset successfully:")
    for k, v in counts.items():
        click.echo(f"  - {k}: {v}")
