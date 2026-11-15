"""C4 tables (Milestone 2 ER diagram). Only EMAIL_DOMAIN so far: USER refers to it.

TOPIC_TAG and TIMING_WINDOW are added with the stories that use them (SCRUM-70).
"""

from ..extensions import db


class EmailDomain(db.Model):
    """An email domain allowed to register, such as ds.study.iitm.ac.in (US-01)."""

    __tablename__ = "email_domain"

    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(253), nullable=False, unique=True)
    enabled = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self) -> str:
        return f"<EmailDomain {self.domain}>"
