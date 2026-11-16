"""C14 tables: AUDIT_LOG."""

from sqlalchemy import event

from ..extensions import db
from ..models import utcnow


class AuditLogIsAppendOnly(RuntimeError):
    """Raised when code tries to change or delete an audit entry."""


class AuditLog(db.Model):
    """Permanent append-only record of important actions and decisions.

    Add entries with app.audit.services.record(). Entries are never edited or deleted: the ORM refuses
    both (see the listeners below). A bulk query.update() or query.delete() would bypass that check, so
    never run one on this table.
    """

    __tablename__ = "audit_log"
    # A record's history (C14 "View a record's history") is looked up by entity type and ID.
    __table_args__ = (db.Index("ix_audit_log_entity", "entity_type", "entity_id"),)

    id = db.Column(db.Integer, primary_key=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)  # empty for automated actions
    action = db.Column(db.String(64), nullable=False)
    entity_type = db.Column(db.String(64), nullable=False)
    entity_id = db.Column(db.Integer)
    details = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)

    actor = db.relationship("User")

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity_type}:{self.entity_id}>"


@event.listens_for(AuditLog, "before_update")
def _refuse_update(_mapper, _connection, entry):
    raise AuditLogIsAppendOnly(f"Audit entry {entry.id} cannot be changed; record a new entry instead.")


@event.listens_for(AuditLog, "before_delete")
def _refuse_delete(_mapper, _connection, entry):
    raise AuditLogIsAppendOnly(f"Audit entry {entry.id} cannot be deleted.")
