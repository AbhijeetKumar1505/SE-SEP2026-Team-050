"""The text of every notification, one template per event (Milestone 2 design, C13).

Each template has a subject and a body. {name} placeholders are filled from the keyword
arguments given to notify(); a missing one is an error, so a notice never goes out half-filled.
Use plain names only, without dots or brackets.

This file is the source of the text. The EMAIL_TEMPLATE table holds a copy, kept in step by
notify() and by `flask seed-data`, so each notification row can point at its template.

Add a template here with the story that sends it. Never put conversation content in a notice.
"""

from typing import NamedTuple


class Template(NamedTuple):
    subject: str
    body: str


TEMPLATES: dict[str, Template] = {
    "assignment_notice": Template(
        subject="New student problem assigned to you",
        body="Hello {mentor_name}, a student has been assigned to you. Please review and respond within 72 hours.",
    ),
    "acceptance_notice": Template(
        subject="Your mentor has accepted your request",
        body="Hello {student_name}, {mentor_name} has accepted your request. Here are their preferred contact details.",
    ),
    "session_reminder": Template(
        subject="Upcoming mentoring session in 24 hours",
        body="Reminder: You have a scheduled mentoring session tomorrow.",
    ),
}
