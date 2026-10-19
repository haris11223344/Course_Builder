import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        reg_data = {
            "email": "tester_forge@example.com",
            "password": "StrongPassword123!",
            "full_name": "Test Architect"
        }
        res_reg = await ac.post("/api/v1/auth/register", json=reg_data)
        assert res_reg.status_code in (200, 400) # 200 or 400 if already exists

        # Login
        login_data = {
            "email": "tester_forge@example.com",
            "password": "StrongPassword123!"
        }
        res_login = await ac.post("/api/v1/auth/login", json=login_data)
        assert res_login.status_code == 200
        data = res_login.json()
        assert "access_token" in data
        assert data["user"]["email"] == "tester_forge@example.com"
