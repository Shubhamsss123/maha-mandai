from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import jwt

from app.core.config import settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(subject: str) -> str:
    expire = utc_now() + timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    payload = {"sub": subject, "type": "access", "exp": expire, "jti": uuid4().hex}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def create_refresh_token(subject: str) -> str:
    expire = utc_now() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    payload = {"sub": subject, "type": "refresh", "exp": expire, "jti": uuid4().hex}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
