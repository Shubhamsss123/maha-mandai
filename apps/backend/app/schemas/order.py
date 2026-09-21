from pydantic import BaseModel


class CheckoutIn(BaseModel):
    address_id: int
    payment_method: str = "cod"
