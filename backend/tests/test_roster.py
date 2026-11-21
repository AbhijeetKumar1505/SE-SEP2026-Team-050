"""SCRUM-115 (US-15): IIC keeps the roster of registered students up to date."""

import pytest

from app.audit.models import AuditLog
from app.auth.models import IIC, LEADERSHIP, MENTOR, STUDENT
from app.extensions import db
from app.students.models import RosterEntry, RosterImport

ROSTER = "/api/students/roster"
IMPORT = "/api/students/roster/import"
NOT_REGISTERED = "You are not registered with IIC. Please contact IIC to register."


def row(roll, name=None, email=None):
    return {
        "name": name if name is not None else f"Student {roll}",
        "roll_number": roll,
        "institute_email": email if email is not None else f"{roll.lower()}@ds.study.iitm.ac.in",
    }


def import_rows(client, headers, rows, file="roster.csv"):
    return client.post(IMPORT, json={"file": file, "rows": rows}, headers=headers)


@pytest.fixture
def iic(login_as):
    return login_as(IIC)


# Importing


def test_valid_rows_are_added_and_invalid_rows_are_listed_with_row_number_and_reason(client, iic):
    response = import_rows(
        client,
        iic,
        [
            row("23f1002345", name="Sneha Pillai"),  # row 2: the header is row 1
            row("23f1002346", name=""),
            row("23O1002347"),  # letter O instead of 0
            row("23f1002348", email="23f1002348@gmail.com"),
            row("23f1002349", email="not-an-email"),
            row("23F1002345", name="Sneha again"),  # repeated in the file
            row("23f1002350", email="23f1002345@ds.study.iitm.ac.in"),  # email of row 2
            row("24f1000101", name="  Divya   Raman "),
        ],
    )

    assert response.status_code == 200
    body = response.get_json()
    assert (body["file"], body["added"], body["updated"]) == ("roster.csv", 2, 0)
    assert body["errors"] == [
        {"row": 3, "reason": "Name is missing."},
        {"row": 4, "reason": "Roll number is not valid. Use the form 23f1002345."},
        {"row": 5, "reason": "Institute email is not on an approved domain."},
        {"row": 6, "reason": "Institute email is not a valid email address."},
        {"row": 7, "reason": "Roll number 23F1002345 is already in row 2 of this file."},
        {"row": 8, "reason": "Institute email 23f1002345@ds.study.iitm.ac.in is already in row 2 of this file."},
    ]
    saved = {e.student_number: (e.name, e.email) for e in db.session.query(RosterEntry)}
    assert saved == {
        "23F1002345": ("Sneha Pillai", "23f1002345@ds.study.iitm.ac.in"),
        "24F1000101": ("Divya Raman", "24f1000101@ds.study.iitm.ac.in"),
    }


def test_importing_a_roll_number_again_updates_it_instead_of_duplicating_it(client, iic):
    import_rows(client, iic, [row("23f1002345", name="Sneha P")])

    response = import_rows(
        client, iic, [row("23F1002345", name="Sneha Pillai", email="sneha.p@ds.study.iitm.ac.in"), row("23f1002346")]
    )

    assert (response.get_json()["added"], response.get_json()["updated"]) == (1, 1)
    entry = db.session.query(RosterEntry).filter_by(student_number="23F1002345").one()
    assert (entry.name, entry.email) == ("Sneha Pillai", "sneha.p@ds.study.iitm.ac.in")
    assert db.session.query(RosterEntry).count() == 2


def test_an_email_registered_for_another_roll_number_is_refused(client, iic):
    import_rows(client, iic, [row("23f1002345")])
    response = import_rows(client, iic, [row("23f1002346", email="23f1002345@ds.study.iitm.ac.in")])
    reason = "Institute email 23f1002345@ds.study.iitm.ac.in is already registered for roll number 23F1002345."
    assert response.get_json()["errors"] == [{"row": 2, "reason": reason}]


def test_importing_puts_a_removed_student_back(client, iic):
    import_rows(client, iic, [row("23f1002345")])
    entry = db.session.query(RosterEntry).one()
    client.post(f"{ROSTER}/{entry.id}/remove", json={"reason": "Left."}, headers=iic)

    import_rows(client, iic, [row("23f1002345")])

    assert db.session.get(RosterEntry, entry.id).removed_at is None


def test_a_signed_up_student_takes_the_new_name(client, iic, sample_student):
    import_rows(
        client, iic, [row(sample_student.student_number, name="Renamed Student", email=sample_student.user.email)]
    )
    assert db.session.get(type(sample_student), sample_student.id).name == "Renamed Student"


def test_each_import_is_kept_and_recorded_in_the_audit_log(client, iic, iic_user):
    import_rows(client, iic, [row("23f1002345"), row("bad")], file="roster_nov_2026.csv")

    record = db.session.query(RosterImport).one()
    assert (record.file_name, record.added, record.updated) == ("roster_nov_2026.csv", 1, 0)
    assert record.errors == [{"row": 3, "reason": "Roll number is not valid. Use the form 23f1002345."}]
    entry = db.session.query(AuditLog).filter_by(action="import_roster").one()
    assert (entry.entity_type, entry.entity_id) == ("roster_import", record.id)
    assert entry.details == "roster_nov_2026.csv: 1 added, 0 updated, 1 rows refused."


@pytest.mark.parametrize(
    "body",
    [{"rows": [{"name": "x"}]}, {"file": "roster.csv", "rows": []}, {"file": "", "rows": [{"name": "x"}]}],
)
def test_an_import_needs_a_file_name_and_at_least_one_row(client, iic, body):
    assert client.post(IMPORT, json=body, headers=iic).status_code == 422


# Listing


def test_the_roster_shows_who_has_signed_up_and_the_last_import(client, iic, make_user, sample_student):
    import_rows(client, iic, [row("23f1002345", name="Aarav Shah"), row("23f1002346", name="Zoya Khan")])
    unverified = make_user(STUDENT, email="23f1002346@ds.study.iitm.ac.in", verified=False)
    db.session.add(type(sample_student)(user_id=unverified.id, student_number="23F1002346", name="Zoya Khan"))
    db.session.commit()

    response = client.get(ROSTER, headers=iic)

    assert response.status_code == 200
    body = response.get_json()
    students = {s["roll"]: s for s in body["students"]}
    assert [s["name"] for s in body["students"]] == ["Aarav Shah", "Sample Student", "Zoya Khan"]
    assert (students["23F1002345"]["signed_up"], students["23F1002345"]["profile_complete"]) == (False, False)
    assert (students["23F1002346"]["signed_up"], students["23F1002346"]["profile_complete"]) == (False, False)
    sample = students[sample_student.student_number]
    assert (sample["signed_up"], sample["profile_complete"]) == (True, True)
    assert body["last_import"]["added"] == 2
    assert body["last_import"]["imported_by"].endswith("@ds.study.iitm.ac.in")


def test_the_roster_is_empty_before_the_first_import(client, iic):
    assert client.get(ROSTER, headers=iic).get_json() == {"students": [], "last_import": None}


# Adding one student


def test_iic_can_add_one_student(client, iic):
    response = client.post(ROSTER, json=row("23f1002345", name="Sneha Pillai"), headers=iic)

    assert response.status_code == 201
    assert response.get_json() == {
        "id": db.session.query(RosterEntry).one().id,
        "name": "Sneha Pillai",
        "roll": "23F1002345",
        "email": "23f1002345@ds.study.iitm.ac.in",
        "signed_up": False,
        "profile_complete": False,
    }
    assert db.session.query(AuditLog).filter_by(action="add_to_roster").count() == 1


def test_adding_checks_the_row_like_the_import(client, iic):
    response = client.post(ROSTER, json=row("23f1002345", email="x@gmail.com"), headers=iic)
    assert response.status_code == 422
    assert response.get_json()["message"] == "Institute email is not on an approved domain."


def test_adding_a_roll_number_already_on_the_roster_is_refused(client, iic):
    client.post(ROSTER, json=row("23f1002345"), headers=iic)
    assert client.post(ROSTER, json=row("23F1002345", name="Other"), headers=iic).status_code == 409
    assert (
        client.post(ROSTER, json=row("23f1002346", email="23f1002345@ds.study.iitm.ac.in"), headers=iic).status_code
        == 409
    )


# Removing


def test_a_removed_student_cannot_sign_up(client, iic):
    client.post(ROSTER, json=row("23f1002345"), headers=iic)
    entry = db.session.query(RosterEntry).one()

    response = client.post(f"{ROSTER}/{entry.id}/remove", json={"reason": "Left the programme."}, headers=iic)

    assert response.status_code == 204
    assert db.session.get(RosterEntry, entry.id).removed_at is not None
    assert client.get(ROSTER, headers=iic).get_json()["students"] == []
    audit = db.session.query(AuditLog).filter_by(action="remove_from_roster").one()
    assert (audit.entity_id, audit.details) == (entry.id, "Left the programme.")

    signup = client.post(
        "/api/auth/signup",
        json={"email": "23f1002345@ds.study.iitm.ac.in", "roll_number": "23f1002345", "password": "a-strong-password"},
    )
    assert signup.status_code == 403
    assert signup.get_json()["message"] == NOT_REGISTERED


def test_a_removed_student_cannot_submit_a_new_problem(client, iic, login_as, sample_student):
    entry = db.session.query(RosterEntry).filter_by(student_number=sample_student.student_number).one()
    client.post(f"{ROSTER}/{entry.id}/remove", json={"reason": "Left the programme."}, headers=iic)

    response = client.post(
        "/api/problems",
        json={
            "description": "I want advice on choosing between two Computer Vision electives and planning a project.",
            "tags": ["Computer vision", "Choosing electives"],
            "desired_outcome": "A shortlist of electives and an outline for a project.",
        },
        headers=login_as(user=sample_student.user),
    )

    assert response.status_code == 403
    assert response.get_json()["message"] == NOT_REGISTERED


def test_removing_needs_a_reason_and_an_existing_entry(client, iic):
    client.post(ROSTER, json=row("23f1002345"), headers=iic)
    entry_id = db.session.query(RosterEntry).one().id

    assert client.post(f"{ROSTER}/{entry_id}/remove", json={"reason": "  "}, headers=iic).status_code == 422
    assert client.post(f"{ROSTER}/999/remove", json={"reason": "x"}, headers=iic).status_code == 404
    assert client.post(f"{ROSTER}/{entry_id}/remove", json={"reason": "Left."}, headers=iic).status_code == 204
    assert client.post(f"{ROSTER}/{entry_id}/remove", json={"reason": "Left."}, headers=iic).status_code == 409


# Access


@pytest.mark.parametrize(
    "method, url, body",
    [
        ("get", ROSTER, None),
        ("post", ROSTER, row("23f1002345")),
        ("post", IMPORT, {"file": "roster.csv", "rows": [row("23f1002345")]}),
        ("post", f"{ROSTER}/1/remove", {"reason": "x"}),
    ],
)
@pytest.mark.parametrize("role", [STUDENT, MENTOR, LEADERSHIP])
def test_only_iic_can_see_or_change_the_roster(client, login_as, method, url, body, role):
    response = getattr(client, method)(url, json=body, headers=login_as(role))
    assert response.status_code == 403
    assert getattr(client, method)(url, json=body).status_code == 401
