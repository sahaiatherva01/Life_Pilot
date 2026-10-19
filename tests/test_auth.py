import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "LifePilot"


@pytest.mark.asyncio
async def test_login_success_with_default_pin(client: AsyncClient):
    response = await client.post("/api/auth/login", json={"pin": "1234"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_pin(client: AsyncClient):
    response = await client.post("/api/auth/login", json={"pin": "9999"})
    assert response.status_code == 401
    assert "Incorrect Master PIN" in response.json()["detail"]


@pytest.mark.asyncio
async def test_verify_token(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/auth/verify", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "authenticated"
