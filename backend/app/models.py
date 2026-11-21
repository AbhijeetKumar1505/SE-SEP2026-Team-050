"""Helpers shared by every module's models."""

from datetime import UTC, datetime


def utcnow() -> datetime:
    """The current time in UTC. Every timestamp column stores UTC."""
    return datetime.now(UTC)


def as_utc(moment: datetime) -> datetime:
    """A stored timestamp as an aware UTC datetime. SQLite returns them without their time zone."""
    return moment if moment.tzinfo is not None else moment.replace(tzinfo=UTC)
