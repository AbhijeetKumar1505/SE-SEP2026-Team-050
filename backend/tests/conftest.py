"""Shared pytest fixtures. SCRUM-74 adds CI and more fixtures on top of these."""

import itertools

import pytest

from app import create_app
from app.auth import services as auth_services
from app.auth.tokens import issue_token
from app.extensions import db

PASSWORD = "correct-horse-battery"
_counter = itertools.count(1)


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        auth_services.ensure_roles()
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def make_user(app):
    """Create a user: make_user("student"), make_user("iic", email=..., verified=False)."""

    def make(*roles, email=None, password=PASSWORD, verified=True):
        email = email or f"user{next(_counter)}@ds.study.iitm.ac.in"
        return auth_services.create_user(email, password=password, roles=roles, verified=verified)

    return make


@pytest.fixture
def login_as(make_user):
    """Headers for a request as a new user with the given roles: client.get(url, headers=login_as("iic"))."""

    def login(*roles, user=None):
        user = user or make_user(*roles)
        token, _ = issue_token(user)
        return {"Authorization": f"Bearer {token}"}

    return login
