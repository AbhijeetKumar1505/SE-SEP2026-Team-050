"""Helpers shared by every module's models."""

from datetime import UTC, datetime


def utcnow() -> datetime:
    """The current time in UTC. Every timestamp column stores UTC."""
    return datetime.now(UTC)
