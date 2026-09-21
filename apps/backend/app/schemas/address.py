from pydantic import BaseModel, Field


class AddressIn(BaseModel):
    full_name: str
    phone: str = Field(min_length=10, max_length=15)
    house: str
    street: str
    landmark: str | None = None
    area: str
    city: str
    state: str
    pincode: str = Field(min_length=6, max_length=6)
    is_default: bool = False


class AddressOut(AddressIn):
    id: int
    user_id: int
