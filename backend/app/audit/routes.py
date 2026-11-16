from ..auth.models import IIC
from ..openapi import ApiBlueprint, QueryPage
from . import services
from .schemas import AuditEntrySchema, AuditQuerySchema

blp = ApiBlueprint(
    "audit",
    __name__,
    url_prefix="/api/audit",
    description="C14 Audit log: Permanent record of decisions and status changes (US-14, US-18).",
)


@blp.route("")
@blp.stories("US-14", "US-18")
@blp.auth(IIC)
@blp.arguments(AuditQuerySchema, location="query")
@blp.response(200, AuditEntrySchema(many=True))
@blp.paginate(QueryPage, page_size=20, max_page_size=100)
def list_entries(filters):
    """List audit entries

    Who did what, to which record, when and why, newest first. With `entity_type` and `entity_id`
    it is the history of one record, such as a case or a mentor. Only IIC coordinators can read the
    audit log, and nobody can change it.

    Paginated: `page` and `page_size` choose the page, and the `X-Pagination` header gives the
    total.
    """
    return services.entries(**filters)
