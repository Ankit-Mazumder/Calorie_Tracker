import os
import json
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

dotenv_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=dotenv_path)

config_path = os.path.join(BASE_DIR, "config.json")
try:
    with open(config_path, "r") as f:
        _config = json.load(f)
except Exception as e:
    print(f"Error loading {config_path}: {e}")
    _config = {}

class Settings:
    DATABASE_URL = _config.get("database_url", "sqlite:///./calorie_tracker.db")
    GEMINI_API_KEY = _config.get("gemini_api_key", os.getenv("GEMINI_API_KEY", "dummy_key"))
    SECRET_KEY = _config.get("secret_key", os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"))
    ALGORITHM = _config.get("algorithm", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = _config.get("access_token_expire_minutes", 60 * 24 * 7) # 7 days
    HOST = _config.get("backend_host", "0.0.0.0")
    PORT = _config.get("backend_port", 8000)

settings = Settings()
