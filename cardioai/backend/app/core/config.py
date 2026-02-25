from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "CardioAI Hospital System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql+asyncpg://cardioai_user:cardioai_password@localhost:5432/cardioai_db"
    )
    DATABASE_URL_SYNC: str = (
        "postgresql://cardioai_user:cardioai_password@localhost:5432/cardioai_db"
    )

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,http://localhost:80"
    )

    # ── ML Model Paths ───────────────────────────────────────────────────────
    MODEL_PATH: str = "ml/advanced_heart_model.pkl"
    SCALER_PATH: str = "ml/advanced_scaler.pkl"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
