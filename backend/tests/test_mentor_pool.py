"""SCRUM-112 (US-14): IIC adds or imports mentors, verifies them, and mentors activate their accounts."""

import re
from datetime import UTC, datetime, timedelta

import pytest

from app.audit.models import AuditLog
from app.auth.models import ACTIVATE_MENTOR, IIC, LEADERSHIP, MENTOR, STUDENT, EmailVerification, User
from app.extensions import db, mail
from app.mentors import services as pool
from app.mentors.models import ACTIVE, PENDING, VERIFIED, Mentor

MENTORS = "/api/mentors"
IMPORT = "/api/mentors/import"
ACTIVATION = "/api/mentors/activation"
PASSWORD = "a-strong-password"


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


def mentor_row(email, name="Rahul Menon", tags="Computer vision; Choosing electives", experience=""):
    return {"name": name, "email": email, "expertise_tags": tags, "experience": experience}


def add(client, iic, email="rahul.menon@example.com", name="Rahul Menon", headline="Data scientist"):
    response = client.post(MENTORS, json={"name": name, "email": email, "headline": headline}, headers=iic)
    assert response.status_code == 201, response.get_json()
    return db.session.get(Mentor, response.get_json()["id"])


def verify_and_get_token(client, iic, mentor, tags=("Computer vision",)):
    with mail.record_messages() as outbox:
        response = client.post(f"{MENTORS}/{mentor.id}/verify", json={"expertise": list(tags)}, headers=iic)
    assert response.status_code == 200, response.get_json()
    assert len(outbox) == 1
    return re.search(r"/activate/(\S+)", outbox[0].body).group(1)


# Adding one mentor


def test_an_added_mentor_is_pending_and_cannot_log_in(client, iic):
    mentor = add(client, iic)

    assert mentor.verification_status == PENDING
    assert mentor.headline == "Data scientist"
    assert (mentor.user.password_hash, mentor.user.email_verified_at) == (None, None)
    assert mentor.user.role_names == ["mentor"]
    response = client.post("/api/auth/login", json={"email": "rahul.menon@example.com", "password": "anything-at-all"})
    assert response.status_code == 401
    assert db.session.query(AuditLog).filter_by(action="add_mentor", entity_id=mentor.id).count() == 1


def test_adding_an_email_that_already_has_an_account_is_refused(client, iic, make_user):
    add(client, iic)
    make_user(STUDENT, email="taken@ds.study.iitm.ac.in")
    for email in ("RAHUL.MENON@example.com", "taken@ds.study.iitm.ac.in"):
        response = client.post(MENTORS, json={"name": "Someone", "email": email}, headers=iic)
        assert response.status_code == 409


# Importing


def test_valid_rows_become_pending_mentors_and_invalid_rows_are_listed(client, iic, make_user):
    make_user(STUDENT, email="student@ds.study.iitm.ac.in")

    response = client.post(
        IMPORT,
        json={
            "file": "mentors.csv",
            "rows": [
                mentor_row(
                    "rahul.menon@example.com", experience="Internship at TCS (3 months); Data analyst at Swiggy"
                ),
                mentor_row("no.name@example.com", name=""),
                mentor_row("not-an-email"),
                mentor_row("tags@example.com", tags="Computer vision; Underwater basket weaving"),
                mentor_row("RAHUL.MENON@example.com", name="Again"),
                mentor_row("student@ds.study.iitm.ac.in"),
                mentor_row("meera.iyer@example.com", name="Meera Iyer", tags=""),
            ],
        },
        headers=iic,
    )

    assert response.status_code == 200
    body = response.get_json()
    assert (body["file"], body["added"], body["updated"]) == ("mentors.csv", 2, 0)
    assert body["errors"] == [
        {"row": 3, "reason": "Name is missing."},
        {"row": 4, "reason": "Email is not valid."},
        {"row": 5, "reason": "Unknown topic tag: Underwater basket weaving."},
        {"row": 6, "reason": "Email rahul.menon@example.com is already in row 2 of this file."},
        {"row": 7, "reason": "Email student@ds.study.iitm.ac.in belongs to an account that is not a mentor."},
    ]
    mentors = {m.user.email: m for m in db.session.query(Mentor)}
    assert set(mentors) == {"rahul.menon@example.com", "meera.iyer@example.com"}  # no refused row is saved
    rahul = mentors["rahul.menon@example.com"]
    assert rahul.verification_status == PENDING
    assert sorted(tag.name for tag in rahul.tags) == ["Choosing electives", "Computer vision"]
    assert rahul.experience == ["Internship at TCS (3 months)", "Data analyst at Swiggy"]
    assert db.session.query(AuditLog).filter_by(action="import_mentors").one().details == (
        "mentors.csv: 2 added, 0 updated, 5 rows refused."
    )


def test_importing_a_mentor_again_updates_them_instead_of_duplicating(client, iic):
    client.post(IMPORT, json={"file": "a.csv", "rows": [mentor_row("rahul.menon@example.com")]}, headers=iic)

    response = client.post(
        IMPORT,
        json={
            "file": "b.csv",
            "rows": [mentor_row("rahul.menon@example.com", name="Rahul K Menon", tags="Choosing electives")],
        },
        headers=iic,
    )

    assert (response.get_json()["added"], response.get_json()["updated"]) == (0, 1)
    mentor = db.session.query(Mentor).one()
    assert mentor.name == "Rahul K Menon"
    assert [tag.name for tag in mentor.tags] == ["Choosing electives"]


@pytest.mark.parametrize("body", [{"rows": [mentor_row("a@example.com")]}, {"file": "m.csv", "rows": []}])
def test_an_import_needs_a_file_name_and_rows(client, iic, body):
    assert client.post(IMPORT, json=body, headers=iic).status_code == 422


# Listing


def test_the_pool_lists_every_mentor_with_status_and_load(client, iic, sample_mentorship):
    add(client, iic, email="kavya.iyer@example.com", name="Kavya Iyer")

    response = client.get(MENTORS, headers=iic)

    assert response.status_code == 200
    mentors = {m["email"]: m for m in response.get_json()}
    kavya = mentors["kavya.iyer@example.com"]
    assert (kavya["status"], kavya["available"], kavya["load"], kavya["verified_by"]) == (PENDING, False, 0, None)
    active = mentors[sample_mentorship.mentor.user.email]
    assert (active["status"], active["load"]) == (ACTIVE, 1)


# Verifying


def test_verifying_records_who_and_when_and_emails_a_7_day_activation_link(client, iic, iic_user):
    mentor = add(client, iic)

    with mail.record_messages() as outbox:
        response = client.post(
            f"{MENTORS}/{mentor.id}/verify", json={"expertise": ["Computer vision", "computer vision"]}, headers=iic
        )

    assert response.status_code == 200
    body = response.get_json()
    assert body["status"] == VERIFIED
    assert body["expertise"] == ["Computer vision"]
    assert body["verified_by"] is not None and body["verified_at"] is not None
    assert len(outbox) == 1
    email = outbox[0]
    assert email.recipients == ["rahul.menon@example.com"]
    assert email.subject == "Activate your IITM BS Mentoring account"
    assert "The link works for 7 days." in email.body
    assert re.search(r"Open this link: http://localhost:5173/activate/\S+$", email.body)
    link = db.session.query(EmailVerification).filter_by(purpose=ACTIVATE_MENTOR).one()
    lifetime = link.expires_at.replace(tzinfo=UTC) - datetime.now(UTC)
    assert timedelta(days=6, hours=23) < lifetime <= timedelta(days=7)
    assert db.session.query(AuditLog).filter_by(action="verify_mentor", entity_id=mentor.id).count() == 1


def test_only_a_pending_mentor_can_be_verified(client, iic, sample_mentor):
    response = client.post(f"{MENTORS}/{sample_mentor.id}/verify", json={"expertise": ["Computer vision"]}, headers=iic)
    assert response.status_code == 409
    assert client.post(f"{MENTORS}/999/verify", json={"expertise": ["Computer vision"]}, headers=iic).status_code == 404


@pytest.mark.parametrize("expertise, status", [([], 422), (["No such tag"], 422)])
def test_verifying_needs_known_tags(client, iic, expertise, status):
    mentor = add(client, iic)
    response = client.post(f"{MENTORS}/{mentor.id}/verify", json={"expertise": expertise}, headers=iic)
    assert response.status_code == status
    assert db.session.get(Mentor, mentor.id).verification_status == PENDING


# Activating


def test_a_verified_mentor_activates_their_account_and_is_logged_in(client, iic):
    token = verify_and_get_token(client, iic, add(client, iic))

    info = client.get(f"{ACTIVATION}/{token}")
    assert info.status_code == 200
    assert info.get_json()["valid"] is True
    assert info.get_json()["name"] == "Rahul Menon"

    response = client.post(f"{ACTIVATION}/{token}", json={"password": PASSWORD})

    assert response.status_code == 200
    assert response.get_json()["user"]["roles"] == ["mentor"]
    mentor = db.session.query(Mentor).one()
    assert mentor.verification_status == ACTIVE
    assert mentor.user.email_verified_at is not None
    assert (
        client.post("/api/auth/login", json={"email": "rahul.menon@example.com", "password": PASSWORD}).status_code
        == 200
    )
    assert client.get(f"{ACTIVATION}/{token}").status_code == 410  # used
    assert client.post(f"{ACTIVATION}/{token}", json={"password": PASSWORD}).status_code == 410


def test_an_activation_link_older_than_7_days_is_refused(client, iic):
    token = verify_and_get_token(client, iic, add(client, iic))
    link = db.session.query(EmailVerification).one()
    link.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db.session.commit()

    assert client.get(f"{ACTIVATION}/{token}").status_code == 410
    assert client.post(f"{ACTIVATION}/{token}", json={"password": PASSWORD}).status_code == 410
    assert db.session.query(Mentor).one().verification_status == VERIFIED


def test_resending_replaces_the_activation_link(client, iic):
    mentor = add(client, iic)
    old = verify_and_get_token(client, iic, mentor)

    with mail.record_messages() as outbox:
        response = client.post(f"{MENTORS}/{mentor.id}/resend-activation", headers=iic)
    assert response.status_code == 200
    new = re.search(r"/activate/(\S+)", outbox[0].body).group(1)

    assert client.get(f"{ACTIVATION}/{old}").status_code == 404
    assert client.get(f"{ACTIVATION}/{new}").status_code == 200


def test_only_a_verified_mentor_who_has_not_activated_gets_a_new_link(client, iic, sample_mentor):
    pending = add(client, iic)
    assert client.post(f"{MENTORS}/{pending.id}/resend-activation", headers=iic).status_code == 409
    assert client.post(f"{MENTORS}/{sample_mentor.id}/resend-activation", headers=iic).status_code == 409


def test_activation_and_sign_up_links_cannot_stand_in_for_each_other(client, iic):
    token = verify_and_get_token(client, iic, add(client, iic))
    assert client.post("/api/auth/verify-email", json={"token": token}).status_code == 404
    assert client.get(f"{ACTIVATION}/not-a-real-token").status_code == 404
    assert client.post(f"{ACTIVATION}/{token}", json={"password": "short"}).status_code == 422


# Who can be recommended or assigned


def test_only_active_available_mentors_can_be_assigned(client, iic, mentor_client):
    pending = add(client, iic, email="pending@example.com", name="Pending Mentor")
    waiting = add(client, iic, email="waiting@example.com", name="Waiting Mentor")
    activating = add(client, iic, email="activating@example.com", name="Activating Mentor")
    verify_and_get_token(client, iic, waiting)
    token = verify_and_get_token(client, iic, activating)
    login = client.post(f"{ACTIVATION}/{token}", json={"password": PASSWORD}).get_json()

    assignable = {m.user.email for m in pool.assignable_mentors()}
    assert not {"pending@example.com", "waiting@example.com", "activating@example.com"} & assignable

    # Once the activated mentor says they are available (US-10), they can be assigned.
    headers = {"Authorization": f"Bearer {login['access_token']}"}
    assert client.put("/api/mentors/me", json={"available": True}, headers=headers).status_code == 200
    assignable = {m.user.email for m in pool.assignable_mentors()}
    assert "activating@example.com" in assignable
    assert pending.verification_status == PENDING


# Access


@pytest.mark.parametrize(
    "method, url, body",
    [
        ("get", MENTORS, None),
        ("post", MENTORS, {"name": "X", "email": "x@example.com"}),
        ("post", IMPORT, {"file": "m.csv", "rows": [mentor_row("x@example.com")]}),
        ("post", f"{MENTORS}/1/verify", {"expertise": ["Computer vision"]}),
        ("post", f"{MENTORS}/1/resend-activation", None),
    ],
)
@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_can_manage_the_mentor_pool(client, login_as, method, url, body, role):
    assert getattr(client, method)(url, json=body, headers=login_as(role)).status_code == 403
    assert getattr(client, method)(url, json=body).status_code == 401


def test_unused_mentor_accounts_have_no_password(client, iic):
    add(client, iic)
    assert db.session.query(User).filter_by(email="rahul.menon@example.com").one().password_hash is None
