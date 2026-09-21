from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies import get_current_user
from app.models.entities import Order, OrderStatus, PaymentMethod, PaymentStatus, PaymentTransaction, User
from app.schemas.payment import PaymentCreateIn, PaymentWebhookIn


router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create")
def create_payment(payload: PaymentCreateIn, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    order = session.exec(select(Order).where(Order.id == payload.order_id, Order.user_id == user.id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_method == PaymentMethod.COD:
        return {
            "order_id": order.id,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "message": "Cash on Delivery selected. No online payment required.",
        }

    provider_order_id = f"razorpay_order_{uuid4().hex[:16]}"
    transaction = PaymentTransaction(
        order_id=order.id,
        provider="razorpay",
        provider_order_id=provider_order_id,
        amount=Decimal(order.total_amount),
        status=PaymentStatus.PENDING,
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return {
        "order_id": order.id,
        "provider": "razorpay",
        "provider_order_id": provider_order_id,
        "amount": float(order.total_amount),
        "currency": "INR",
        "payment_status": transaction.status,
    }


@router.post("/webhook")
def payment_webhook(payload: PaymentWebhookIn, session: Session = Depends(get_session)):
    transaction = session.exec(
        select(PaymentTransaction).where(PaymentTransaction.provider_order_id == payload.provider_order_id)
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment transaction not found")

    status = payload.status.lower()
    if status == "paid":
        transaction.status = PaymentStatus.PAID
    elif status == "failed":
        transaction.status = PaymentStatus.FAILED
    elif status == "refunded":
        transaction.status = PaymentStatus.REFUNDED
    else:
        raise HTTPException(status_code=400, detail="Unsupported status")

    transaction.provider_payment_id = payload.provider_payment_id
    session.add(transaction)

    order = session.exec(select(Order).where(Order.id == transaction.order_id)).first()
    if order:
        order.payment_status = transaction.status
        if transaction.status == PaymentStatus.PAID and order.order_status == OrderStatus.PENDING:
            order.order_status = OrderStatus.CONFIRMED
        session.add(order)

    session.commit()
    return {"message": "Webhook processed", "status": transaction.status}
