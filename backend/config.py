import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "LifePilot"
    DEBUG: bool = False

    # Database
    # Default to macOS local PostgreSQL or fallback gracefully
    DATABASE_URL: str = "postgresql+asyncpg://sahaiatherva@localhost:5432/lifepilot"

    # Master Auth
    MASTER_PIN: str = "1234"
    JWT_SECRET: str = "lifepilot_super_secret_jwt_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    # Assistant (Orion)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    ORION_MODEL: str = "qwen2.5:3b-instruct"

    # Timezone & Routines
    TIMEZONE: str = "Asia/Kolkata"
    BRIEFING_MORNING: str = "07:00"
    BRIEFING_NIGHT: str = "23:30"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "capacitor://localhost",
        "http://localhost",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [orig.strip() for orig in v.split(",") if orig.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
