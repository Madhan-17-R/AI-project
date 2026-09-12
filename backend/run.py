"""
MARUDAM Backend — Entry Point
==============================
Usage:
    python run.py

Or with uvicorn directly:
    uvicorn app.main:app --reload --port 8000

Environment:
    Copy .env.example to .env and fill in your values before running.
"""
import sys
import os

# Ensure the backend/ directory is on the Python path
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host    = settings.host,
        port    = settings.port,
        reload  = False,
        log_level = settings.log_level.lower(),
    )
