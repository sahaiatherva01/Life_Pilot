from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", alias="APP_ENV")
    timezone: str = Field(default="Asia/Kolkata", alias="TIMEZONE")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://lifepilot:lifepilot_secret@localhost:5432/lifepilot",
        alias="DATABASE_URL",
    )
    database_url_sync: str = Field(
        default="postgresql+psycopg2://lifepilot:lifepilot_secret@localhost:5432/lifepilot",
        alias="DATABASE_URL_SYNC",
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # Security
    secret_key: str = Field(
        default="lifepilot-insecure-development-secret-key-change-in-production-12345",
        alias="SECRET_KEY",
    )
    token_encryption_key: str = Field(
        default="lifepilot-dev-token-encryption-key-32b",
        alias="TOKEN_ENCRYPTION_KEY",
    )
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    algorithm: str = "HS256"

    # Orion Local Inference
    orion_runtime_url: str = Field(
        default="http://localhost:11434", alias="ORION_RUNTIME_URL"
    )
    orion_model: str = Field(
        default="qwen2.5:3b-instruct-q4_K_M", alias="ORION_MODEL"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
