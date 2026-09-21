from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    APP_ENV: str = "development"
    BACKEND_PORT: int = 8000

    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "maha"
    POSTGRES_PASSWORD: str = "maha"
    POSTGRES_DB: str = "maha_mandai"
    DATABASE_URL: str = "postgresql+psycopg://maha:maha@db:5432/maha_mandai"

    JWT_SECRET_KEY: str = "change_me"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    ALLOWED_ORIGINS: str = "http://localhost:3000"
    ADMIN_SEED_MOBILE: str = "919876543210"


settings = Settings()
