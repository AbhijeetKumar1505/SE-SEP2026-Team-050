"""flask create-user: make an account from the command line.

The first IIC coordinator and the leadership accounts are created this way, because only students
sign themselves up (US-01) and mentors are added by IIC (US-14). It is also handy in development:

    flask create-user deepa@iitm.ac.in --role iic
"""

import click

from . import services
from .models import ROLES


@click.command("create-user")
@click.argument("email")
@click.option("--role", "roles", multiple=True, required=True, type=click.Choice(ROLES), help="Repeat for more roles.")
@click.password_option(help="Asked for if not given (typed twice, not shown).")
def create_user_command(email, roles, password):
    """Create a verified account that can log in straight away."""
    try:
        user = services.create_user(email, password=password, roles=roles, verified=True)
    except ValueError as error:  # duplicate email, short password
        raise click.ClickException(str(error)) from error
    click.echo(f"Created user {user.id}: {user.email} ({', '.join(user.role_names)})")
