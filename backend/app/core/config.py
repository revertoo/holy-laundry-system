from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Holy Laundry API"
    NODE_ENV: str = "development"
    
    # Database
    DATABASE_URL: str

    # WhatsApp - Wablas Integration
    WA_ENABLED: bool = False
    WABLAS_DOMAIN: str = ""
    WABLAS_API_TOKEN: str = ""    
    WABLAS_SECRET_KEY: str = ""
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # Midtrans
    MIDTRANS_SERVER_KEY: str
    MIDTRANS_CLIENT_KEY: str
    MIDTRANS_IS_PRODUCTION: bool = False
    
    # Store Location
    STORE_LATITUDE: float
    STORE_LONGITUDE: float
    MAX_DELIVERY_RADIUS_KM: float = 2.0
    
    # CORS
    ALLOWED_ORIGINS: str
    
    class Config:
        env_file = ".env"

settings = Settings()