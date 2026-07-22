import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexora Industrial Safety Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "nexora-secret-key-enterprise-2026-secure-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Dataset Paths
    AI4I_DATASET_PATH: str = os.path.join("Datasets", "ai4i+2020+predictive+maintenance+dataset", "ai4i2020.csv")
    SMOKE_DATASET_PATH: str = os.path.join("Datasets", "archive (3)", "smoke_detection_iot.csv")
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "*"]

    class Config:
        case_sensitive = True

settings = Settings()
