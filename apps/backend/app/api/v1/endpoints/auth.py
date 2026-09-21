from fastapi import APIRouter, Depends, Response
from sqlmodel import Session

from app.core.config import settings
from app.db.session import get_session
from app.schemas.auth import LoginIn, RefreshTokenIn, TokenResponse
from app.schemas.common import MessageResponse
from app.services.auth_service import (
    issue_tokens,
    login,
    revoke_refresh_token,
    rotate_refresh_token,
    store_refresh_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def _cookie_kwargs() -> dict:
    secure = settings.APP_ENV != "development"
    return {"httponly": True, "samesite": "lax", "secure": secure}


@router.post("/login", response_model=TokenResponse)
def login_endpoint(payload: LoginIn, response: Response, session: Session = Depends(get_session)):
    user, is_new_user = login(session, payload.mobile_number)
    access_token, refresh_token = issue_tokens(user)
    store_refresh_token(session, user, refresh_token)
    response.set_cookie("maha_access_token", access_token, **_cookie_kwargs())
    response.set_cookie("maha_refresh_token", refresh_token, **_cookie_kwargs())
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, is_new_user=is_new_user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(payload: RefreshTokenIn, response: Response, session: Session = Depends(get_session)):
    user, access_token, refresh_token = rotate_refresh_token(session, payload.refresh_token)
    response.set_cookie("maha_access_token", access_token, **_cookie_kwargs())
    response.set_cookie("maha_refresh_token", refresh_token, **_cookie_kwargs())
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, is_new_user=False)


@router.post("/logout", response_model=MessageResponse)
def logout_endpoint(payload: RefreshTokenIn, response: Response, session: Session = Depends(get_session)):
    revoke_refresh_token(session, payload.refresh_token)
    response.delete_cookie("maha_access_token")
    response.delete_cookie("maha_refresh_token")
    return MessageResponse(message="Logged out successfully")
