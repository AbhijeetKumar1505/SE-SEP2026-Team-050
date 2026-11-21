"""SCRUM-94 (US-01): sign up with an institute email, checked against IIC's roster, then verify it."""

import re
from datetime import UTC, datetime, timedelta

import pytest

from app.auth import services as auth
from app.auth.models import EmailVerification, User
from app.extensions import db, mail
from app.settings.models import EmailDomain
from app.students.models import RosterEntry, Student

SIGNUP = "/api/auth/signup"
VERIFY = "/api/auth/verify-email"
RESEND = "/api/auth/resend-verification"
LOGIN = "/api/auth/login"
ROLL, NAME, EMAIL = "23F1002345", "Sneha Pillai", "23f1002345@ds.study.iitm.ac.in"
PASSWORD = "a-strong-password"


@pytest.fixture
def on_roster(app):
    """Sneha is on IIC's roster and has not signed up yet."""
    entry = RosterEntry(student_number=ROLL, name=NAME, email=EMAIL)
    db.session.add(entry)
    db.session.commit()
    return entry


def sign_up(client, **changes):
    return client.post(SIGNUP, json={"email": EMAIL, "roll_number": ROLL, "password": PASSWORD, **changes})


def sign_up_and_get_token(client, **changes):
    """Sign up and return the token from the link in the email."""
    with mail.record_messages() as outbox:
        response = sign_up(client, **changes)
    assert response.status_code == 201, response.get_json()
    assert len(outbox) == 1
    return re.search(r"/verify-email/(\S+)", outbox[0].body).group(1)


def nothing_stored():
    return db.session.query(User).count() == 0 and db.session.query(Student).count() == 0


# Signing up


def test_signing_up_creates_an_unverified_account_and_emails_a_link(client, on_roster):
    with mail.record_messages() as outbox:
        response = sign_up(client)

    assert response.status_code == 201
    assert response.get_json() == {"email": EMAIL, "link_valid_hours": 24}

    assert len(outbox) == 1
    email = outbox[0]
    assert email.recipients == [EMAIL]
    assert email.subject == "Confirm your email for IITM BS Mentoring"
    assert email.body.startswith(f"Hello {NAME}, confirm your email address")
    token = re.search(r"Open this link: http://localhost:5173/verify-email/(\S+)$", email.body).group(1)

    user = db.session.query(User).filter_by(email=EMAIL).one()
    assert user.email_verified_at is None
    assert user.role_names == ["student"]
    assert user.email_domain.domain == "ds.study.iitm.ac.in"
    student = user.student_profile
    assert (student.name, student.student_number, student.programme) == (NAME, ROLL, None)

    link = db.session.query(EmailVerification).filter_by(user_id=user.id).one()
    assert link.token_hash != token  # only a hash of the token is stored
    assert len(link.token_hash) == 64


def test_nobody_can_log_in_before_verifying(client, on_roster):
    sign_up(client)
    response = client.post(LOGIN, json={"email": EMAIL, "password": PASSWORD})
    assert response.status_code == 403


def test_roll_number_and_email_ignore_case_and_spaces(client, on_roster):
    response = sign_up(client, roll_number=" 23f1002345 ", email=" 23F1002345@DS.study.iitm.ac.in ")
    assert response.status_code == 201
    assert response.get_json()["email"] == EMAIL


@pytest.mark.parametrize("email", ["23f1002345@gmail.com", "23f1002345@iitm.ac.in"])
def test_an_email_outside_the_approved_domains_is_refused_and_nothing_is_stored(client, on_roster, email):
    with mail.record_messages() as outbox:
        response = sign_up(client, email=email)

    assert response.status_code == 422
    assert response.get_json()["message"] == "Use your IITM BS institute email."
    assert response.get_json()["errors"] == {"json": {"email": ["Use your IITM BS institute email."]}}
    assert nothing_stored()
    assert outbox == []


def test_a_disabled_domain_is_refused(client, on_roster):
    db.session.query(EmailDomain).filter_by(domain="ds.study.iitm.ac.in").one().enabled = False
    db.session.commit()
    assert sign_up(client).status_code == 422
    assert nothing_stored()


def test_a_roll_number_not_on_the_roster_is_refused_and_nothing_is_stored(client, on_roster):
    response = sign_up(client, roll_number="23F9999999")
    assert response.status_code == 403
    assert response.get_json()["message"] == "You are not registered with IIC. Please contact IIC to register."
    assert nothing_stored()


def test_a_student_removed_from_the_roster_cannot_sign_up(client, on_roster):
    on_roster.removed_at = datetime.now(UTC)
    db.session.commit()
    assert sign_up(client).status_code == 403
    assert nothing_stored()


def test_the_email_must_be_the_one_iic_registered_for_the_roll_number(client, on_roster):
    response = sign_up(client, email="someone.else@ds.study.iitm.ac.in")
    assert response.status_code == 422
    assert response.get_json()["message"] == auth.NOT_ROSTER_EMAIL
    assert nothing_stored()


def test_a_verified_account_for_the_roll_number_means_log_in_instead(client, on_roster):
    client.post(VERIFY, json={"token": sign_up_and_get_token(client)})

    response = sign_up(client, password="another-password")

    assert response.status_code == 409
    assert response.get_json()["message"] == "An account already exists for this roll number. Log in instead."
    assert client.post(LOGIN, json={"email": EMAIL, "password": PASSWORD}).status_code == 200  # unchanged


def test_an_existing_account_with_the_same_email_is_refused(client, on_roster, make_user):
    make_user("mentor", email=EMAIL)
    response = sign_up(client)
    assert response.status_code == 409
    assert response.get_json()["message"] == auth.EMAIL_TAKEN


@pytest.mark.parametrize("password", ["short", "x" * 129])
def test_the_password_must_be_8_to_128_characters(client, on_roster, password):
    response = sign_up(client, password=password)
    assert response.status_code == 422
    assert "password" in response.get_json()["errors"]["json"]
    assert nothing_stored()


def test_signing_up_again_before_verifying_sends_a_new_link_and_retires_the_old_one(client, on_roster):
    old = sign_up_and_get_token(client)
    new = sign_up_and_get_token(client, password="a-newer-password")

    assert client.post(VERIFY, json={"token": old}).status_code == 404
    assert client.post(VERIFY, json={"token": new}).status_code == 200
    assert client.post(LOGIN, json={"email": EMAIL, "password": "a-newer-password"}).status_code == 200
    assert db.session.query(User).count() == 1
    assert db.session.query(Student).count() == 1


# Verifying the email


def test_the_link_activates_the_account_and_logs_the_student_in(client, on_roster):
    token = sign_up_and_get_token(client)

    response = client.post(VERIFY, json={"token": token})

    assert response.status_code == 200
    body = response.get_json()
    assert body["token_type"] == "Bearer"
    assert body["user"]["roles"] == ["student"]
    assert (body["user"]["name"], body["user"]["roll"]) == (NAME, ROLL)
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert client.post(LOGIN, json={"email": EMAIL, "password": PASSWORD}).status_code == 200


@pytest.mark.parametrize(
    "pasted",
    ["  {token}\n", "http://localhost:5173/verify-email/{token}", "http://localhost:5173/verify-email/{token}/"],
)
def test_a_pasted_link_or_a_token_with_spaces_works(client, on_roster, pasted):
    token = sign_up_and_get_token(client)
    response = client.post(VERIFY, json={"token": pasted.format(token=token)})
    assert response.status_code == 200


def test_a_link_works_only_once(client, on_roster):
    token = sign_up_and_get_token(client)
    client.post(VERIFY, json={"token": token})

    response = client.post(VERIFY, json={"token": token})

    assert response.status_code == 409
    assert response.get_json()["message"] == "Your email is already verified. Log in instead."


def test_a_link_older_than_24_hours_is_refused(client, on_roster):
    token = sign_up_and_get_token(client)
    link = db.session.query(EmailVerification).one()
    link.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db.session.commit()

    response = client.post(VERIFY, json={"token": token})

    assert response.status_code == 410
    assert response.get_json()["message"] == "This link has expired. Ask for a new one."
    assert db.session.query(User).one().email_verified_at is None


def test_the_link_is_valid_for_24_hours(client, on_roster):
    sign_up_and_get_token(client)
    link = db.session.query(EmailVerification).one()
    expires_at = link.expires_at.replace(tzinfo=UTC)
    assert timedelta(hours=23, minutes=59) < expires_at - datetime.now(UTC) <= timedelta(hours=24)


def test_an_unknown_link_is_refused(client):
    response = client.post(VERIFY, json={"token": "not-a-real-token"})
    assert response.status_code == 404


# Asking for a new link


def test_resending_emails_a_new_link_and_retires_the_old_one(client, on_roster):
    old = sign_up_and_get_token(client)

    with mail.record_messages() as outbox:
        response = client.post(RESEND, json={"email": f" {EMAIL.upper()} "})
    assert response.status_code == 204
    assert len(outbox) == 1
    new = re.search(r"/verify-email/(\S+)", outbox[0].body).group(1)

    assert client.post(VERIFY, json={"token": old}).status_code == 404
    assert client.post(VERIFY, json={"token": new}).status_code == 200


def test_resending_gives_the_same_answer_when_there_is_nothing_to_verify(client, on_roster, make_user):
    client.post(VERIFY, json={"token": sign_up_and_get_token(client)})  # Sneha is verified
    make_user("iic", email="deepa@ds.study.iitm.ac.in", verified=False)  # not a student

    with mail.record_messages() as outbox:
        for email in (EMAIL, "nobody@ds.study.iitm.ac.in", "deepa@ds.study.iitm.ac.in"):
            assert client.post(RESEND, json={"email": email}).status_code == 204
    assert outbox == []


# Seed data


def test_the_seeded_roster_lets_a_new_student_sign_up(client):
    from app.seed import seed_database

    seed_database()
    response = sign_up(client, email="23f1002346@ds.study.iitm.ac.in", roll_number="23f1002346")
    assert response.status_code == 201
    assert sign_up(client, email="rahul.student@ds.study.iitm.ac.in", roll_number="21F1000001").status_code == 409
