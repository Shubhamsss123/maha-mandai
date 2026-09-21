from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    mobile_number: str = Field(min_length=10, max_length=15)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    is_new_user: bool


class RefreshTokenIn(BaseModel):
    refresh_token: str
