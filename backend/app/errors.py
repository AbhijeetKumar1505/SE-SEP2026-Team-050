"""One JSON shape for every error the API returns.

    {
      "code": 404,
      "status": "Not Found",
      "message": "No problem with ID 12.",
      "errors": {"json": {"description": ["Shorter than minimum length 30."]}}
    }

"errors" is present only for validation failures (422). Raise errors in routes and services
with flask_smorest.abort(code, message="..."), never by returning a hand-built response.
"""

from http import HTTPStatus

from werkzeug.exceptions import HTTPException

# Clearer defaults than Werkzeug's for the codes the API returns most.
DEFAULT_MESSAGES = {
    400: "The request could not be read.",
    401: "Log in to continue.",
    403: "You do not have permission to do this.",
    404: "The requested resource was not found.",
    405: "This method is not allowed on this URL.",
    409: "This conflicts with the current state of the resource.",
    422: "Some fields are invalid.",
    500: "Something went wrong on the server. Please try again.",
}


def error_payload(error: HTTPException):
    """Build the JSON response for an HTTP error.

    flask-smorest calls this for every HTTPException, including the 500 that Flask raises for an
    unhandled exception. Flask logs that exception first; the response never includes its details.
    """
    data = getattr(error, "data", None) or {}
    payload = {
        "code": error.code,
        "status": error.name,
        "message": data.get("message") or DEFAULT_MESSAGES.get(error.code) or error.description,
    }
    # abort(..., errors=...) passes "errors"; request validation (webargs) passes "messages".
    errors = data.get("errors") or data.get("messages")
    if errors:
        payload["errors"] = errors
    headers = data.get("headers", {})
    return payload, error.code, headers


def error_response(code: int, message: str):
    """The same JSON error as a return value, for callbacks that cannot raise (such as JWT checks)."""
    return {"code": code, "status": HTTPStatus(code).phrase, "message": message}, code
