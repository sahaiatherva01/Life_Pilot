import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_lifecycle(client: AsyncClient):
    # 1. Register user
    reg_payload = {
        "email": "user@example.com",
        "password": "StrongPassword123!",
        "full_name": "Test User",
        "timezone": "Asia/Kolkata",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "user" in reg_data
    assert reg_data["user"]["email"] == "user@example.com"
    assert "token" in reg_data
    token = reg_data["token"]["access_token"]
    assert token

    # 2. Duplicate registration fails with 409
    dup_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409

    # 3. Login with invalid password fails with 401
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401

    # 4. Login with correct password succeeds
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "StrongPassword123!"},
    )
    assert login_res.status_code == 200
    login_token = login_res.json()["access_token"]

    # 5. Access /me with token
    headers = {"Authorization": f"Bearer {login_token}"}
    me_res = await client.get("/api/v1/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "user@example.com"

    # 6. Access /me without token fails with 401
    no_auth_res = await client.get("/api/v1/me")
    assert no_auth_res.status_code == 401

    # 7. Update profile
    update_res = await client.patch(
        "/api/v1/me",
        headers=headers,
        json={"full_name": "Updated Name", "morning_briefing_time": "06:30"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["full_name"] == "Updated Name"
    assert update_res.json()["morning_briefing_time"] == "06:30"

    # 8. Check audit logs
    audit_res = await client.get("/api/v1/audit", headers=headers)
    assert audit_res.status_code == 200
    actions = [log["action"] for log in audit_res.json()]
    assert "auth.register" in actions
    assert "auth.login" in actions
    assert "user.update_profile" in actions
