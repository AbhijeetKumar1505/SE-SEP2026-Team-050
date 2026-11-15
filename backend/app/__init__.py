"""Application factory for the IITM BS Mentoring API.

    flask run                     # development server on http://127.0.0.1:5000
    flask openapi write --format=yaml openapi.yaml

Which configuration is used: the config_name argument, else FLASK_CONFIG, else "development".
"""

import os

from flask import Flask

from .auth import models as _auth_models  # noqa: F401  (each module's tables, so migrations see them)
from .auth import tokens as _tokens  # noqa: F401  (registers the JWT callbacks)
from .auth.cli import create_user_command
from .config import CONFIGS
from .extensions import api, cors, db, jwt, mail, migrate
from .log import configure_logging
from .modules import BLUEPRINTS
from .settings import models as _settings_models  # noqa: F401


def create_app(config_name: str | None = None) -> Flask:
    name = config_name or os.environ.get("FLASK_CONFIG", "development")
    if name not in CONFIGS:
        raise ValueError(f"Unknown configuration {name!r}; use one of {', '.join(CONFIGS)}.")
    config = CONFIGS[name]
    if hasattr(config, "check"):
        config.check()

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config)
    os.makedirs(app.instance_path, exist_ok=True)  # the local SQLite file lives here

    configure_logging(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    api.init_app(app)

    for blueprint in BLUEPRINTS:
        api.register_blueprint(blueprint)

    app.cli.add_command(create_user_command)

    return app
