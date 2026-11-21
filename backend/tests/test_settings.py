"""US-03/US-21: IIC's shared topic tag list (C4)."""

from app.extensions import db
from app.settings.models import TopicTag

TAGS = "/api/settings/tags"


def test_any_logged_in_user_can_list_the_tags(student_client):
    response = student_client.get(TAGS)
    assert response.status_code == 200
    tags = response.get_json()
    assert len(tags) >= 30
    assert {"id", "name", "group", "problems", "active"} == set(tags[0])
    python = next(tag for tag in tags if tag["name"] == "Python programming")
    assert python["group"] == "Technical skills"
    assert python["problems"] == 0
    assert python["active"] is True


def test_the_tag_list_needs_a_login(client):
    assert client.get(TAGS).status_code == 401


def test_iic_adds_a_tag(iic_client):
    response = iic_client.post(TAGS, json={"name": "  Robotics  ", "group": "Technical skills"})
    assert response.status_code == 201
    body = response.get_json()
    assert body["name"] == "Robotics"
    assert body["group"] == "Technical skills"
    assert body["problems"] == 0
    assert body["active"] is True
    assert db.session.query(TopicTag).filter_by(name="Robotics").one()


def test_a_tag_name_is_unique_ignoring_case(iic_client):
    response = iic_client.post(TAGS, json={"name": "python PROGRAMMING", "group": "Technical skills"})
    assert response.status_code == 409
    assert response.get_json()["message"] == "The topic tag 'python PROGRAMMING' already exists."


def test_only_iic_adds_tags(student_client, mentor_client):
    assert student_client.post(TAGS, json={"name": "Robotics", "group": "Technical skills"}).status_code == 403
    assert mentor_client.post(TAGS, json={"name": "Robotics", "group": "Technical skills"}).status_code == 403


def test_a_new_tag_validates_its_fields(iic_client):
    response = iic_client.post(TAGS, json={"name": "x", "group": ""})
    assert response.status_code == 422
    assert set(response.get_json()["errors"]["json"]) >= {"name", "group"}


def test_iic_retires_and_restores_a_tag(iic_client):
    tag = TopicTag(name="Old topic", category="Technical skills")
    db.session.add(tag)
    db.session.commit()

    retired = iic_client.put(f"{TAGS}/{tag.id}", json={"active": False})
    assert retired.status_code == 200
    assert retired.get_json()["active"] is False

    restored = iic_client.put(f"{TAGS}/{tag.id}", json={"active": True})
    assert restored.status_code == 200
    assert restored.get_json()["active"] is True


def test_retiring_the_same_state_twice_changes_nothing(iic_client):
    tag = TopicTag(name="Old topic", category="Technical skills")
    db.session.add(tag)
    db.session.commit()
    assert iic_client.put(f"{TAGS}/{tag.id}", json={"active": True}).get_json()["active"] is True
    assert iic_client.put(f"{TAGS}/{tag.id}", json={"active": False}).get_json()["active"] is False
    assert iic_client.put(f"{TAGS}/{tag.id}", json={"active": False}).get_json()["active"] is False


def test_a_retired_tag_cannot_be_used_for_a_new_problem(student_client, sample_student):
    topic = TopicTag(name="Old topic", category="Technical skills", retired=True)
    db.session.add(topic)
    db.session.commit()
    response = student_client.post(
        "/api/problems",
        json={
            "description": "I need help with a course project in my current term.",
            "tags": ["Old topic"],
            "desired_outcome": "A clear plan.",
        },
    )
    assert response.status_code == 422
    assert "Topic tag 'Old topic' is retired." in response.get_json()["errors"]["json"]["tags"]


def test_an_unknown_tag_gets_404(iic_client):
    assert iic_client.put(f"{TAGS}/9999", json={"active": False}).status_code == 404


def test_only_iic_retires_tags(student_client):
    response = student_client.put(f"{TAGS}/1", json={"active": False})
    assert response.status_code == 403
