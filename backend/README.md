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
| `flask seed-data` | Fills the database with sample users, mentors, problems, mentorships and IIC's roster. Safe to run again |

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

There are four roles: `student`, `mentor`, `iic` (IIC coordinator) and `leadership`. `POST /api/auth/login` returns an access token that lasts 8 hours and carries the user's roles; send it as `Authorization: Bearer <token>`. `POST /api/auth/logout` revokes it, and `GET /api/auth/me` returns the logged-in user with their roles, name and (for students) roll number.

### Student sign-up (US-01)

Students create their own accounts. Mentors are activated by IIC instead (US-14).

1. **`POST /api/auth/signup`** with `email`, `roll_number` and `password` (at least 8 characters). The checks run in this order, and a refusal stores nothing:
   - the email must be on an approved domain in `email_domain` (422 "Use your IITM BS institute email.");
   - the roll number must be on IIC's roster, `roster_entry`, and not removed (403 "You are not registered with IIC. Please contact IIC to register.");
   - the email must be the one IIC registered for that roll number (422);
   - no verified account may exist for the roll number or the email (409 "... Log in instead.").

   On success the account is created unverified, and the student's name comes from the roster. A link that works for 24 hours is emailed to the student. Signing up again before verifying sets the new password and sends a new link.
2. **`POST /api/auth/verify-email`** with the `token` from the link. This activates the account and returns a login token, like `POST /api/auth/login`. An unknown or replaced link gets 404, a used one 409, and an expired one 410.
3. **`POST /api/auth/resend-verification`** with `email` sends a new link. It always answers 204, so it doesn't reveal who has signed up.

Only a SHA-256 hash of each link's token is stored. In development the email, with its link, is written to the Flask log. `flask seed-data` puts three students on the roster who haven't signed up yet, to try it with: `23F1002345`, `23F1002346` and `24F1000101`, each with the email `<roll number>@ds.study.iitm.ac.in`.

### IIC's roster (US-15)

Only students on IIC's roster can sign up or submit a problem. IIC keeps the roster up to date with these endpoints, which are all for IIC only:

| Endpoint | What it does |
|---|---|
| `GET /api/students/roster` | Lists the students, each with whether they have signed up and completed their profile, plus the result of the last import |
| `POST /api/students/roster/import` | Imports CSV rows. The template's columns are `name`, `roll number` and `institute email`; the web app sends them as `name`, `roll_number` and `institute_email`. Valid rows are saved, and a roll number already on the roster is updated instead of duplicated. Invalid rows come back in `errors`, each with its CSV row number (the header is row 1) and the reason |
| `POST /api/students/roster` | Adds one student, with the same checks as the import |
| `POST /api/students/roster/<id>/remove` | Removes a student, with a reason. Their sign-up and new problems are refused with "You are not registered with IIC". An account and mentorship they already have carry on |

Each import, addition and removal is recorded in the audit log. In tests, the `sample_student` fixture is on the roster; a student you create yourself needs a `RosterEntry` to submit a problem.

### IIC's mentor pool (US-14)

Mentors don't sign up. IIC adds them, verifies them, and the platform emails each one an activation link. A mentor moves through these statuses:

```text
pending_verification --IIC verifies--> verified --mentor uses the link--> active   (or removed)
```

| Endpoint | Who | What it does |
|---|---|---|
| `GET /api/mentors` | IIC | Lists every mentor with their status, expertise, availability and load |
| `POST /api/mentors` | IIC | Adds one mentor as *Pending verification* |
| `POST /api/mentors/import` | IIC | Imports CSV rows: `name`, `email`, `expertise tags` and `experience`, with several values separated by semicolons. A known email is updated, not duplicated. Invalid rows come back with their row number and reason |
| `POST /api/mentors/<id>/verify` | IIC | Sets the expertise tags, records who verified the mentor and when, and emails an activation link that works for 7 days |
| `POST /api/mentors/<id>/resend-activation` | IIC | Sends a new link; older ones stop working |
| `POST /api/mentors/<id>/capacity-requests` | IIC | Asks an active, available mentor to take one more student, for example one at capacity (US-18). The mentor is notified and answers with `POST /api/mentors/capacity-requests/<id>/answer`. Their capacity rises by one only if they accept. One request at a time |
| `GET /api/mentors/activation/<token>` | anyone | Checks a link (404 unknown or replaced, 410 used or expired) |
| `POST /api/mentors/activation/<token>` | anyone | Sets the mentor's password and activates the account, then logs them in |

Only mentors who are active, have activated their account and have said they are available can be recommended or assigned. Recommendations (US-04) and assignment (US-16) must start from `mentors.services.assignable_mentors()`. Sign-up and activation links share the `email_verification` table, with a `purpose` that keeps one from working as the other. `flask seed-data` adds Kavya Iyer (`kavya.iyer@example.com`) as a pending mentor, to try verification and activation.

### Recommended mentors (US-04)

IIC sees up to four mentors for each problem that is still waiting for one: `GET /api/matching/problems/<id>/recommendations`. The rule is fixed, with no machine learning:

1. **Who is considered:** only mentors from `assignable_mentors()` (active, activated and available) who are below their capacity. A mentor's load counts their pending and active mentorships.
2. **Who is recommended:** mentors who share at least one topic tag with the problem.
3. **The order:** most shared tags, then fewest mentees, then the lowest mentor ID.

Each mentor comes back with `shared_tags`, their availability, and their `load` against `capacity`. When nobody shares a tag, the list is empty. `GET /api/matching/problems/<id>/eligible-mentors` lists every mentor who could take the problem, in the same order, so IIC can look further. Both endpoints are IIC only, and they return 409 for a problem that is assigned, closed or withdrawn. Recommendations are worked out on each request; the `recommendation` table from the Milestone 2 design isn't used.

### IIC's problem queue and assignment (US-16)

All IIC only:

| Endpoint | What it does |
|---|---|
| `GET /api/problems/queue` | Problems waiting for IIC: *Reassignment needed* first, then the oldest first |
| `GET /api/problems/<id>` | The problem with the student's profile. Opening a *Submitted* problem moves it to *Under review* |
| `POST /api/problems/<id>/assign` | Takes `{mentor_id}` and creates a pending mentorship. The problem moves to *Awaiting mentor*, the mentor has the response window (72 hours by default) to accept, and both sides are notified |
| `POST /api/problems/<id>/close` | Takes `{reason}` and closes a problem without a mentor. The reason is required and sent to the student |

Assigning returns 409 in these cases: the problem isn't waiting for a mentor; the student already has a mentor or a pending assignment; the mentor isn't in `assignable_mentors()`; or the mentor is at capacity. Each mentorship records who assigned it (`assigned_by_user_id`).

### Protecting endpoints

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

### List endpoints

An endpoint that returns a list pages through it with `QueryPage` from `app/openapi.py`. The view returns a SQLAlchemy query, and only the requested page is fetched:

```python
@blp.route("")
@blp.stories("US-16")
@blp.auth("iic")
@blp.response(200, ProblemSchema(many=True))
@blp.paginate(QueryPage, page_size=20, max_page_size=100)
def list_queue():
    """List the problem queue"""
    return services.queue()  # a query, already ordered
```

Clients choose the page with `?page=2&page_size=20`. The `X-Pagination` response header gives the total and the page count.

## Recording actions and notifying people

Most stories have to keep a record of a decision (C14) and tell someone about it (C13). Both helpers join the change you are making, so call them before you commit:

```python
from app.audit import services as audit
from app.notifications import services as notifications

mentorship.status = "active"
audit.record("accept_assignment", "mentorship", mentorship.id, actor=get_current_user(), details="Accepted.")
notifications.notify(student.user, "acceptance_notice", link="/student", student_name=..., mentor_name=...)
db.session.commit()
```

- **`audit.record(action, entity_type, entity_id, actor=..., details=...)`** adds an entry to the audit log.
  - `action` and `entity_type` are snake_case names, such as `verify_mentor` and `mentor`.
  - `actor` must always be given: the logged-in user, or `None` for automatic actions such as the daily checks.
  - Entries are never edited or deleted, and the code refuses to do either.
  - IIC reads them with `GET /api/audit`. Add `?entity_type=mentor&entity_id=3` for one record's history.
- **`notifications.notify(user, template_key, link=..., **values)`** gives the user a dashboard notice and an email.
  - The email is sent only after the commit, so a change that fails never emails anyone. If the mail server refuses it, the notice is marked `failed` and the change still stands.
  - `link` is the page in the web app the notice opens, such as `/student`. The email links to it through `FRONTEND_URL`.
  - Each event has one template in `app/notifications/templates.py`. Add yours there with your story. A missing placeholder value is an error.
  - Users read their notices with `GET /api/notifications` (`?unread=true` for the bell) and mark them read with `POST /api/notifications/<id>/read` or `POST /api/notifications/read-all`.
- **`notifications.send_email(address, template_key, link=..., **values)`** sends only an email, with no dashboard notice. Use it for links sent before someone can log in, such as the sign-up verification link. Like `notify()`, it waits for the commit. The link isn't stored, and a refused email is only logged.
- **Never put conversation content** in an audit entry or a notification.

In development, emails are written to the log instead of being sent. In tests, check them with `mail.record_messages()`; see `tests/test_notifications.py`.

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
| `FRONTEND_URL` | `http://localhost:5173` | Where the web app runs, for the links in emails |
| `MAIL_SUPPRESS_SEND` | `true` | Keep `true` until an email provider is chosen |

The full list is in `.env.example`.
