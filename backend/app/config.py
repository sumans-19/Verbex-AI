from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://verbex:yourpassword@localhost:5432/verbex"
    DB_PASSWORD: str = "yourpassword"

    # JWT
    SECRET_KEY: str = "your-random-string-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Deepgram
    DEEPGRAM_API_KEY: str = ""

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # App Config
    MAX_AUDIO_SIZE_MB: int = 500
    CONFIDENCE_AUTO_APPROVE: float = 0.75
    CONFIDENCE_REVIEW_THRESHOLD: float = 0.50

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Ensure storage directory exists
os.makedirs("storage/audio", exist_ok=True)
