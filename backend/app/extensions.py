"""Flask extensions, created once here and bound to the app in create_app()."""

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

from .openapi import MentoringApi

# Named constraints, so migrations can alter them on SQLite as well as PostgreSQL.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

db = SQLAlchemy(metadata=MetaData(naming_convention=NAMING_CONVENTION))
migrate = Migrate(render_as_batch=True)  # batch mode lets SQLite run ALTER TABLE migrations
jwt = JWTManager()
mail = Mail()
cors = CORS()
api = MentoringApi()
