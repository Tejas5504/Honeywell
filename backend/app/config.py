"""
Application configuration using Pydantic Settings.
Loads from environment variables with sensible defaults.
Supports both local development and production (Render/Vercel) deployment.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Global application settings."""
    
    # Application
    APP_NAME: str = "CyberShield - AI Behavioral Anomaly Detection"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # MongoDB - Use MONGODB_URL for Render compatibility
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_URI: str = ""           # Fallback alias
    MONGODB_DB_NAME: str = "cybershield"
    
    # CORS - Allow all Vercel preview URLs + custom domains
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://honeywell-wtc8-pioykeatq-desaletejas5504-1661s-projects.vercel.app",
        "https://*.vercel.app",
    ]
    CORS_ALLOW_ALL: bool = True     # Set True on Render to allow all origins
    
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

    @property
    def mongo_connection_string(self) -> str:
        """Returns the active MongoDB connection string (prefers MONGODB_URL)."""
        if self.MONGODB_URL and self.MONGODB_URL != "mongodb://localhost:27017":
            return self.MONGODB_URL
        if self.MONGODB_URI:
            return self.MONGODB_URI
        return self.MONGODB_URL


# Singleton settings instance
settings = Settings()
