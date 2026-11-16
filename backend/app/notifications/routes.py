from flask_smorest import abort

from ..auth.access import get_current_user
from ..openapi import ApiBlueprint, QueryPage
from . import services
from .schemas import NoticeQuerySchema, NotificationSchema

blp = ApiBlueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications",
    description="C13 Notifications: Email and dashboard notices for every event (Most stories).",
)


@blp.route("")
@blp.stories("US-05", "US-09")
@blp.auth()
@blp.arguments(NoticeQuerySchema, location="query")
@blp.response(200, NotificationSchema(many=True))
@blp.paginate(QueryPage, page_size=20, max_page_size=100)
def list_notices(args):
    """List my notices

    The logged-in user's dashboard notices, newest first: assignments, status changes, acceptances,
    reminders and decisions. Each was also sent by email. With `unread=true` only unread notices
    are listed, and the `X-Pagination` header's `total` is the count for the bell.
    """
    return services.notices_for(get_current_user(), unread=args["unread"])


@blp.route("/<int:notification_id>/read", methods=["POST"])
@blp.stories("US-05", "US-09")
@blp.auth()
@blp.errors(404)
@blp.response(200, NotificationSchema)
def mark_read(notification_id):
    """Mark a notice as read

    Marking it again changes nothing. A notice is shown only to its recipient, so anyone else's
    gets 404.
    """
    notice = services.get_own_notice(get_current_user(), notification_id)
    if notice is None:
        abort(404, message=f"No notification with ID {notification_id}.")
    return services.mark_read(notice)


@blp.route("/read-all", methods=["POST"])
@blp.stories("US-05", "US-09")
@blp.auth()
@blp.response(204)
def mark_all_read():
    """Mark all my notices as read"""
    services.mark_all_read(get_current_user())
