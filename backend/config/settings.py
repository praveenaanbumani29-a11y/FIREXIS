"""Configuration settings for the FIREXIS platform."""
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "FIREXIS — Fire Exit Risk Evaluation and Intelligent Safety System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./firexis.db")
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]
    
    # Simulation Defaults
    DEFAULT_OCCUPANT_SPEED_MEAN: float = 1.2  # meters per second
    DEFAULT_OCCUPANT_SPEED_STD: float = 0.25
    DEFAULT_REACTION_DELAY_MEAN: float = 2.0  # seconds
    THERMAL_CRITICAL_THRESHOLD_C: float = 65.0  # degrees C for route blockage
    SMOKE_VISIBILITY_CRITICAL_M: float = 3.0  # meters of visibility before route blocked

settings = Settings()
