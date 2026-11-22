"""SCRUM-69: the skeleton starts, every module is registered, and every error is JSON."""

import pytest
from flask_smorest import abort
from openapi_spec_validator import validate

from app import create_app
from app.config import DEV_SECRET, ProductionConfig, database_url
from app.modules import BLUEPRINTS

MODULES = [
    "auth", "students", "mentors", "settings", "problems", "matching", "mentorships",
    "cases", "sessions", "feedback", "monitoring", "insights", "notifications", "audit",
]  # fmt: skip


def test_testing_config_uses_in_memory_sqlite(app):
    assert app.testing
    assert app.config["SQLALCHEMY_DATABASE_URI"] == "sqlite://"


def test_development_does_not_print_the_smtp_exchange():
    """In debug mode Flask-Mail would log every email, links included, unless MAIL_DEBUG says otherwise."""
    app = create_app("development")
    assert app.debug
    assert not app.extensions["mail"].debug  # Flask-Mail stores the smtplib debug level, 0 = off


def test_unknown_config_name_is_rejected():
    with pytest.raises(ValueError, match="Unknown configuration"):
        create_app("staging")


def test_production_refuses_the_development_secret(monkeypatch):
    monkeypatch.setattr(ProductionConfig, "SECRET_KEY", DEV_SECRET)
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        create_app("production")


def test_production_refuses_a_short_signing_key(monkeypatch):
    monkeypatch.setattr(ProductionConfig, "SECRET_KEY", "short-but-not-default")
    monkeypatch.setattr(ProductionConfig, "JWT_SECRET_KEY", "short-but-not-default")
    with pytest.raises(RuntimeError, match="32 bytes"):
        create_app("production")


def test_old_postgres_scheme_is_normalised(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://u:p@host:5432/db")
    assert database_url("sqlite://") == "postgresql://u:p@host:5432/db"


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "version": "0.1.0"}


def test_every_module_is_registered_under_api():
    names = [bp.name for bp in BLUEPRINTS]
    assert names == ["system", *MODULES]
    for bp in BLUEPRINTS:
        assert bp.url_prefix.startswith("/api")


def test_unknown_url_returns_json_404(client):
    response = client.get("/api/no-such-thing")
    assert response.status_code == 404
    assert response.get_json() == {
        "code": 404,
        "status": "Not Found",
        "message": "The requested resource was not found.",
    }


def test_wrong_method_returns_json_405(client):
    response = client.post("/api/health")
    assert response.status_code == 405
    assert response.get_json()["status"] == "Method Not Allowed"


def test_abort_message_and_validation_errors_are_kept(app, client):
    @app.get("/api/_test/abort")
    def aborting():
        abort(422, message="Description is too short.", errors={"json": {"description": ["Too short."]}})

    response = client.get("/api/_test/abort")
    assert response.status_code == 422
    assert response.get_json() == {
        "code": 422,
        "status": "Unprocessable Entity",
        "message": "Description is too short.",
        "errors": {"json": {"description": ["Too short."]}},
    }


def test_unexpected_error_returns_json_500_without_details(app, client):
    app.config["PROPAGATE_EXCEPTIONS"] = False

    @app.get("/api/_test/crash")
    def crashing():
        raise RuntimeError("secret database detail")

    response = client.get("/api/_test/crash")
    assert response.status_code == 500
    body = response.get_json()
    assert body["code"] == 500
    assert "secret" not in response.get_data(as_text=True)


def test_openapi_document_is_valid_and_lists_every_module(client):
    response = client.get("/api/docs/openapi.json")
    assert response.status_code == 200
    spec = response.get_json()
    validate(spec)
    tags = {tag["name"] for tag in spec["tags"]}
    assert {"system", *MODULES} <= tags
    assert "/api/health" in spec["paths"]


def test_swagger_ui_is_served(client):
    response = client.get("/api/docs/swagger")
    assert response.status_code == 200
    assert b"swagger-ui" in response.data
