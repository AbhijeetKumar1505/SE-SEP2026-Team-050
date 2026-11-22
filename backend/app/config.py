"""Configuration classes, chosen by name in create_app() or by the FLASK_CONFIG variable.

Every setting that differs between machines comes from an environment variable, so the
same code runs locally (SQLite), in tests (in-memory SQLite) and on the host (PostgreSQL).
See .env.example for the full list.
"""

import os
from datetime import timedelta

from .openapi import SPEC_OPTIONS

# Development only. At least 32 bytes, the minimum PyJWT recommends for HS256 signing keys.
DEV_SECRET = "dev-only-secret-change-me-before-deploying"


def database_url(default: str) -> str:
    """Return DATABASE_URL, fixing the old postgres:// scheme that some hosts still hand out."""
    url = os.environ.get("DATABASE_URL", default)
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", DEV_SECRET)
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_ACCESS_HOURS", "8")))

    # A relative SQLite path is created in the instance/ folder.
    SQLALCHEMY_DATABASE_URI = database_url("sqlite:///mentoring.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # flask-smorest: the OpenAPI document and Swagger UI.
    API_TITLE = "IITM BS Mentoring API"
    API_VERSION = "0.1.0"
    OPENAPI_VERSION = "3.0.3"
    OPENAPI_URL_PREFIX = "/api/docs"
    OPENAPI_JSON_PATH = "openapi.json"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/"
    API_SPEC_OPTIONS = SPEC_OPTIONS  # info, servers and epic tag groups: see app/openapi.py
    # Show x-user-stories on each endpoint, and keep the pasted login token across page reloads.
    OPENAPI_SWAGGER_UI_CONFIG = {"showExtensions": True, "persistAuthorization": True}

    # The React dev server; set CORS_ORIGINS to a comma-separated list on the host.
    CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
    # Where the web app runs, for the links in emails.
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    MAIL_SERVER = os.environ.get("MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", "25"))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "false").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "IITM BS Mentoring <no-reply@localhost>")
    # Emails are only printed to the log until a provider is configured (decided with hosting).
    MAIL_SUPPRESS_SEND = os.environ.get("MAIL_SUPPRESS_SEND", "true").lower() == "true"
    # Flask-Mail would otherwise follow DEBUG and print every SMTP exchange, email body and links
    # included, to the log. Mailpit shows the emails; set MAIL_DEBUG=true to see the exchange.
    MAIL_DEBUG = os.environ.get("MAIL_DEBUG", "false").lower() == "true"

    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SECRET_KEY = "test-secret-key-for-pytest-only-000000"
    JWT_SECRET_KEY = "test-jwt-key-for-pytest-only-0000000000"
    SQLALCHEMY_DATABASE_URI = "sqlite://"  # in memory, fresh for every app
    MAIL_SUPPRESS_SEND = True
    LOG_LEVEL = "WARNING"


class ProductionConfig(Config):
    @classmethod
    def check(cls) -> None:
        if cls.SECRET_KEY == DEV_SECRET:
            raise RuntimeError("Set SECRET_KEY before running with FLASK_CONFIG=production.")
        if len(cls.JWT_SECRET_KEY.encode()) < 32:
            raise RuntimeError("SECRET_KEY (or JWT_SECRET_KEY) must be at least 32 bytes in production.")


CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
