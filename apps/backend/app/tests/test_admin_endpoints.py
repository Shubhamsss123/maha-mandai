from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.db.session import engine
from app.main import app
from app.models.entities import User, UserRole


client = TestClient(app)


def _admin_token(mobile: str) -> str:
    verify = client.post("/api/v1/auth/login", json={"mobile_number": mobile})
    token = verify.json()["access_token"]

    with Session(engine) as session:
        user = session.exec(select(User).where(User.mobile_number == f"91{mobile}")).first()
        if user:
            user.role = UserRole.ADMIN
            session.add(user)
            session.commit()

    return token


def test_admin_categories_and_pincode() -> None:
    token = _admin_token("9001112223")
    headers = {"Authorization": f"Bearer {token}"}

    create_category = client.post(
        "/api/v1/admin/categories",
        headers=headers,
        json={"name_en": "Leafy", "name_mr": "पालेभाज्या"},
    )
    assert create_category.status_code == 200

    add_pin = client.post("/api/v1/admin/pincodes/413999", headers=headers)
    assert add_pin.status_code == 200

    toggle_pin = client.patch("/api/v1/admin/pincodes/413999/active/false", headers=headers)
    assert toggle_pin.status_code == 200
    assert toggle_pin.json()["active"] is False

    invalid_pin = client.post("/api/v1/admin/pincodes/41A999", headers=headers)
    assert invalid_pin.status_code == 400
