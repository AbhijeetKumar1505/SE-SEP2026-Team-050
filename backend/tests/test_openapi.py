"""SCRUM-73: the shared parts of the OpenAPI document, and the rules every endpoint must follow."""

from pathlib import Path

import pytest
import yaml

from app.extensions import api
from app.openapi import EPICS, ERROR_RESPONSES, STORY_ID, ApiBlueprint
from app.system import HealthSchema

YAML_FILE = Path(__file__).resolve().parent.parent / "openapi.yaml"
SHARED = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    410: "GONE",
    422: "UNPROCESSABLE_ENTITY",
    500: "INTERNAL_SERVER_ERROR",
}


@pytest.fixture
def spec(client):
    return client.get("/api/docs/openapi.json").get_json()


HTTP_METHODS = {"get", "put", "post", "delete", "options", "head", "patch", "trace"}


def operations(spec):
    for path, item in spec["paths"].items():
        for method, operation in item.items():
            if method in HTTP_METHODS:  # a path item can also hold shared "parameters"
                yield f"{method.upper()} {path}", operation


def test_info_servers_and_security_scheme(spec):
    assert spec["info"]["title"] == "IITM BS Mentoring API"
    assert "x-user-stories" in spec["info"]["description"]
    assert spec["servers"][0]["url"] == "http://127.0.0.1:5000"
    assert spec["components"]["securitySchemes"]["bearerAuth"] == {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "The access token returned by the login endpoint. It carries the user's role.",
    }


def test_error_schema_requires_code_status_and_message(spec):
    error = spec["components"]["schemas"]["Error"]
    assert set(error["required"]) == {"code", "status", "message"}
    assert set(error["properties"]) == {"code", "status", "message", "errors"}


def test_every_shared_error_response_is_listed_with_an_example(spec):
    assert set(SHARED) == set(ERROR_RESPONSES)
    for code, name in SHARED.items():
        response = spec["components"]["responses"][name]
        content = response["content"]["application/json"]
        assert content["schema"] == {"$ref": "#/components/schemas/Error"}
        assert content["example"]["code"] == code
        assert response["description"] == ERROR_RESPONSES[code]


def test_documented_404_matches_what_the_api_returns(spec, client):
    documented = spec["components"]["responses"]["NOT_FOUND"]["content"]["application/json"]["example"]
    assert client.get("/api/no-such-thing").get_json() == documented


def test_every_tag_belongs_to_exactly_one_epic(spec):
    grouped = [tag for group in spec["x-tagGroups"] for tag in group["tags"]]
    assert len(grouped) == len(set(grouped)), "a tag is in more than one epic"
    assert {tag["name"] for tag in spec["tags"]} == set(grouped)
    assert [group["name"] for group in spec["x-tagGroups"]] == list(EPICS)


def test_every_endpoint_names_its_user_stories(spec):
    for name, operation in operations(spec):
        if operation.get("tags") == ["system"]:
            continue
        stories = operation.get("x-user-stories")
        assert stories, f"{name} has no @blp.stories(...)"
        assert all(STORY_ID.match(story) for story in stories), f"{name}: {stories}"


def test_story_and_error_decorators_document_an_endpoint(app):
    demo = ApiBlueprint("demo", __name__, url_prefix="/api/demo", description="Test only")

    @demo.route("/<int:item_id>")
    @demo.stories("US-05", "US-16")
    @demo.errors(403, 404)
    @demo.response(200, HealthSchema)
    def get_item(item_id):
        """Get one item"""
        return {"status": "ok", "version": str(item_id)}

    api.register_blueprint(demo)
    operation = api.spec.to_dict()["paths"]["/api/demo/{item_id}"]["get"]
    assert operation["x-user-stories"] == ["US-05", "US-16"]
    assert operation["responses"]["403"] == {"$ref": "#/components/responses/FORBIDDEN"}
    assert operation["responses"]["404"] == {"$ref": "#/components/responses/NOT_FOUND"}
    assert app.test_client().get("/api/demo/7").get_json() == {"status": "ok", "version": "7"}


@pytest.mark.parametrize("bad", [(), ("US-1",), ("us-01",), ("Story 3",)])
def test_stories_rejects_missing_or_malformed_ids(bad):
    with pytest.raises(ValueError):
        ApiBlueprint.stories(*bad)


def test_errors_rejects_a_code_without_a_shared_response():
    blp = ApiBlueprint("demo2", __name__)
    with pytest.raises(ValueError, match="418"):
        blp.errors(418)


def test_committed_openapi_yaml_is_up_to_date(spec):
    committed = yaml.safe_load(YAML_FILE.read_text(encoding="utf-8"))
    assert committed == spec, "openapi.yaml is out of date: run  flask openapi write --format=yaml openapi.yaml"
