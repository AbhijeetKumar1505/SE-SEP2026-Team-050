"""The migrations build exactly the tables the models describe.

If this fails after a model change, generate a migration:  flask db migrate -m "what changed"
"""

from pathlib import Path

import flask_migrate
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext

from app import create_app
from app.auth.models import ROLES, Role
from app.config import TestingConfig
from app.extensions import db

MIGRATIONS = str(Path(__file__).resolve().parent.parent / "migrations")


def test_migrations_match_the_models_and_seed_the_roles(tmp_path, monkeypatch):
    monkeypatch.setattr(TestingConfig, "SQLALCHEMY_DATABASE_URI", f"sqlite:///{tmp_path / 'migrated.db'}")
    app = create_app("testing")
    with app.app_context():
        flask_migrate.upgrade(directory=MIGRATIONS)
        with db.engine.connect() as connection:
            differences = compare_metadata(MigrationContext.configure(connection), db.metadata)
        assert differences == [], f"models and migrations differ: {differences}"
        assert sorted(name for (name,) in db.session.query(Role.name)) == sorted(ROLES)

        flask_migrate.downgrade(directory=MIGRATIONS, revision="base")
        flask_migrate.upgrade(directory=MIGRATIONS)
        db.session.remove()
