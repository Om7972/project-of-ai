from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "CardioAI Hospital System"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite+aiosqlite:///./cardioai.db"
    DATABASE_URL_SYNC: str = "sqlite:///./cardioai.db"

    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,http://localhost:5174,"
        "http://localhost:80,http://127.0.0.1:5173,http://127.0.0.1:5174"
    )

    MODEL_PATH: str = "ml/advanced_heart_model.pkl"
    SCALER_PATH: str = "ml/advanced_scaler.pkl"

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False

    RATE_LIMIT_PREDICT: str = "30/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    ADMIN_EMAIL: str = "odhumkekar@gmail.com"
    HIGH_RISK_THRESHOLD: float = 65.0
    MODERATE_RISK_THRESHOLD: float = 40.0

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
