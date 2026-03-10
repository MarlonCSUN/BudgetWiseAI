from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Finance Tracker"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "default-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    DATA_DIR: str = "./data"
    
    # NEW: Database settings
    DATABASE_URL: str
    DATABASE_ECHO: bool = True

    # NEW: Freedom Bank Firebase settings
    FREEDOM_BANK_URL: str = ""
    FIREBASE_API_KEY: str = ""
    FIREBASE_SERVICE_ACCOUNT: str = "./firebase-service-account.json"
    FIREBASE_EMULATOR: bool = False
    
    # NEW: AZURE AI Studio Agent
    AZURE_AI_ENDPOINT: str = ""
    AZURE_AI_KEY: str = ""
    AZURE_AI_DEPLOYMENT: str = ""


    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(',')]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()