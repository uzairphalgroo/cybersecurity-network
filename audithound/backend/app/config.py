"""Application configuration."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "mock_environments"
TEMPLATES_DIR = BASE_DIR / "templates"

API_TITLE = "Sentinara Security Auditing Engine API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Autonomous Cloud Security & SOC2/CIS Compliance Auditing Platform"

# Allowed origins for CORS
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Max upload size: 5MB
MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
