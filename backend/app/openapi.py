"""The shared parts of the OpenAPI (Swagger) document (SCRUM-73).

flask-smorest builds the document from the code. This module adds what every endpoint shares:

- the document's info, servers and the epic each tag belongs to (SPEC_OPTIONS);
- one error schema and a named response for each error the API returns (ERROR_RESPONSES);
- the bearer-token security scheme used once login exists (SCRUM-71);
- ApiBlueprint, whose stories() and errors() decorators every endpoint uses:

      @blp.route("/<int:problem_id>")
      @blp.stories("US-05")
      @blp.errors(403, 404)
      @blp.response(200, ProblemSchema)
      def get_problem(problem_id): ...

The Milestone 3 and 4 YAML is written with: flask openapi write --format=yaml openapi.yaml
"""

import http
import re

from flask_smorest import Api, Blueprint, Page
from flask_smorest.utils import prepare_response
from marshmallow import Schema, fields

from .errors import DEFAULT_MESSAGES, error_payload

STORY_ID = re.compile(r"^US-\d{2}$")

# The errors this API returns, with what each means for a client. Each is a shared response named
# after its HTTP status (NOT_FOUND, ...), always listed in the document, with an example body.
ERROR_RESPONSES = {
    400: "The request body is not valid JSON.",
    401: "Not logged in, or the login token has expired.",
    403: "Not allowed for this user, for example the wrong role, someone else's record, or (at sign-up) a roll "
    "number that is not on IIC's roster.",
    404: "No such resource, or it is not visible to this user.",
    409: "The request conflicts with the current state, for example a duplicate or a status that does not allow it.",
    410: "The link has expired. Ask for a new one.",
    422: "One or more fields are invalid. `errors` names each field and what is wrong with it.",
    500: "Unexpected server error. It is logged; the response never includes its details.",
}

# Jira epics (SCRUM-7 to SCRUM-12) and the modules, shown as tags, that belong to each.
EPICS = {
    "Platform foundation": ["system", "settings", "notifications", "audit"],
    "Onboarding and profiles": ["auth", "students", "mentors"],
    "Mentor matching": ["problems", "matching", "mentorships"],
    "Mentorship tracking and feedback": ["sessions", "feedback", "monitoring"],
    "Changes, termination and safety": ["cases"],
    "Programme insights": ["insights"],
}

SPEC_OPTIONS = {
    "info": {
        "description": (
            "REST API of the Student Mentoring and Career Support Platform (IITM BS Software Engineering "
            "project, September 2026, Team 050).\n\n"
            "Every endpoint lists the user stories it implements in `x-user-stories`, and every error uses "
            "the shared `Error` schema. Endpoints that need a login take a bearer token in the "
            "`Authorization` header."
        ),
        "contact": {"name": "Team 050, IITM BS Software Engineering"},
    },
    "servers": [{"url": "http://127.0.0.1:5000", "description": "Local development server (flask run)"}],
    # Groups the module tags by Jira epic in tools that support it (Redoc); other viewers ignore it.
    "x-tagGroups": [{"name": epic, "tags": tags} for epic, tags in EPICS.items()],
}

SECURITY_SCHEME = {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
    "description": "The access token returned by the login endpoint. It carries the user's role.",
}


class ErrorSchema(Schema):
    """The body of every error response (see app/errors.py)."""

    code = fields.Integer(required=True, metadata={"description": "HTTP status code", "example": 404})
    status = fields.String(required=True, metadata={"description": "HTTP status name", "example": "Not Found"})
    message = fields.String(required=True, metadata={"description": "What went wrong, in plain words"})
    errors = fields.Dict(metadata={"description": "Validation errors by location and field (422 only)"})


def error_example(code: int) -> dict:
    status = http.HTTPStatus(code)
    example = {"code": code, "status": status.phrase, "message": DEFAULT_MESSAGES.get(code, status.phrase)}
    if code == 422:
        example["errors"] = {"json": {"description": ["Shorter than minimum length 30."]}}
    return example


class MentoringApi(Api):
    """flask-smorest Api with the shared error format and error responses."""

    ERROR_SCHEMA = ErrorSchema

    def handle_http_exception(self, error):
        return error_payload(error)

    def _register_responses(self):
        # Same as flask-smorest's version, but the errors in ERROR_RESPONSES get a clear description and
        # an example, and are always listed. Others are added only when an endpoint uses them.
        for status in http.HTTPStatus:
            shared = status.value in ERROR_RESPONSES
            response = {"description": ERROR_RESPONSES.get(status.value, status.phrase)}
            if not (100 <= status < 200) and status not in (204, 304):
                response["schema"] = self.ERROR_SCHEMA
            if shared:
                response["example"] = error_example(status.value)
            prepare_response(response, self.spec, self.DEFAULT_RESPONSE_CONTENT_TYPE)
            self.spec.components.response(status.name, response, lazy=not shared)

        response = {"description": "Any other error, in the shared error format.", "schema": self.ERROR_SCHEMA}
        prepare_response(response, self.spec, self.DEFAULT_RESPONSE_CONTENT_TYPE)
        self.spec.components.response(self.DEFAULT_ERROR_RESPONSE_NAME, response, lazy=True)

    def init_app(self, app, *, spec_kwargs=None):
        super().init_app(app, spec_kwargs=spec_kwargs)
        self.spec.components.security_scheme("bearerAuth", SECURITY_SCHEME)


class QueryPage(Page):
    """Pager for list endpoints that return a SQLAlchemy query. It counts and fetches only one page.

        @blp.response(200, ItemSchema(many=True))
        @blp.paginate(QueryPage, page_size=20, max_page_size=100)
        def list_items():
            return db.session.query(Item).order_by(Item.id)

    Clients choose the page with ?page=2&page_size=20. The X-Pagination response header gives the
    total, the page count and the neighbouring pages.
    """

    @property
    def item_count(self):
        return self.collection.order_by(None).count()


class ApiBlueprint(Blueprint):
    """Blueprint with the decorators every endpoint uses: stories(), auth() and errors()."""

    def auth(self, *roles: str):
        """Require a logged-in user (401), with one of the roles if any are given (403). Also documents it.

        @blp.auth() allows any logged-in user; @blp.auth("iic") allows IIC coordinators only. The roles
        are listed in the YAML as x-roles. See app/auth/access.py for ownership checks.
        """
        from .auth.access import check_roles, require  # here, not at the top: auth imports this module

        roles = check_roles(roles)
        doc = {"security": [{"bearerAuth": []}]}
        if roles:
            doc["x-roles"] = list(roles)

        def decorator(func):
            func = require(*roles)(func)
            func = Blueprint.doc(**doc)(func)
            func = self.alt_response(401, response="UNAUTHORIZED")(func)
            if roles:
                func = self.alt_response(403, response="FORBIDDEN")(func)
            return func

        return decorator

    @staticmethod
    def stories(*story_ids: str):
        """Record the user stories an endpoint implements (x-user-stories in the YAML, graded in M3 and M4)."""
        if not story_ids:
            raise ValueError("Name at least one user story, for example stories('US-01').")
        for story in story_ids:
            if not STORY_ID.match(story):
                raise ValueError(f"{story!r} is not a user story ID like 'US-01'.")
        return Blueprint.doc(**{"x-user-stories": list(story_ids)})

    def errors(self, *codes: int):
        """Document the error responses an endpoint can return, using the shared responses."""
        unknown = [code for code in codes if code not in ERROR_RESPONSES]
        if unknown:
            raise ValueError(f"No shared error response for {unknown}; add it to ERROR_RESPONSES first.")

        def decorator(func):
            for code in codes:
                func = self.alt_response(code, response=http.HTTPStatus(code).name)(func)
            return func

        return decorator
