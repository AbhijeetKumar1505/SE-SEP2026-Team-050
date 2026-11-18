"""C8 business rules for change and termination cases (US-07). IIC decides."""

from flask_smorest import abort

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..mentorships.access import participant_side
from ..mentorships.models import Mentorship
from .models import CaseRecord


def open_case(mentorship_id: int, values: dict, *, user: User) -> CaseRecord:
    mentorship = db.session.get(Mentorship, mentorship_id)
    if mentorship is None:
        abort(404, message=f"No mentorship with ID {mentorship_id}.")
    participant_side(mentorship, user)
    already_open = (
        db.session.query(CaseRecord.id)
        .filter(CaseRecord.mentorship_id == mentorship.id, CaseRecord.status == "under_review")
        .first()
    )
    if already_open:
        abort(409, message="A case about this mentorship is already with IIC.")
    case = CaseRecord(
        mentorship_id=mentorship.id,
        reporter_user_id=user.id,
        case_type=values["case_type"],
        status="under_review",
        details=values["details"].strip(),
    )
    db.session.add(case)
    db.session.flush()
    audit.record("open_case", "case", case.id, actor=user, details=f"Opened a {values['case_type']} case.")
    db.session.commit()
    return case


def serialize_case(case: CaseRecord) -> dict:
    return {
        "id": case.id,
        "mentorship_id": case.mentorship_id,
        "case_type": case.case_type,
        "status": case.status,
        "details": case.details,
        "decision": case.decision,
        "decision_reason": case.decision_reason,
        "opened_at": case.opened_at,
        "resolved_at": case.resolved_at,
    }
