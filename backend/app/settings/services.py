"""C4 business rules for topic tags (US-03, US-21)."""

from flask_smorest import abort
from sqlalchemy import func

from ..audit import services as audit
from ..auth.models import User
from ..extensions import db
from ..problems.models import problem_tag
from .models import TimingWindow, TopicTag


def timing_hours(rule_name: str, default: int) -> int:
    """The hours of an enabled timing window, or the given default when the rule is absent."""
    window = db.session.query(TimingWindow).filter_by(rule_name=rule_name).one_or_none()
    return window.hours if window is not None and window.enabled else default


def _usage_counts() -> dict[int, int]:
    rows = (
        db.session.query(problem_tag.c.topic_tag_id, func.count(problem_tag.c.problem_id))
        .group_by(problem_tag.c.topic_tag_id)
        .all()
    )
    return dict(rows)


def serialize_tag(tag: TopicTag, counts: dict[int, int] | None = None) -> dict:
    counts = _usage_counts() if counts is None else counts
    return {
        "id": tag.id,
        "name": tag.name,
        "group": tag.category,
        "problems": counts.get(tag.id, 0),
        "active": not tag.retired,
    }


def list_tags() -> list[dict]:
    """Every tag, retired ones included, grouped by the order IIC sees them."""
    counts = _usage_counts()
    tags = db.session.query(TopicTag).order_by(TopicTag.category, TopicTag.name).all()
    return [serialize_tag(tag, counts) for tag in tags]


def add_tag(name: str, group: str, *, actor: User) -> dict:
    """Add a tag to IIC's list. Names are unique, ignoring case."""
    name = " ".join(name.split())
    if db.session.query(TopicTag.id).filter(func.lower(TopicTag.name) == name.lower()).first():
        abort(409, message=f"The topic tag {name!r} already exists.")
    tag = TopicTag(name=name, category=group.strip(), retired=False)
    db.session.add(tag)
    db.session.flush()
    audit.record("add_topic_tag", "topic_tag", tag.id, actor=actor, details=f"Added tag {name}.")
    db.session.commit()
    return serialize_tag(tag)


def set_tag_active(tag_id: int, active: bool, *, actor: User) -> dict:
    """Retire or restore a tag. Tags are never deleted, so past problems keep their topics."""
    tag = db.session.get(TopicTag, tag_id)
    if tag is None:
        abort(404, message=f"No topic tag with ID {tag_id}.")
    if tag.retired != (not active):
        tag.retired = not active
        audit.record(
            "restore_topic_tag" if active else "retire_topic_tag",
            "topic_tag",
            tag.id,
            actor=actor,
            details=f"{'Restored' if active else 'Retired'} tag {tag.name}.",
        )
        db.session.commit()
    return serialize_tag(tag)
