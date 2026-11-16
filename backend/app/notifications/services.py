"""C13 business rules: dashboard notices and the emails that go with them (SCRUM-72).

Other modules tell a person about an event with notify(), inside the same change, before they
commit:

    from app.notifications import services as notifications

    notifications.notify(mentor.user, "assignment_notice", link="/mentor", mentor_name=mentor.name)
    db.session.commit()

notify() adds a dashboard notice to the current transaction. Its email is sent only after that
transaction commits, so a change that fails or is rolled back never emails anyone. If the mail
server refuses an email, the notice is marked failed and the change still stands.

With MAIL_SUPPRESS_SEND (the default in development) emails are written to the log instead of
being sent, and in tests they can be checked with mail.record_messages().
"""

import string
from typing import NamedTuple

from flask import current_app
from flask_mail import Message
from sqlalchemy import event, update
from sqlalchemy.orm import Session

from ..auth.models import User
from ..extensions import db, mail
from ..models import utcnow
from .models import FAILED, QUEUED, SENT, EmailTemplate, Notification
from .templates import TEMPLATES

OUTBOX = "notifications.outbox"  # key in session.info for emails waiting for the commit


class Email(NamedTuple):
    notification_id: int
    to: str
    subject: str
    body: str


def render(text: str, context: dict) -> str:
    """Fill a template's {name} placeholders. Missing values and anything but plain names are errors."""
    for _literal, field, _spec, _conversion in string.Formatter().parse(text):
        if field is None:
            continue
        if not field.isidentifier():
            raise ValueError(f"Template placeholder {{{field}}} must be a plain name.")
        if field not in context:
            raise ValueError(f"The template needs a value for {field!r}.")
    return text.format_map(context)


def get_template(key: str) -> EmailTemplate:
    """The EMAIL_TEMPLATE row for a template in TEMPLATES, created or updated to match it."""
    source = TEMPLATES.get(key)
    if source is None:
        raise ValueError(f"No notification template {key!r}. Add it to app/notifications/templates.py.")
    template = db.session.query(EmailTemplate).filter_by(template_key=key).one_or_none()
    if template is None:
        template = EmailTemplate(template_key=key, subject=source.subject, body=source.body)
        db.session.add(template)
    elif (template.subject, template.body) != (source.subject, source.body):
        template.subject, template.body = source.subject, source.body
    return template


def ensure_templates() -> None:
    """Bring the EMAIL_TEMPLATE table in step with TEMPLATES. Used by flask seed-data."""
    for key in TEMPLATES:
        get_template(key)
    db.session.flush()


def notify(recipient: User, template_key: str, *, link: str | None = None, **context) -> Notification:
    """Give a user a dashboard notice and, once the current transaction commits, an email.

    link is the page in the web app the notice opens, such as "/student". The keyword arguments
    fill the template's placeholders.
    """
    if link is not None and not link.startswith("/"):
        raise ValueError("link must be a path in the web app, such as '/student'.")
    template = get_template(template_key)
    # A line break in a subject would be an email header injection, so subjects stay on one line.
    subject = " ".join(render(template.subject, context).split())
    body = render(template.body, context)

    notice = Notification(
        recipient_user_id=recipient.id,
        template=template,
        subject=subject,
        body=body,
        link=link,
        status=QUEUED,
        read=False,
    )
    db.session.add(notice)
    db.session.flush()  # gives the notice its ID, to mark the email sent or failed later

    if link is not None:
        body = f"{body}\n\nOpen it on the platform: {current_app.config['FRONTEND_URL'].rstrip('/')}{link}"
    db.session.info.setdefault(OUTBOX, []).append(Email(notice.id, recipient.email, subject, body))
    return notice


def notices_for(user: User, *, unread: bool = False):
    """A query for a user's notices, newest first."""
    query = db.session.query(Notification).filter(Notification.recipient_user_id == user.id)
    if unread:
        query = query.filter(Notification.read.is_(False))
    return query.order_by(Notification.created_at.desc(), Notification.id.desc())


def get_own_notice(user: User, notification_id: int) -> Notification | None:
    """The notice, if it belongs to this user. Others' notices are treated as missing."""
    notice = db.session.get(Notification, notification_id)
    if notice is None or notice.recipient_user_id != user.id:
        return None
    return notice


def mark_read(notice: Notification) -> Notification:
    notice.read = True
    db.session.commit()
    return notice


def mark_all_read(user: User) -> int:
    """Mark every unread notice of the user as read. Returns how many changed."""
    count = (
        db.session.query(Notification)
        .filter(Notification.recipient_user_id == user.id, Notification.read.is_(False))
        .update({Notification.read: True}, synchronize_session="fetch")
    )
    db.session.commit()
    return count


# Delivery. The emails wait in session.info until the transaction that created them commits.


@event.listens_for(Session, "after_commit")
def _send_after_commit(session):
    emails = session.info.pop(OUTBOX, None)
    if not emails:
        return
    try:
        _deliver(emails)
    except Exception:  # the change is already committed; a delivery problem must not turn it into an error
        current_app.logger.exception(
            "Could not record the delivery of notifications %s", [e.notification_id for e in emails]
        )


@event.listens_for(Session, "after_transaction_end")
def _drop_unsent(session, transaction):
    # After a commit the outbox is already empty. After a rollback or close, its notices were never
    # saved, so their emails must not go out.
    if transaction.parent is None:
        session.info.pop(OUTBOX, None)


def _deliver(emails: list[Email]) -> None:
    log = current_app.logger
    suppressed = current_app.config.get("MAIL_SUPPRESS_SEND", True)
    outcomes = []
    for email in emails:
        try:
            mail.send(Message(subject=email.subject, recipients=[email.to], body=email.body))
        except Exception:
            log.exception("Could not email notification %s", email.notification_id)
            outcomes.append((email.notification_id, FAILED, None))
            continue
        if suppressed:
            log.info("Email not sent (MAIL_SUPPRESS_SEND) to %s: %s\n%s", email.to, email.subject, email.body)
        outcomes.append((email.notification_id, SENT, utcnow()))

    # The session cannot run SQL while it finishes its commit, so record the outcome on its own connection.
    with db.engine.begin() as connection:
        for notification_id, status, sent_at in outcomes:
            connection.execute(
                update(Notification.__table__)
                .where(Notification.__table__.c.id == notification_id)
                .values(status=status, sent_at=sent_at)
            )
