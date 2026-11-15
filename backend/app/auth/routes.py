from ..openapi import ApiBlueprint
from . import services
from .access import get_current_user
from .schemas import LoginSchema, TokenSchema, UserSchema
from .tokens import issue_token, revoke_current_token

blp = ApiBlueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
    description=(
        "C1 Identity and access: Sign-up, email verification, mentor activation, login and roles (US-01, US-14)."
    ),
)


@blp.route("/login", methods=["POST"])
@blp.stories("US-01", "US-14")
@blp.errors(401, 403)
@blp.arguments(LoginSchema)
@blp.response(200, TokenSchema)
def login(credentials):
    """Log in

    Exchanges an email and password for an access token. Send the token on later requests in the
    `Authorization` header as `Bearer <token>`. The token carries the user's roles.

    Students can log in once they have verified their email (US-01), and mentors once they have
    activated their account (US-14). A wrong email and a wrong password give the same 401.
    """
    user = services.authenticate(credentials["email"], credentials["password"])
    token, expires_in = issue_token(user)
    return {"access_token": token, "token_type": "Bearer", "expires_in": expires_in, "user": user}


@blp.route("/logout", methods=["POST"])
@blp.stories("US-01", "US-14")
@blp.auth()
@blp.response(204)
def logout():
    """Log out

    Revokes the token sent with this request. Any later request with it gets 401.
    """
    revoke_current_token()


@blp.route("/me")
@blp.stories("US-01", "US-14")
@blp.auth()
@blp.response(200, UserSchema)
def me():
    """Get the logged-in user

    Returns the account behind the token, with its roles. The frontend uses it to choose which
    pages to show.
    """
    return get_current_user()
