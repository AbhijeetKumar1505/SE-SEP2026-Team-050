from ..openapi import ApiBlueprint
from . import services
from .access import get_current_user
from .schemas import (
    EmailSchema,
    LoginSchema,
    SignUpResultSchema,
    SignUpSchema,
    TokenSchema,
    UserSchema,
    VerifyEmailSchema,
)
from .tokens import issue_token, revoke_current_token

blp = ApiBlueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
    description=(
        "C1 Identity and access: Sign-up, email verification, mentor activation, login and roles (US-01, US-14)."
    ),
)


def _logged_in(user):
    token, expires_in = issue_token(user)
    return {"access_token": token, "token_type": "Bearer", "expires_in": expires_in, "user": user}


@blp.route("/signup", methods=["POST"])
@blp.stories("US-01")
@blp.errors(403, 409)
@blp.arguments(SignUpSchema)
@blp.response(201, SignUpResultSchema)
def sign_up(values):
    """Sign up as a student

    Creates a student account and emails a verification link that works for 24 hours. Nobody can
    log in until the link is used. The student's name comes from IIC's roster.

    - **422** "Use your IITM BS institute email." when the email is not on an approved domain, and
      a similar message when it is not the email IIC registered for the roll number. Nothing is
      stored.
    - **403** "You are not registered with IIC. Please contact IIC to register." when the roll
      number is not on the roster, or IIC has removed it.
    - **409** when a verified account already exists for the roll number or the email.

    Signing up again before verifying sets the new password and sends a new link; older links stop
    working.
    """
    user = services.sign_up(values["email"], values["roll_number"], values["password"])
    return {"email": user.email, "link_valid_hours": services.VERIFICATION_HOURS}


@blp.route("/verify-email", methods=["POST"])
@blp.stories("US-01")
@blp.errors(404, 409, 410)
@blp.arguments(VerifyEmailSchema)
@blp.response(200, TokenSchema)
def verify_email(values):
    """Verify an email address

    Uses the token from the link in the sign-up email. The account becomes active and the student
    is logged in, so the web app can take them straight to their profile (US-02).

    - **404** when the token is unknown, or a newer link has replaced it.
    - **409** when the link has already been used. Log in instead.
    - **410** when the link is more than 24 hours old. Ask for a new one.
    """
    return _logged_in(services.verify_email(values["token"]))


@blp.route("/resend-verification", methods=["POST"])
@blp.stories("US-01")
@blp.arguments(EmailSchema)
@blp.response(204)
def resend_verification(values):
    """Send a new verification link

    Emails a new link if a student signed up with this email and has not verified it yet; older
    links stop working. The response is the same whether or not an account exists, so it does not
    reveal who has signed up.
    """
    services.resend_verification(values["email"])


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
    return _logged_in(services.authenticate(credentials["email"], credentials["password"]))


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

    Returns the account behind the token, with its roles and the name and roll number from the
    student or mentor profile. The frontend uses it to choose which pages to show and to greet
    the user.
    """
    return get_current_user()
