"""C3 tables: MENTOR, AVAILABILITY, and MENTOR_TAG."""

from ..extensions import db
from ..models import utcnow

# A mentor's status (US-14). IIC adds a mentor as pending, verifies them (an activation link is
# emailed), and the mentor activates their account. Only active mentors can be recommended or assigned.
PENDING, VERIFIED, ACTIVE, REMOVED = "pending_verification", "verified", "active", "removed"
MENTOR_STATUSES = (PENDING, VERIFIED, ACTIVE, REMOVED)

mentor_tag = db.Table(
    "mentor_tag",
    db.Column("mentor_id", db.Integer, db.ForeignKey("mentor.id", ondelete="CASCADE"), primary_key=True),
    db.Column("topic_tag_id", db.Integer, db.ForeignKey("topic_tag.id", ondelete="CASCADE"), primary_key=True),
)


class Mentor(db.Model):
    """A volunteer mentor profile linked 1:1 to a User account."""

    __tablename__ = "mentor"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = db.Column(db.String(128), nullable=False)
    headline = db.Column(db.String(200))  # e.g. "Data scientist at Flipkart", shown in IIC's mentor pool
    experience = db.Column(db.JSON)  # entries from IIC's import, e.g. ["Internship at TCS (3 months)"]
    biography = db.Column(db.Text)
    organisation = db.Column(db.String(128))
    mentoring_style = db.Column(db.Text)
    preferred_channel = db.Column(db.String(64), default="Google Meet")
    time_zone = db.Column(db.String(64), default="Asia/Kolkata")
    contact = db.Column(db.String(254))  # email or phone for students to reach the mentor
    verification_status = db.Column(db.String(32), nullable=False, default=PENDING)  # one of MENTOR_STATUSES
    verified_at = db.Column(db.DateTime(timezone=True))
    verified_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    capacity = db.Column(db.Integer, nullable=False, default=1)
    available = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    user = db.relationship("User", foreign_keys=[user_id], backref=db.backref("mentor_profile", uselist=False))
    verified_by = db.relationship("User", foreign_keys=[verified_by_user_id])
    tags = db.relationship("TopicTag", secondary=mentor_tag, lazy="selectin")
    availabilities = db.relationship("Availability", backref="mentor", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Mentor {self.id} {self.name}>"


class Availability(db.Model):
    """A mentor's offered time slot."""

    __tablename__ = "availability"

    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey("mentor.id", ondelete="CASCADE"), nullable=False)
    day_of_week = db.Column(db.String(16), nullable=False)  # Monday..Sunday
    start_time = db.Column(db.String(8), nullable=False)  # HH:MM
    end_time = db.Column(db.String(8), nullable=False)  # HH:MM
    time_zone = db.Column(db.String(64), default="Asia/Kolkata")

    def __repr__(self) -> str:
        return f"<Availability mentor_id={self.mentor_id} {self.day_of_week} {self.start_time}-{self.end_time}>"


class CapacityRequest(db.Model):
    """IIC's request for a mentor to take on more mentees (US-18)."""

    __tablename__ = "capacity_request"

    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey("mentor.id", ondelete="CASCADE"), nullable=False)
    by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)  # IIC coordinator who asked
    # pending, accepted, declined
    status = db.Column(db.String(32), nullable=False, default="pending")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    responded_at = db.Column(db.DateTime(timezone=True))

    mentor = db.relationship("Mentor", foreign_keys=[mentor_id], backref=db.backref("capacity_requests"))
    by_user = db.relationship("User", foreign_keys=[by_user_id])

    def __repr__(self) -> str:
        return f"<CapacityRequest {self.id} mentor_id={self.mentor_id} status={self.status}>"
