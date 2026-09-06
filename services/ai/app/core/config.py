import os
from typing import List
from pydantic import BaseModel

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        PROJECT_NAME: str = "CSHRK AI Service"
        VERSION: str = "0.1.0"
        API_V1_STR: str = "/api/v1"
        PORT: int = 8000
        HOST: str = "0.0.0.0"
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
        ]

        class Config:
            case_sensitive = True
            env_file = ".env"
            extra = "ignore"

    settings = Settings()
except ImportError:
    class FallbackSettings(BaseModel):
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "CSHRK AI Service")
        VERSION: str = "0.1.0"
        API_V1_STR: str = "/api/v1"
        PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
        HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
        ]

    settings = FallbackSettings()
