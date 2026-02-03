from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "budgetWise-AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "default-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    DATA_DIR: str = "./data"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(',')]
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()