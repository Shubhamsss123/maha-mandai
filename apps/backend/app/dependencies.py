from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from app.core.security import decode_token
from app.db.session import get_session
from app.models.entities import User, UserRole


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    token = None
    if credentials:
        token = credentials.credentials
    if not token:
        token = request.cookies.get("maha_access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = int(payload.get("sub"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_staff(user: User = Depends(get_current_user)) -> User:
    if user.role not in (UserRole.ADMIN, UserRole.ORDER_MANAGER):
        raise HTTPException(status_code=403, detail="Staff access required")
    return user
