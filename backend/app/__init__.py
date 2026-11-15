"""Application factory for the IITM BS Mentoring API.

    flask run                     # development server on http://127.0.0.1:5000
    flask openapi write --format=yaml openapi.yaml
    flask seed-data               # populate realistic dummy dataset

Which configuration is used: the config_name argument, else FLASK_CONFIG, else "development".
"""

import os

from flask import Flask

from .audit import models as _audit_models  # noqa: F401
from .auth import models as _auth_models  # noqa: F401  (each module's tables, so migrations see them)
from .auth import tokens as _tokens  # noqa: F401  (registers the JWT callbacks)
from .auth.cli import create_user_command
from .cases import models as _cases_models  # noqa: F401
from .config import CONFIGS
from .extensions import api, cors, db, jwt, mail, migrate
from .feedback import models as _feedback_models  # noqa: F401
from .log import configure_logging
from .matching import models as _matching_models  # noqa: F401
from .mentors import models as _mentors_models  # noqa: F401
from .mentorships import models as _mentorships_models  # noqa: F401
from .modules import BLUEPRINTS
from .monitoring import models as _monitoring_models  # noqa: F401
from .notifications import models as _notifications_models  # noqa: F401
from .problems import models as _problems_models  # noqa: F401
from .seed import seed_data_command
from .sessions import models as _sessions_models  # noqa: F401
from .settings import models as _settings_models  # noqa: F401
from .students import models as _students_models  # noqa: F401


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
    app.cli.add_command(seed_data_command)

    return app
