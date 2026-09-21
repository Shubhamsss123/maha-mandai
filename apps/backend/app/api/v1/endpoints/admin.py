from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies import require_admin, require_staff
from app.models.entities import (
    Address,
    Cart,
    CartItem,
    Category,
    Order,
    OrderStatus,
    Product,
    RefreshToken,
    ServiceablePincode,
    User,
    UserRole,
)
from app.schemas.admin import AdminCategoryIn, AdminProductIn


router = APIRouter(prefix="/admin", tags=["admin"])


def _validate_pincode(pincode: str) -> None:
    if len(pincode) != 6 or not pincode.isdigit():
        raise HTTPException(status_code=400, detail="Pincode must be a 6-digit number")


@router.get("/customers")
def list_customers(_: User = Depends(require_staff), session: Session = Depends(get_session)):
    return session.exec(select(User).order_by(User.id.desc())).all()


@router.get("/customers/{user_id}")
def customer_detail(user_id: int, _: User = Depends(require_staff), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    return user


@router.get("/customers/{user_id}/orders")
def customer_orders(user_id: int, _: User = Depends(require_staff), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    return session.exec(select(Order).where(Order.user_id == user.id).order_by(Order.id.desc())).all()


@router.get("/customers/{user_id}/addresses")
def customer_addresses(user_id: int, _: User = Depends(require_staff), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    return session.exec(select(Address).where(Address.user_id == user.id)).all()


@router.delete("/customers/{user_id}")
def delete_customer(user_id: int, current: User = Depends(require_admin), session: Session = Depends(get_session)):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    if user.role in (UserRole.ADMIN, UserRole.ORDER_MANAGER):
        raise HTTPException(status_code=400, detail="Cannot delete an admin or order manager account")

    has_orders = session.exec(select(Order).where(Order.user_id == user.id)).first()
    if has_orders:
        raise HTTPException(status_code=400, detail="Cannot delete a user with existing orders")

    cart = session.exec(select(Cart).where(Cart.user_id == user.id)).first()
    if cart:
        for item in session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all():
            session.delete(item)
        session.delete(cart)

    for address in session.exec(select(Address).where(Address.user_id == user.id)).all():
        session.delete(address)

    for token in session.exec(select(RefreshToken).where(RefreshToken.user_id == user.id)).all():
        session.delete(token)

    session.delete(user)
    session.commit()
    return {"message": "Customer deleted"}


@router.get("/categories")
def admin_list_categories(_: User = Depends(require_staff), session: Session = Depends(get_session)):
    return session.exec(select(Category).order_by(Category.id.asc())).all()


@router.post("/categories")
def admin_create_category(
    payload: AdminCategoryIn,
    _: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    category = Category(name_en=payload.name_en, name_mr=payload.name_mr)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.put("/categories/{category_id}")
def admin_update_category(
    category_id: int,
    payload: AdminCategoryIn,
    _: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    category = session.exec(select(Category).where(Category.id == category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name_en = payload.name_en
    category.name_mr = payload.name_mr
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def admin_delete_category(category_id: int, _: User = Depends(require_admin), session: Session = Depends(get_session)):
    category = session.exec(select(Category).where(Category.id == category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    in_use = session.exec(select(Product).where(Product.category_id == category.id)).first()
    if in_use:
        raise HTTPException(status_code=400, detail="Category has products and cannot be deleted")

    session.delete(category)
    session.commit()
    return {"message": "Category deleted"}


@router.get("/products")
def admin_list_products(_: User = Depends(require_staff), session: Session = Depends(get_session)):
    return session.exec(select(Product).order_by(Product.id.desc())).all()


@router.post("/products")
def admin_create_product(
    payload: AdminProductIn,
    _: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    exists = session.exec(select(Product).where(Product.slug == payload.slug)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Slug already exists")

    category = session.exec(select(Category).where(Category.id == payload.category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product = Product(
        slug=payload.slug,
        name_en=payload.name_en,
        name_mr=payload.name_mr,
        description_en=payload.description_en,
        description_mr=payload.description_mr,
        original_price=payload.original_price,
        discounted_price=payload.discounted_price,
        stock_quantity=payload.stock_quantity,
        image_url=payload.image_url,
        category_id=payload.category_id,
        is_active=payload.is_active,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.put("/products/{product_id}")
def admin_update_product(
    product_id: int,
    payload: AdminProductIn,
    _: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    product = session.exec(select(Product).where(Product.id == product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.slug != product.slug:
        duplicate = session.exec(select(Product).where(Product.slug == payload.slug)).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Slug already exists")

    category = session.exec(select(Category).where(Category.id == payload.category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product.slug = payload.slug
    product.name_en = payload.name_en
    product.name_mr = payload.name_mr
    product.description_en = payload.description_en
    product.description_mr = payload.description_mr
    product.original_price = payload.original_price
    product.discounted_price = payload.discounted_price
    product.stock_quantity = payload.stock_quantity
    product.image_url = payload.image_url
    product.category_id = payload.category_id
    product.is_active = payload.is_active
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.delete("/products/{product_id}")
def admin_delete_product(product_id: int, _: User = Depends(require_admin), session: Session = Depends(get_session)):
    product = session.exec(select(Product).where(Product.id == product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return {"message": "Product deleted"}


@router.get("/orders")
def all_orders(_: User = Depends(require_staff), session: Session = Depends(get_session)):
    return session.exec(select(Order).order_by(Order.id.desc())).all()


@router.patch("/orders/{order_id}/status/{status}")
def update_order_status(
    order_id: int,
    status: OrderStatus,
    _: User = Depends(require_staff),
    session: Session = Depends(get_session),
):
    order = session.exec(select(Order).where(Order.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.order_status = status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.get("/pincodes")
def list_pincodes(_: User = Depends(require_staff), session: Session = Depends(get_session)):
    return session.exec(select(ServiceablePincode).order_by(ServiceablePincode.pincode.asc())).all()


@router.post("/pincodes/{pincode}")
def add_pincode(pincode: str, _: User = Depends(require_admin), session: Session = Depends(get_session)):
    _validate_pincode(pincode)
    existing = session.exec(select(ServiceablePincode).where(ServiceablePincode.pincode == pincode)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pincode already exists")
    row = ServiceablePincode(pincode=pincode, active=True)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.patch("/pincodes/{pincode}/active/{active}")
def toggle_pincode(
    pincode: str,
    active: bool,
    _: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    _validate_pincode(pincode)
    row = session.exec(select(ServiceablePincode).where(ServiceablePincode.pincode == pincode)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Pincode not found")
    row.active = active
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.delete("/pincodes/{pincode}")
def delete_pincode(pincode: str, _: User = Depends(require_admin), session: Session = Depends(get_session)):
    _validate_pincode(pincode)
    row = session.exec(select(ServiceablePincode).where(ServiceablePincode.pincode == pincode)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Pincode not found")
    session.delete(row)
    session.commit()
    return {"message": "Pincode deleted"}
