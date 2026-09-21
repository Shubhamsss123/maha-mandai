from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    ORDER_MANAGER = "order_manager"


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    COD = "cod"
    ONLINE = "online"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mobile_number: str = Field(index=True, unique=True)
    role: UserRole = Field(default=UserRole.CUSTOMER)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)


class Address(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    full_name: str
    phone: str
    house: str
    street: str
    landmark: Optional[str] = None
    area: str
    city: str
    state: str
    pincode: str = Field(index=True)
    is_default: bool = Field(default=False)


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name_en: str
    name_mr: str


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    name_en: str
    name_mr: str
    description_en: str
    description_mr: str
    original_price: Decimal
    discounted_price: Decimal
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: int = Field(foreign_key="category.id")
    is_active: bool = Field(default=True)


class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")


class CartItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(index=True, foreign_key="cart.id")
    product_id: int = Field(index=True, foreign_key="product.id")
    quantity: int


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    address_id: int = Field(foreign_key="address.id")
    total_amount: Decimal
    payment_method: PaymentMethod = Field(default=PaymentMethod.COD)
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    order_status: OrderStatus = Field(default=OrderStatus.PENDING)
    created_at: datetime = Field(default_factory=utc_now, index=True)


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(index=True, foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    price: Decimal


class ServiceablePincode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pincode: str = Field(index=True, unique=True)
    active: bool = Field(default=True)


class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    token_hash: str = Field(index=True, unique=True)
    expires_at: datetime = Field(index=True)
    revoked: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=utc_now)


class PaymentTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(index=True, foreign_key="order.id")
    provider: str = Field(default="razorpay", index=True)
    provider_order_id: Optional[str] = Field(default=None, index=True)
    provider_payment_id: Optional[str] = Field(default=None, index=True)
    amount: Decimal
    status: PaymentStatus = Field(default=PaymentStatus.PENDING, index=True)
    created_at: datetime = Field(default_factory=utc_now)
