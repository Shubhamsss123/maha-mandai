from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.db.session import engine
from app.main import app
from app.models.entities import User


client = TestClient(app)


def _login(mobile: str) -> str:
    verify = client.post("/api/v1/auth/login", json={"mobile_number": mobile})
    token = verify.json()["access_token"]

    with Session(engine) as session:
        user = session.exec(select(User).where(User.mobile_number == f"91{mobile}")).first()
        if user:
            user.is_verified = True
            session.add(user)
            session.commit()

    return token


def test_checkout_blocked_for_unserviceable_pincode() -> None:
    token = _login("9998887776")
    headers = {"Authorization": f"Bearer {token}"}

    address = client.post(
        "/api/v1/addresses",
        headers=headers,
        json={
            "full_name": "Test User",
            "phone": "9998887776",
            "house": "A-12",
            "street": "Market Road",
            "landmark": "Near Temple",
            "area": "Baramati",
            "city": "Baramati",
            "state": "Maharashtra",
            "pincode": "000000",
            "is_default": True,
        },
    )
    assert address.status_code == 200

    checkout = client.post(
        "/api/v1/orders/checkout",
        headers=headers,
        json={"address_id": address.json()["id"], "payment_method": "cod"},
    )
    assert checkout.status_code == 400
    assert checkout.json()["detail"] == "Sorry, we currently do not deliver to your location."
