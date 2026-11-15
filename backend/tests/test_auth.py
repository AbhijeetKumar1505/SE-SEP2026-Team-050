"""SCRUM-71: login, logout, tokens, role checks and ownership checks."""

from datetime import timedelta

import pytest
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from app.auth import services
from app.auth.access import require_owner_or
from app.auth.models import ROLES, User
from app.extensions import api, db
from app.openapi import ApiBlueprint
from tests.conftest import PASSWORD

LOGIN = "/api/auth/login"
ME = "/api/auth/me"
LOGOUT = "/api/auth/logout"


def login(client, email, password=PASSWORD):
    return client.post(LOGIN, json={"email": email, "password": password})


# ---------- Login ----------


def test_login_returns_a_token_that_identifies_the_user(client, make_user):
    user = make_user("student")
    response = login(client, user.email)
    assert response.status_code == 200
    body = response.get_json()
    assert body["token_type"] == "Bearer"
    assert body["expires_in"] == 8 * 3600
    assert body["user"] == {"id": user.id, "email": user.email, "roles": ["student"]}

    me = client.get(ME, headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.get_json() == body["user"]


def test_login_ignores_email_case_and_spaces(client, make_user):
    user = make_user("mentor", email="meera.iyer@example.com")
    assert login(client, "  Meera.Iyer@Example.com ").status_code == 200
    assert user.email == "meera.iyer@example.com"


def test_wrong_password_and_unknown_email_get_the_same_401(client, make_user):
    user = make_user("student")
    wrong_password = login(client, user.email, "not-the-password")
    unknown_email = login(client, "nobody@ds.study.iitm.ac.in")
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert (
        wrong_password.get_json()
        == unknown_email.get_json()
        == {
            "code": 401,
            "status": "Unauthorized",
            "message": "Email or password is incorrect.",
        }
    )


def test_unverified_email_cannot_log_in(client, make_user):
    user = make_user("student", verified=False)
    response = login(client, user.email)
    assert response.status_code == 403
    assert response.get_json()["message"] == "Verify your email address before logging in."


def test_account_without_a_password_cannot_log_in(client, make_user):
    """A mentor IIC has added but who has not activated their account yet (US-14)."""
    user = make_user("mentor", password=None)
    assert login(client, user.email, "anything").status_code == 401


@pytest.mark.parametrize(
    "body, field",
    [
        ({"password": PASSWORD}, "email"),
        ({"email": "not-an-email", "password": PASSWORD}, "email"),
        ({"email": "a@b.co"}, "password"),
    ],
)
def test_login_validates_its_fields(client, body, field):
    response = client.post(LOGIN, json=body)
    assert response.status_code == 422
    assert field in response.get_json()["errors"]["json"]


def test_passwords_are_stored_hashed(make_user):
    user = make_user("student")
    assert user.password_hash != PASSWORD
    assert check_password_hash(user.password_hash, PASSWORD)


# ---------- Tokens ----------


def test_me_needs_a_token(client):
    response = client.get(ME)
    assert response.status_code == 401
    assert response.get_json() == {"code": 401, "status": "Unauthorized", "message": "Log in to continue."}


def test_malformed_token_is_rejected(client):
    response = client.get(ME, headers={"Authorization": "Bearer not.a.token"})
    assert response.status_code == 401
    assert response.get_json()["message"] == "The login token is invalid. Log in again."


def test_expired_token_is_rejected(app, client, make_user):
    user = make_user("student")
    token = create_access_token(str(user.id), expires_delta=timedelta(seconds=-1), additional_claims={"roles": []})
    response = client.get(ME, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.get_json()["message"] == "Your login has expired. Log in again."


def test_token_of_a_deleted_user_is_rejected(client, make_user, login_as):
    user = make_user("student")
    headers = login_as(user=user)
    db.session.delete(user)
    db.session.commit()
    response = client.get(ME, headers=headers)
    assert response.status_code == 401
    assert response.get_json()["message"] == "This account no longer exists."


def test_logout_revokes_the_token(client, login_as):
    headers = login_as("student")
    assert client.post(LOGOUT, headers=headers).status_code == 204
    response = client.get(ME, headers=headers)
    assert response.status_code == 401
    assert response.get_json()["message"] == "You have logged out. Log in again."


def test_logout_leaves_other_tokens_working(client, make_user, login_as):
    user = make_user("student")
    first, second = login_as(user=user), login_as(user=user)
    client.post(LOGOUT, headers=first)
    assert client.get(ME, headers=second).status_code == 200


# ---------- Role checks ----------


@pytest.fixture
def protected(app):
    """Test-only endpoints: one for IIC, one for students or IIC, one for anyone logged in."""
    blp = ApiBlueprint("roles_demo", __name__, url_prefix="/api/roles-demo", description="Test only")

    @blp.route("/iic")
    @blp.stories("US-16")
    @blp.auth("iic")
    @blp.response(200)
    def iic_only():
        """IIC only"""
        return {"ok": True}

    @blp.route("/student-or-iic")
    @blp.stories("US-05")
    @blp.auth("student", "iic")
    @blp.response(200)
    def student_or_iic():
        """Student or IIC"""
        return {"ok": True}

    @blp.route("/anyone")
    @blp.stories("US-01")
    @blp.auth()
    @blp.response(200)
    def anyone():
        """Any logged-in user"""
        return {"ok": True}

    api.register_blueprint(blp)
    return "/api/roles-demo"


@pytest.mark.parametrize(
    "path, role, expected",
    [
        ("/iic", "iic", 200),
        ("/iic", "student", 403),
        ("/iic", "mentor", 403),
        ("/iic", "leadership", 403),
        ("/student-or-iic", "student", 200),
        ("/student-or-iic", "iic", 200),
        ("/student-or-iic", "mentor", 403),
        ("/anyone", "leadership", 200),
        ("/anyone", "mentor", 200),
    ],
)
def test_roles_decide_access(client, login_as, protected, path, role, expected):
    response = client.get(protected + path, headers=login_as(role))
    assert response.status_code == expected
    if expected == 403:
        assert response.get_json() == {"code": 403, "status": "Forbidden", "message": "Your role does not allow this."}


def test_protected_endpoints_need_a_login(client, protected):
    for path in ("/iic", "/student-or-iic", "/anyone"):
        assert client.get(protected + path).status_code == 401


def test_auth_documents_security_roles_and_errors(protected):
    paths = api.spec.to_dict()["paths"]
    iic = paths["/api/roles-demo/iic"]["get"]
    assert iic["security"] == [{"bearerAuth": []}]
    assert iic["x-roles"] == ["iic"]
    assert iic["responses"]["401"] == {"$ref": "#/components/responses/UNAUTHORIZED"}
    assert iic["responses"]["403"] == {"$ref": "#/components/responses/FORBIDDEN"}
    anyone = paths["/api/roles-demo/anyone"]["get"]
    assert "x-roles" not in anyone and "403" not in anyone["responses"]


def test_login_is_public_and_me_is_protected_in_the_document(client):
    paths = client.get("/api/docs/openapi.json").get_json()["paths"]
    assert "security" not in paths[LOGIN]["post"]
    assert paths[ME]["get"]["security"] == [{"bearerAuth": []}]
    assert paths[LOGOUT]["post"]["security"] == [{"bearerAuth": []}]


def test_unknown_role_is_a_programming_error():
    blp = ApiBlueprint("bad_roles", __name__)
    with pytest.raises(ValueError, match="admin"):
        blp.auth("admin")


# ---------- Ownership ----------


@pytest.mark.parametrize("who, allowed", [("owner", True), ("other student", False), ("iic", True), ("mentor", False)])
def test_require_owner_or(app, make_user, login_as, who, allowed):
    owner = make_user("student")
    headers = {
        "owner": login_as(user=owner),
        "other student": login_as("student"),
        "iic": login_as("iic"),
        "mentor": login_as("mentor"),
    }[who]
    with app.test_request_context(headers=headers):
        from flask_jwt_extended import verify_jwt_in_request
        from werkzeug.exceptions import Forbidden

        verify_jwt_in_request()
        if allowed:
            require_owner_or(owner.id, "iic")
        else:
            with pytest.raises(Forbidden):
                require_owner_or(owner.id, "iic")


# ---------- Accounts and the create-user command ----------


def test_create_user_rejects_duplicates_and_short_passwords(make_user):
    make_user("student", email="dup@ds.study.iitm.ac.in")
    with pytest.raises(services.DuplicateEmail):
        services.create_user("DUP@ds.study.iitm.ac.in", password=PASSWORD, roles=["student"])
    with pytest.raises(ValueError, match="8 characters"):
        services.create_user("short@ds.study.iitm.ac.in", password="short", roles=["student"])


def test_create_user_command(app):
    runner = app.test_cli_runner()
    result = runner.invoke(args=["create-user", "Deepa@IITM.ac.in", "--role", "iic", "--password", PASSWORD])
    assert result.exit_code == 0, result.output
    user = db.session.query(User).filter_by(email="deepa@iitm.ac.in").one()
    assert user.role_names == ["iic"]
    assert user.email_verified_at is not None

    again = runner.invoke(args=["create-user", "deepa@iitm.ac.in", "--role", "iic", "--password", PASSWORD])
    assert again.exit_code != 0
    assert "already exists" in again.output


def test_every_role_exists():
    assert ROLES == ("student", "mentor", "iic", "leadership")
