from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.dependencies import get_current_user
from app.models.entities import Address, User
from app.schemas.address import AddressIn


router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.get("")
def list_addresses(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Address).where(Address.user_id == user.id)).all()


@router.post("")
def create_address(payload: AddressIn, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if payload.is_default:
        current = session.exec(select(Address).where(Address.user_id == user.id, Address.is_default == True)).all()
        for item in current:
            item.is_default = False
            session.add(item)

    address = Address(user_id=user.id, **payload.model_dump())
    session.add(address)
    session.commit()
    session.refresh(address)
    return address


@router.put("/{address_id}")
def update_address(
    address_id: int,
    payload: AddressIn,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    address = session.exec(select(Address).where(Address.id == address_id, Address.user_id == user.id)).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    updates = payload.model_dump()
    if updates.get("is_default"):
        current = session.exec(select(Address).where(Address.user_id == user.id, Address.is_default == True)).all()
        for item in current:
            item.is_default = False
            session.add(item)

    for key, value in updates.items():
        setattr(address, key, value)

    session.add(address)
    session.commit()
    session.refresh(address)
    return address


@router.delete("/{address_id}")
def delete_address(address_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    address = session.exec(select(Address).where(Address.id == address_id, Address.user_id == user.id)).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    session.delete(address)
    session.commit()
    return {"message": "Address deleted"}
