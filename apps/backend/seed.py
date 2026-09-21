from sqlmodel import Session, select

from app.core.config import settings
from app.db.session import engine, init_db
from app.models.entities import Category, Product, ServiceablePincode, User, UserRole


def seed() -> None:
    init_db()
    with Session(engine) as session:
        admin = session.exec(select(User).where(User.mobile_number == settings.ADMIN_SEED_MOBILE)).first()
        if not admin:
            session.add(User(mobile_number=settings.ADMIN_SEED_MOBILE, role=UserRole.ADMIN, is_verified=True))

        categories = [
            ("Fruits", "फळे"),
            ("Vegetables", "भाज्या"),
        ]
        for en, mr in categories:
            exists = session.exec(select(Category).where(Category.name_en == en)).first()
            if not exists:
                session.add(Category(name_en=en, name_mr=mr))

        session.commit()

        fruits = session.exec(select(Category).where(Category.name_en == "Fruits")).first()
        if fruits:
            banana = session.exec(select(Product).where(Product.slug == "banana-robusta")).first()
            if not banana:
                session.add(
                    Product(
                        slug="banana-robusta",
                        name_en="Robusta Banana",
                        name_mr="रोबस्टा केळी",
                        description_en="Fresh farm bananas from Baramati.",
                        description_mr="बारामतीतून ताजी शेतातील केळी.",
                        original_price=80,
                        discounted_price=55,
                        stock_quantity=200,
                        image_url="https://images.unsplash.com/photo-1574226516831-e1dff420e12b",
                        category_id=fruits.id,
                        is_active=True,
                    )
                )

        for code in ["413102", "413133", "413116"]:
            existing = session.exec(select(ServiceablePincode).where(ServiceablePincode.pincode == code)).first()
            if not existing:
                session.add(ServiceablePincode(pincode=code, active=True))

        session.commit()


if __name__ == "__main__":
    seed()
