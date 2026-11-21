"""roster entries for sign-up; programme empty until the profile is complete (SCRUM-94)

- roster_entry: IIC's roster of registered students (C2). Sign-up checks the roll number and
  email against it (US-01), and IIC's roster import fills it (US-15).
- student.programme may be empty: a student signs up first and chooses BSc or BS when they
  complete their profile (US-02).
- The institute domain from US-01, ds.study.iitm.ac.in, is approved if no domain row exists for
  it yet, so a new database accepts sign-ups without running flask seed-data.

Revision ID: d63fea69d425
Revises: 724ae9bc361f
Create Date: 2026-11-21 11:26:44.776087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd63fea69d425'
down_revision = '724ae9bc361f'
branch_labels = None
depends_on = None

INSTITUTE_DOMAIN = "ds.study.iitm.ac.in"


def upgrade():
    op.create_table('roster_entry',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('student_number', sa.String(length=32), nullable=False),
    sa.Column('name', sa.String(length=128), nullable=False),
    sa.Column('email', sa.String(length=254), nullable=False),
    sa.Column('removed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_roster_entry')),
    sa.UniqueConstraint('email', name=op.f('uq_roster_entry_email')),
    sa.UniqueConstraint('student_number', name=op.f('uq_roster_entry_student_number'))
    )
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.alter_column('programme',
               existing_type=sa.VARCHAR(length=16),
               nullable=True)

    connection = op.get_bind()
    known = connection.execute(
        sa.text("SELECT 1 FROM email_domain WHERE domain = :domain"), {"domain": INSTITUTE_DOMAIN}
    ).first()
    if known is None:
        connection.execute(
            sa.text("INSERT INTO email_domain (domain, enabled) VALUES (:domain, :enabled)"),
            {"domain": INSTITUTE_DOMAIN, "enabled": True},
        )


def downgrade():
    # The approved domain is kept: IIC may have relied on it, and the older schema has the table too.
    # Students who never completed their profile get an empty programme, which the older schema allows.
    op.execute(sa.text("UPDATE student SET programme = '' WHERE programme IS NULL"))
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.alter_column('programme',
               existing_type=sa.VARCHAR(length=16),
               nullable=False)

    op.drop_table('roster_entry')
