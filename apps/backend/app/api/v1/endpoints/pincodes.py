from fastapi import APIRouter
from sqlmodel import Session, select
from fastapi import Depends

from app.db.session import get_session
from app.models.entities import ServiceablePincode


router = APIRouter(prefix="/pincodes", tags=["pincodes"])


@router.get("/validate/{pincode}")
def validate_pincode(pincode: str, session: Session = Depends(get_session)):
    row = session.exec(
        select(ServiceablePincode).where(ServiceablePincode.pincode == pincode, ServiceablePincode.active == True)
    ).first()
    if row:
        return {"serviceable": True, "message": "Delivery available in your location."}
    return {
        "serviceable": False,
        "message": "Sorry, we currently do not deliver to your location.",
    }
