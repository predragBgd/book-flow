import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url):
    """Render/Railway may provide postgres:// — SQLAlchemy needs postgresql://."""
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.getenv("DATABASE_URL", "sqlite:///bookflow.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"connect_timeout": 10},
        "pool_pre_ping": True,
    }
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours for demo

    cors_origins = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).strip()
    if cors_origins == "*":
        CORS_ALLOW_ALL = True
        CORS_ORIGINS = ["*"]
    else:
        CORS_ALLOW_ALL = False
        CORS_ORIGINS = [
            origin.strip().rstrip("/")
            for origin in cors_origins.split(",")
            if origin.strip()
        ]
