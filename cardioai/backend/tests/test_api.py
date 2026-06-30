import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data
    assert "db_connected" in data


@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "CardioAI Hospital System"


@pytest.mark.asyncio
async def test_guest_predict(client):
    payload = {
        "patient_name": "Test Patient",
        "age": 55,
        "gender": 2,
        "height": 170,
        "weight": 80.0,
        "ap_hi": 140,
        "ap_lo": 90,
        "cholesterol": 2,
        "gluc": 1,
        "smoke": 0,
        "alco": 0,
        "active": 1,
    }
    response = await client.post("/api/v1/predictions/predict/guest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_probability" in data
    assert data["risk_level"] in ("Low", "Moderate", "High")


@pytest.mark.asyncio
async def test_register_and_login(client):
    import uuid
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    reg = await client.post("/api/v1/auth/register", json={
        "name": "Test Doctor",
        "email": email,
        "password": "securepass123",
    })
    assert reg.status_code == 201

    login = await client.post("/api/v1/auth/login", data={
        "username": email,
        "password": "securepass123",
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert token

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == email
