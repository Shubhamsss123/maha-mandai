from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.entities import User


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "mobile_number": user.mobile_number,
        "role": user.role,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
    }
