from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.entities import Category


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category).order_by(Category.id.asc())).all()
