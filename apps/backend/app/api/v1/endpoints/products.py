from fastapi import APIRouter, Query
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.entities import Product
from fastapi import Depends


router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    locale: str = Query(default="en", pattern="^(en|mr)$"),
    session: Session = Depends(get_session),
):
    stmt = select(Product).where(Product.is_active == True)
    products = session.exec(stmt).all()
    result = []
    for product in products:
        name = product.name_mr if locale == "mr" else product.name_en
        description = product.description_mr if locale == "mr" else product.description_en
        savings = float(product.original_price - product.discounted_price)
        discount_percentage = round((savings / float(product.original_price)) * 100, 2) if product.original_price else 0
        result.append(
            {
                "id": product.id,
                "slug": product.slug,
                "name": name,
                "description": description,
                "original_price": float(product.original_price),
                "discounted_price": float(product.discounted_price),
                "savings": savings,
                "discount_percentage": discount_percentage,
                "stock_quantity": product.stock_quantity,
                "image_url": product.image_url,
            }
        )
    return result
