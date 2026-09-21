from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_refresh_and_logout_flow() -> None:
    mobile = "9011122233"

    verify = client.post("/api/v1/auth/login", json={"mobile_number": mobile})
    assert verify.status_code == 200
    refresh_token = verify.json()["refresh_token"]

    refresh = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh.status_code == 200
    new_refresh = refresh.json()["refresh_token"]
    assert new_refresh != refresh_token

    logout = client.post("/api/v1/auth/logout", json={"refresh_token": new_refresh})
    assert logout.status_code == 200

    refresh_again = client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh})
    assert refresh_again.status_code == 401
