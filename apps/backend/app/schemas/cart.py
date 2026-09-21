from pydantic import BaseModel, Field


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=20)


class CartItemUpdateIn(BaseModel):
    quantity: int = Field(ge=1, le=20)
