"""Tests verifying the per-role auth fixtures and test client helpers (SCRUM-74)."""


def test_per_role_user_fixtures_have_correct_roles(student_user, mentor_user, iic_user, leadership_user):
    """Verify each per-role user fixture carries its designated role."""
    assert "student" in student_user.role_names
    assert "mentor" in mentor_user.role_names
    assert "iic" in iic_user.role_names
    assert "leadership" in leadership_user.role_names


def test_per_role_auth_headers_contain_valid_bearer_token(
    auth_headers_student, auth_headers_mentor, auth_headers_iic, auth_headers_leadership
):
    """Verify auth header fixtures produce valid Bearer Authorization headers."""
    for headers in (auth_headers_student, auth_headers_mentor, auth_headers_iic, auth_headers_leadership):
        assert "Authorization" in headers
        assert headers["Authorization"].startswith("Bearer ")
        token = headers["Authorization"].split()[1]
        assert len(token) > 20


def test_authenticated_clients_can_access_protected_whoami(
    student_client, mentor_client, iic_client, leadership_client
):
    """Verify pre-authenticated role clients can access /api/auth/whoami."""
    # student
    res = student_client.get("/api/auth/whoami")
    assert res.status_code == 200
    assert "student" in res.json["roles"]

    # mentor
    res = mentor_client.get("/api/auth/whoami")
    assert res.status_code == 200
    assert "mentor" in res.json["roles"]

    # iic
    res = iic_client.get("/api/auth/whoami")
    assert res.status_code == 200
    assert "iic" in res.json["roles"]

    # leadership
    res = leadership_client.get("/api/auth/whoami")
    assert res.status_code == 200
    assert "leadership" in res.json["roles"]


def test_unauthenticated_client_is_rejected_on_protected_endpoints(client):
    """Verify unauthenticated client gets 401 on protected routes."""
    res = client.get("/api/auth/whoami")
    assert res.status_code == 401
