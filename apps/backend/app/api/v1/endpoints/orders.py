from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies import get_current_user
from app.models.entities import (
    Address,
    Cart,
    CartItem,
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Product,
    ServiceablePincode,
    User,
)
from app.schemas.order import CheckoutIn


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout")
def checkout(payload: CheckoutIn, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Your account is not verified yet. Please contact support to verify your account before placing orders.")

    address = session.exec(select(Address).where(Address.id == payload.address_id, Address.user_id == user.id)).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    serviceable = session.exec(
        select(ServiceablePincode).where(
            ServiceablePincode.pincode == address.pincode,
            ServiceablePincode.active == True,
        )
    ).first()
    if not serviceable:
        raise HTTPException(status_code=400, detail="Sorry, we currently do not deliver to your location.")

    cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    cart_items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = Decimal("0")
    product_rows: dict[int, Product] = {}
    for item in cart_items:
        product = session.exec(select(Product).where(Product.id == item.product_id, Product.is_active == True)).first()
        if not product:
            raise HTTPException(status_code=400, detail="Invalid product in cart")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name_en}")
        total += product.discounted_price * item.quantity
        product_rows[item.product_id] = product

    method = PaymentMethod.COD if payload.payment_method.lower() == "cod" else PaymentMethod.ONLINE
    payment_status = PaymentStatus.PENDING

    order = Order(
        user_id=user.id,
        address_id=address.id,
        total_amount=total,
        payment_method=method,
        payment_status=payment_status,
        order_status=OrderStatus.PENDING,
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    for item in cart_items:
        product = product_rows[item.product_id]
        session.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=product.discounted_price,
            )
        )
        product.stock_quantity -= item.quantity
        session.add(product)
        session.delete(item)

    session.commit()
    return {"order_id": order.id, "status": order.order_status, "total_amount": float(order.total_amount)}


@router.get("")
def list_orders(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Order).where(Order.user_id == user.id).order_by(Order.id.desc())).all()


@router.get("/{order_id}")
def order_detail(order_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    order = session.exec(select(Order).where(Order.id == order_id, Order.user_id == user.id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    address = session.exec(select(Address).where(Address.id == order.address_id)).first()

    item_rows = []
    for item in items:
        product = session.exec(select(Product).where(Product.id == item.product_id)).first()
        item_rows.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "name": product.name_en if product else "Product",
                "quantity": item.quantity,
                "price": float(item.price),
                "subtotal": float(item.price) * item.quantity,
            }
        )

    return {"order": order, "items": item_rows, "address": address}
