from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_login_creates_and_reuses_user() -> None:
    mobile = "9876543210"

    first = client.post("/api/v1/auth/login", json={"mobile_number": mobile})
    assert first.status_code == 200
    body = first.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["is_new_user"] is True

    second = client.post("/api/v1/auth/login", json={"mobile_number": mobile})
    assert second.status_code == 200
    assert second.json()["is_new_user"] is False
