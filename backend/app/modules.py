"""The API modules (components C1-C14 of the Milestone 2 design), in the order they are registered."""

from .audit.routes import blp as audit_blp
from .auth.routes import blp as auth_blp
from .cases.routes import blp as cases_blp
from .feedback.routes import blp as feedback_blp
from .insights.routes import blp as insights_blp
from .matching.routes import blp as matching_blp
from .mentors.routes import blp as mentors_blp
from .mentorships.routes import blp as mentorships_blp
from .monitoring.routes import blp as monitoring_blp
from .notifications.routes import blp as notifications_blp
from .problems.routes import blp as problems_blp
from .sessions.routes import blp as sessions_blp
from .settings.routes import blp as settings_blp
from .students.routes import blp as students_blp
from .system import blp as system_blp

BLUEPRINTS = [
    system_blp,
    auth_blp,
    students_blp,
    mentors_blp,
    settings_blp,
    problems_blp,
    matching_blp,
    mentorships_blp,
    cases_blp,
    sessions_blp,
    feedback_blp,
    monitoring_blp,
    insights_blp,
    notifications_blp,
    audit_blp,
]
