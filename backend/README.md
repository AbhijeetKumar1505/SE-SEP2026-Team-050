# IITM BS Mentoring: backend

The REST API of the Student Mentoring and Career Support Platform (Team 050). It is one Flask application, split into one module per component of the Milestone 2 design (C1 to C14). The stack and the reasons for it are in [docs/milestone-2/tech-stack.md](../docs/milestone-2/tech-stack.md).

## Requirements

- Python 3.12 or later
- Nothing else for local development: the database is a SQLite file, and emails are printed to the log instead of being sent.

## Set up and run

From this folder (`backend/`):

```bash
python -m venv .venv
```

Activate the environment. On Windows (PowerShell): `.venv\Scripts\Activate.ps1`. On macOS or Linux: `source .venv/bin/activate`. Then:

```bash
pip install -r requirements-dev.txt
flask db upgrade
flask create-user you@example.com --role iic
flask run
```

`flask db upgrade` creates the database tables (in `instance/mentoring.db`). `flask create-user` makes an account you can log in with; it asks for a password. Use `--role` with `student`, `mentor`, `iic` or `leadership`.

The API runs at http://127.0.0.1:5000. Check it with http://127.0.0.1:5000/api/health, and browse every endpoint in Swagger UI at http://127.0.0.1:5000/api/docs/swagger. To call a protected endpoint there, log in with `POST /api/auth/login`, copy the `access_token`, and paste it into **Authorize**.

To change a setting, copy `.env.example` to `.env` and edit it. Local development needs no changes.

## Commands

| Command | What it does |
|---|---|
| `flask run` | Starts the development server on port 5000 |
| `pytest` | Runs the tests (`pytest --cov=app` adds a coverage report) |
| `ruff check .` and `ruff format .` | Lints and formats the code |
| `flask openapi write --format=yaml openapi.yaml` | Regenerates `openapi.yaml`, the Swagger (OpenAPI) document submitted with Milestones 3 and 4 |
| `flask routes` | Lists every URL the API serves |
| `flask db upgrade` | Brings the database up to the latest migration |
| `flask db migrate -m "what changed"` | Generates a migration after a model change. Review it, then commit it with the model |
| `flask create-user EMAIL --role ROLE` | Creates a verified account, such as the first IIC coordinator |

## How the code is organised

```text
backend/
  app/
    __init__.py     create_app(): configuration, extensions and module registration
    config.py       development, testing and production settings, read from environment variables
    extensions.py   SQLAlchemy, migrations, JWT, mail, CORS and the flask-smorest Api
    errors.py       the single JSON error format
    openapi.py      shared OpenAPI parts: error responses, login scheme, epics, stories() and errors()
    log.py          log format and one log line per request
    models.py       helpers shared by the modules' models (utcnow)
    modules.py      the list of module blueprints, in registration order
    system.py       GET /api/health
    auth/ ... audit/   one package per component (C1-C14), each served under /api/<module>
  migrations/       database migrations (Alembic, through Flask-Migrate)
  tests/            pytest suite; conftest.py has make_user and login_as for protected endpoints
  openapi.yaml      the generated API document (kept in step with the code by a test)
```

Each module package grows four files as its stories are built:

- `routes.py`: HTTP only. It reads the request, calls a service and returns the result.
- `schemas.py`: marshmallow schemas that validate requests and shape responses. They also produce the OpenAPI document.
- `services.py`: the business rules. pytest tests them without going through HTTP.
- `models.py`: SQLAlchemy tables for the module.

## Login and access control

There are four roles: `student`, `mentor`, `iic` (IIC coordinator) and `leadership`. `POST /api/auth/login` returns an access token that lasts 8 hours and carries the user's roles; send it as `Authorization: Bearer <token>`. `POST /api/auth/logout` revokes it, and `GET /api/auth/me` returns the logged-in user.

Protect an endpoint with `@blp.auth(...)`. It refuses the request and also documents the rule in the YAML:

```python
@blp.auth()  # any logged-in user, otherwise 401
@blp.auth("iic")  # IIC coordinators only, otherwise 403
@blp.auth("student", "iic")  # either role
```

Roles decide what kind of user may call an endpoint. Ownership decides which records they may see: a student may open only their own problem. Check it inside the endpoint:

```python
from app.auth.access import get_current_user, require_owner_or

problem = services.get_problem(problem_id)
require_owner_or(problem.student.user_id, "iic")  # the owner, or IIC; otherwise 403
```

Every refusal uses the shared error format: 401 when the token is missing, invalid, expired or logged out, and 403 when the role or owner is wrong. In tests, `login_as("iic")` from `tests/conftest.py` returns the headers for a request as a new user with that role.

## Adding an endpoint

Every module's `routes.py` already has a blueprint, `blp`. An endpoint looks like this:

```python
@blp.route("/<int:problem_id>")
@blp.stories("US-05")  # the user stories it implements
@blp.auth("student", "iic")  # who may call it (adds 401 and 403)
@blp.errors(404)  # other errors it can return
@blp.response(200, ProblemSchema)  # the success response
def get_problem(problem_id):
    """Get one problem

    Returns the problem with its current status. Students see only their own problems.
    """
    return services.get_problem(problem_id)
```

- **`@blp.stories(...)` is required.** It puts `x-user-stories` on the endpoint in the YAML, which Milestones 3 and 4 grade, and a test fails if any endpoint leaves it out.
- **`@blp.auth(...)` comes before `@blp.arguments`,** so a missing login gets a 401 before the body is validated.
- **`@blp.errors(...)` lists the other errors the endpoint can return.** It uses the shared responses: 400, 401, 403, 404, 409, 422 and 500. Validation errors (422) are added automatically by `@blp.arguments`.
- **The docstring becomes the documentation.** Its first line is the endpoint's summary in Swagger UI, and the rest is its description.

After adding or changing an endpoint, regenerate the YAML and commit it with the code:

```bash
flask openapi write --format=yaml openapi.yaml
```

A test fails if `openapi.yaml` no longer matches the code. The shared parts of the document (the error format, the login scheme and the epic each module belongs to) are in `app/openapi.py`.

## Errors

Every error, including validation failures and unexpected server errors, comes back in one JSON shape:

```json
{
  "code": 422,
  "status": "Unprocessable Entity",
  "message": "Some fields are invalid.",
  "errors": {"json": {"description": ["Shorter than minimum length 30."]}}
}
```

`errors` appears only on validation failures. In routes and services, raise errors with `flask_smorest.abort(404, message="No problem with ID 12.")`. Unexpected exceptions are logged with their traceback and returned as a plain 500, without internal details.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `FLASK_CONFIG` | `development` | `development`, `testing` or `production` |
| `SECRET_KEY` | a development-only value | Signs tokens and links. Production refuses to start without its own value |
| `DATABASE_URL` | SQLite in `instance/mentoring.db` | Set to a PostgreSQL URL on the host |
| `CORS_ORIGINS` | `http://localhost:5173` | Frontend origins allowed to call the API |
| `MAIL_SUPPRESS_SEND` | `true` | Keep `true` until an email provider is chosen |

The full list is in `.env.example`.
