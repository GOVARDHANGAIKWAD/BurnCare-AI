import os

class Settings:
    PROJECT_NAME: str = "BurnCare AI Backend API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "burncare_ai_super_secret_jwt_key_2026_antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./burncare.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "burncare_db")
    
    # OpenAI API Key for AI Doctor Assistant
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MEDIA_DIR: str = os.path.join(BASE_DIR, "data", "uploads")
    HEATMAP_DIR: str = os.path.join(BASE_DIR, "data", "heatmaps")
    REPORTS_DIR: str = os.path.join(BASE_DIR, "data", "reports")

settings = Settings()
