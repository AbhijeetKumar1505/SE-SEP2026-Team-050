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
    # Email only (send_email): the student cannot log in to see a notice until they use the link.
    "email_verification": Template(
        subject="Confirm your email for IITM BS Mentoring",
        body=(
            "Hello {name}, confirm your email address to finish signing up for IITM BS Mentoring. "
            "The link works for {hours} hours. If you did not sign up, you can ignore this email."
        ),
    ),
    # Email only (send_email): the mentor has no password until they use the link (US-14).
    "mentor_activation": Template(
        subject="Activate your IITM BS Mentoring account",
        body=(
            "Hello {name}, {verified_by} from IIC has verified your mentor profile. Open the link below to "
            "set a password and activate your account, then set your availability so IIC can match you with "
            "students. The link works for {days} days."
        ),
    ),
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
