from pydantic import BaseModel


class PaymentCreateIn(BaseModel):
    order_id: int


class PaymentWebhookIn(BaseModel):
    provider_order_id: str
    provider_payment_id: str | None = None
    status: str
