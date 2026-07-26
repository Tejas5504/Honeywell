"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Global application settings."""
    
    # Application
    APP_NAME: str = "CyberShield - AI Behavioral Anomaly Detection"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "cybershield"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    # ML Model
    ISOLATION_FOREST_ESTIMATORS: int = 200
    ISOLATION_FOREST_CONTAMINATION: float = 0.05
    ISOLATION_FOREST_RANDOM_STATE: int = 42
    
    # Data Generation
    DEFAULT_RECORD_COUNT: int = 10000
    ATTACK_RATIO: float = 0.06  # 6% anomalous records
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
