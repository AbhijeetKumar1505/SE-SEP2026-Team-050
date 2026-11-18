from ..auth.access import get_current_user
from ..openapi import ApiBlueprint
from . import services
from .schemas import TagCreateSchema, TagSchema, TagUpdateSchema

blp = ApiBlueprint(
    "settings",
    __name__,
    url_prefix="/api/settings",
    description=("C4 Settings and tags: Topic tags, approved email domains and timing windows (US-01, US-03, US-21)."),
)


@blp.route("/tags")
@blp.stories("US-03", "US-21")
@blp.auth()
@blp.response(200, TagSchema(many=True))
def list_tags():
    """List topic tags

    Every tag IIC has, with the number of problems using it. `active` is false once a tag is retired:
    retired tags stay here so past problems and insights keep their topics, but students cannot choose
    them for a new problem.
    """
    return services.list_tags()


@blp.route("/tags", methods=["POST"])
@blp.stories("US-21")
@blp.auth("iic")
@blp.errors(409, 422)
@blp.arguments(TagCreateSchema)
@blp.response(201, TagSchema)
def add_tag(values):
    """Add a topic tag

    Adds a tag to IIC's shared list. The name is unique, ignoring case, so a duplicate gets 409.
    """
    return services.add_tag(values["name"], values["group"], actor=get_current_user())


@blp.route("/tags/<int:tag_id>", methods=["PUT"])
@blp.stories("US-21")
@blp.auth("iic")
@blp.errors(404)
@blp.arguments(TagUpdateSchema)
@blp.response(200, TagSchema)
def update_tag(values, tag_id):
    """Retire or restore a topic tag

    IIC retires a tag instead of deleting it, so old problems keep their topics. Sending the same
    value again changes nothing.
    """
    return services.set_tag_active(tag_id, values["active"], actor=get_current_user())
