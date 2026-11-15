"""database models M2: 22 tables (SCRUM-70)

Revision ID: a1b2c3d4e5f6
Revises: e0a7711126b9
Create Date: 2026-11-15 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, UTC


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'e0a7711126b9'
branch_labels = None
depends_on = None


def upgrade():
    # 1. email_verification
    op.create_table(
        'email_verification',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_email_verification_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_email_verification')),
        sa.UniqueConstraint('token_hash', name=op.f('uq_email_verification_token_hash'))
    )

    # 2. topic_tag
    op.create_table(
        'topic_tag',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=64), nullable=True),
        sa.Column('retired', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_topic_tag')),
        sa.UniqueConstraint('name', name=op.f('uq_topic_tag_name'))
    )

    # 3. timing_window
    op.create_table(
        'timing_window',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rule_name', sa.String(length=64), nullable=False),
        sa.Column('hours', sa.Integer(), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_timing_window')),
        sa.UniqueConstraint('rule_name', name=op.f('uq_timing_window_rule_name'))
    )

    # 4. student
    op.create_table(
        'student',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('student_number', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('programme', sa.String(length=16), nullable=False),
        sa.Column('cohort', sa.String(length=32), nullable=True),
        sa.Column('cgpa', sa.Float(), nullable=True),
        sa.Column('completed_courses', sa.Text(), nullable=True),
        sa.Column('career_interest', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_student_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_student')),
        sa.UniqueConstraint('student_number', name=op.f('uq_student_student_number')),
        sa.UniqueConstraint('user_id', name=op.f('uq_student_user_id'))
    )

    # 5. mentor
    op.create_table(
        'mentor',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('biography', sa.Text(), nullable=True),
        sa.Column('organisation', sa.String(length=128), nullable=True),
        sa.Column('mentoring_style', sa.Text(), nullable=True),
        sa.Column('preferred_channel', sa.String(length=64), nullable=True),
        sa.Column('time_zone', sa.String(length=64), nullable=True),
        sa.Column('verification_status', sa.String(length=32), nullable=False),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by_user_id', sa.Integer(), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('available', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_mentor_user_id_user'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['verified_by_user_id'], ['user.id'], name=op.f('fk_mentor_verified_by_user_id_user')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_mentor')),
        sa.UniqueConstraint('user_id', name=op.f('uq_mentor_user_id'))
    )

    # 6. mentor_tag
    op.create_table(
        'mentor_tag',
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('topic_tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['mentor_id'], ['mentor.id'], name=op.f('fk_mentor_tag_mentor_id_mentor'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['topic_tag_id'], ['topic_tag.id'], name=op.f('fk_mentor_tag_topic_tag_id_topic_tag'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('mentor_id', 'topic_tag_id', name=op.f('pk_mentor_tag'))
    )

    # 7. availability
    op.create_table(
        'availability',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.String(length=16), nullable=False),
        sa.Column('start_time', sa.String(length=8), nullable=False),
        sa.Column('end_time', sa.String(length=8), nullable=False),
        sa.Column('time_zone', sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(['mentor_id'], ['mentor.id'], name=op.f('fk_availability_mentor_id_mentor'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_availability'))
    )

    # 8. problem
    op.create_table(
        'problem',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('close_reason', sa.Text(), nullable=True),
        sa.Column('desired_outcome', sa.Text(), nullable=True),
        sa.Column('guidance_preferences', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['student.id'], name=op.f('fk_problem_student_id_student'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_problem'))
    )

    # 9. problem_tag
    op.create_table(
        'problem_tag',
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('topic_tag_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['problem_id'], ['problem.id'], name=op.f('fk_problem_tag_problem_id_problem'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['topic_tag_id'], ['topic_tag.id'], name=op.f('fk_problem_tag_topic_tag_id_topic_tag'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('problem_id', 'topic_tag_id', name=op.f('pk_problem_tag'))
    )

    # 10. recommendation
    op.create_table(
        'recommendation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('rank', sa.Integer(), nullable=True),
        sa.Column('shared_tags_count', sa.Integer(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['mentor_id'], ['mentor.id'], name=op.f('fk_recommendation_mentor_id_mentor'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['problem.id'], name=op.f('fk_recommendation_problem_id_problem'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_recommendation'))
    )

    # 11. mentorship
    op.create_table(
        'mentorship',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('mentor_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('goal', sa.Text(), nullable=True),
        sa.Column('next_steps', sa.Text(), nullable=True),
        sa.Column('assigned_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('answered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_reason', sa.Text(), nullable=True),
        sa.Column('reached_out_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['mentor_id'], ['mentor.id'], name=op.f('fk_mentorship_mentor_id_mentor'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['problem.id'], name=op.f('fk_mentorship_problem_id_problem'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_mentorship'))
    )

    # 12. session
    op.create_table(
        'session',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentorship_id', sa.Integer(), nullable=False),
        sa.Column('planned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('held_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('topic_category', sa.String(length=100), nullable=True),
        sa.Column('channel', sa.String(length=64), nullable=True),
        sa.Column('meeting_link', sa.String(length=255), nullable=True),
        sa.Column('logged_by_user_id', sa.Integer(), nullable=True),
        sa.Column('confirmed_by_user_id', sa.Integer(), nullable=True),
        sa.Column('private_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['confirmed_by_user_id'], ['user.id'], name=op.f('fk_session_confirmed_by_user_id_user')),
        sa.ForeignKeyConstraint(['logged_by_user_id'], ['user.id'], name=op.f('fk_session_logged_by_user_id_user')),
        sa.ForeignKeyConstraint(['mentorship_id'], ['mentorship.id'], name=op.f('fk_session_mentorship_id_mentorship'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_session'))
    )

    # 13. feedback
    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentorship_id', sa.Integer(), nullable=False),
        sa.Column('author_user_id', sa.Integer(), nullable=False),
        sa.Column('progress_status', sa.String(length=32), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('checkpoint_number', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['author_user_id'], ['user.id'], name=op.f('fk_feedback_author_user_id_user'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mentorship_id'], ['mentorship.id'], name=op.f('fk_feedback_mentorship_id_mentorship'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_feedback'))
    )

    # 14. case_record
    op.create_table(
        'case_record',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentorship_id', sa.Integer(), nullable=False),
        sa.Column('reporter_user_id', sa.Integer(), nullable=False),
        sa.Column('case_type', sa.String(length=32), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('other_party_response', sa.Text(), nullable=True),
        sa.Column('decision', sa.String(length=64), nullable=True),
        sa.Column('decision_reason', sa.Text(), nullable=True),
        sa.Column('decided_by_user_id', sa.Integer(), nullable=True),
        sa.Column('opened_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['decided_by_user_id'], ['user.id'], name=op.f('fk_case_record_decided_by_user_id_user')),
        sa.ForeignKeyConstraint(['mentorship_id'], ['mentorship.id'], name=op.f('fk_case_record_mentorship_id_mentorship'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reporter_user_id'], ['user.id'], name=op.f('fk_case_record_reporter_user_id_user')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_record'))
    )

    # 15. monitoring_flag
    op.create_table(
        'monitoring_flag',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mentorship_id', sa.Integer(), nullable=False),
        sa.Column('timing_window_id', sa.Integer(), nullable=True),
        sa.Column('flag_type', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('raised_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['mentorship_id'], ['mentorship.id'], name=op.f('fk_monitoring_flag_mentorship_id_mentorship'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['timing_window_id'], ['timing_window.id'], name=op.f('fk_monitoring_flag_timing_window_id_timing_window')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_monitoring_flag'))
    )

    # 16. email_template
    op.create_table(
        'email_template',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('template_key', sa.String(length=64), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_email_template')),
        sa.UniqueConstraint('template_key', name=op.f('uq_email_template_template_key'))
    )

    # 17. notification
    op.create_table(
        'notification',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipient_user_id', sa.Integer(), nullable=False),
        sa.Column('email_template_id', sa.Integer(), nullable=True),
        sa.Column('subject', sa.String(length=255), nullable=True),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('link', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['email_template_id'], ['email_template.id'], name=op.f('fk_notification_email_template_id_email_template')),
        sa.ForeignKeyConstraint(['recipient_user_id'], ['user.id'], name=op.f('fk_notification_recipient_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_notification'))
    )

    # 18. audit_log
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=64), nullable=False),
        sa.Column('entity_type', sa.String(length=64), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['actor_user_id'], ['user.id'], name=op.f('fk_audit_log_actor_user_id_user')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_audit_log'))
    )

    # Seed the 30 Topic Tags (docs/topic-tags/01-topic-tags.md)
    now = datetime.now(UTC)
    topic_tag_table = sa.table(
        "topic_tag",
        sa.column("name", sa.String),
        sa.column("category", sa.String),
        sa.column("retired", sa.Boolean),
        sa.column("created_at", sa.DateTime(timezone=True)),
    )
    tags_data = [
        ("Choosing a career path", "Career direction"),
        ("Industry and role requirements", "Career direction"),
        ("Finding internships", "Jobs and internships"),
        ("Job search strategy", "Jobs and internships"),
        ("Technical interview preparation", "Jobs and internships"),
        ("Resume and portfolio", "Jobs and internships"),
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
        ("Master's or PhD abroad", "Higher studies and research"),
        ("Research careers", "Higher studies and research"),
        ("GATE and higher studies in India", "Higher studies and research"),
        ("Computational neuroscience", "Higher studies and research"),
        ("Choosing electives", "Courses and academics"),
        ("Planning a term's course load", "Courses and academics"),
        ("Getting through a difficult course", "Courses and academics"),
        ("Improving CGPA", "Courses and academics"),
        ("Stuck on a course project", "Projects"),
        ("Niche or research project", "Projects"),
        ("Starting a startup", "Entrepreneurship"),
        ("Joining or growing a family business", "Entrepreneurship"),
        ("Other", "Catch-all"),
    ]
    op.bulk_insert(topic_tag_table, [{"name": name, "category": cat, "retired": False, "created_at": now} for name, cat in tags_data])

    # Seed the timing windows
    timing_window_table = sa.table(
        "timing_window",
        sa.column("rule_name", sa.String),
        sa.column("hours", sa.Integer),
        sa.column("enabled", sa.Boolean),
        sa.column("description", sa.String),
    )
    windows_data = [
        ("assignment_reminder", 48, True, "Reminder to mentor 48 hours after assignment"),
        ("assignment_response", 72, True, "Window for mentor to accept or decline before expiry"),
        ("first_session_reminder", 168, True, "Reminder to both participants after 7 days without a held session"),
        ("first_session_overdue", 240, True, "Flag first session overdue after 10 days without a session"),
        ("session_inactive", 336, True, "Flag mentorship inactive after 14 days without a held session"),
        ("reassignment_needed", 504, True, "Reassignment needed flag 7 days after inactive flag"),
        ("feedback_checkpoint", 336, True, "Feedback checkpoint interval every 14 days / 2 weeks"),
        ("feedback_overdue", 168, True, "Flag feedback overdue 7 days after checkpoint falls due"),
    ]
    op.bulk_insert(timing_window_table, [{"rule_name": r, "hours": h, "enabled": en, "description": d} for r, h, en, d in windows_data])


def downgrade():
    op.drop_table('audit_log')
    op.drop_table('notification')
    op.drop_table('email_template')
    op.drop_table('monitoring_flag')
    op.drop_table('case_record')
    op.drop_table('feedback')
    op.drop_table('session')
    op.drop_table('mentorship')
    op.drop_table('recommendation')
    op.drop_table('problem_tag')
    op.drop_table('problem')
    op.drop_table('availability')
    op.drop_table('mentor_tag')
    op.drop_table('mentor')
    op.drop_table('student')
    op.drop_table('timing_window')
    op.drop_table('topic_tag')
    op.drop_table('email_verification')
