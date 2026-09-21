from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies import get_current_user
from app.models.entities import Cart, CartItem, Product, User
from app.schemas.cart import CartItemIn, CartItemUpdateIn


router = APIRouter(prefix="/cart", tags=["cart"])


def _get_or_create_cart(session: Session, user_id: int) -> Cart:
    cart = session.exec(select(Cart).where(Cart.user_id == user_id)).first()
    if not cart:
        cart = Cart(user_id=user_id)
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


@router.get("")
def get_cart(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    cart = _get_or_create_cart(session, user.id)
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()

    result_items = []
    total_mrp = Decimal("0")
    total_sale = Decimal("0")

    for item in items:
        product = session.exec(select(Product).where(Product.id == item.product_id, Product.is_active == True)).first()
        if not product:
            continue
        line_mrp = product.original_price * item.quantity
        line_sale = product.discounted_price * item.quantity
        total_mrp += line_mrp
        total_sale += line_sale
        result_items.append(
            {
                "id": item.id,
                "product_id": product.id,
                "name_en": product.name_en,
                "name_mr": product.name_mr,
                "quantity": item.quantity,
                "line_mrp": float(line_mrp),
                "line_sale": float(line_sale),
            }
        )

    return {
        "cart_id": cart.id,
        "items": result_items,
        "total_mrp": float(total_mrp),
        "total_sale": float(total_sale),
        "total_savings": float(total_mrp - total_sale),
    }


@router.post("/items")
def add_cart_item(payload: CartItemIn, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    product = session.exec(select(Product).where(Product.id == payload.product_id, Product.is_active == True)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = _get_or_create_cart(session, user.id)
    existing = session.exec(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
    ).first()

    if existing:
        existing.quantity += payload.quantity
        if existing.quantity > product.stock_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    cart_item = CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity)
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@router.put("/items/{item_id}")
def update_cart_item(
    item_id: int,
    payload: CartItemUpdateIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    cart = _get_or_create_cart(session, user.id)
    item = session.exec(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = session.exec(select(Product).where(Product.id == item.product_id)).first()
    if not product or product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    item.quantity = payload.quantity
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/items/{item_id}")
def remove_cart_item(item_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    cart = _get_or_create_cart(session, user.id)
    item = session.exec(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    session.delete(item)
    session.commit()
    return {"message": "Cart item removed"}
