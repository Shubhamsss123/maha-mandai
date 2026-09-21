from datetime import timedelta
import hashlib

from fastapi import HTTPException
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token, utc_now
from app.models.entities import RefreshToken, User, UserRole


def normalize_mobile(mobile_number: str) -> str:
    digits = "".join(ch for ch in mobile_number if ch.isdigit())
    if len(digits) == 10:
        return f"91{digits}"
    return digits


def login(session: Session, mobile_number: str) -> tuple[User, bool]:
    normalized = normalize_mobile(mobile_number)
    user = session.exec(select(User).where(User.mobile_number == normalized)).first()
    is_new_user = False
    if not user:
        user = User(mobile_number=normalized, role=UserRole.CUSTOMER)
        session.add(user)
        is_new_user = True
        session.commit()
        session.refresh(user)
    return user, is_new_user


def issue_tokens(user: User) -> tuple[str, str]:
    subject = str(user.id)
    return create_access_token(subject), create_refresh_token(subject)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def store_refresh_token(session: Session, user: User, refresh_token: str) -> None:
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=_token_hash(refresh_token),
            expires_at=utc_now() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS),
        )
    )
    session.commit()


def rotate_refresh_token(session: Session, refresh_token: str) -> tuple[User, str, str]:
    token_row = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == _token_hash(refresh_token))
    ).first()
    if not token_row or token_row.revoked:
        raise HTTPException(status_code=401, detail="Refresh token is invalid")
    if token_row.expires_at < utc_now():
        raise HTTPException(status_code=401, detail="Refresh token is expired")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc

    user = session.exec(select(User).where(User.id == token_row.user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_row.revoked = True
    session.add(token_row)

    access_token, new_refresh_token = issue_tokens(user)
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=_token_hash(new_refresh_token),
            expires_at=utc_now() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS),
        )
    )
    session.commit()
    return user, access_token, new_refresh_token


def revoke_refresh_token(session: Session, refresh_token: str) -> None:
    token_row = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == _token_hash(refresh_token))
    ).first()
    if token_row:
        token_row.revoked = True
        session.add(token_row)
        session.commit()
