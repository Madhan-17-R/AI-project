# =============================================================================
# MARUDAM Backend — Health API
# =============================================================================
from fastapi import APIRouter
from datetime import datetime, timezone

from app.config import settings
from app.services import serial_manager, supabase_service

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    """
    Backend health check.
    Returns status of each subsystem: serial, Supabase, overall.
    """
    serial_info = serial_manager.get_device_status()
    supabase_ok = supabase_service.get_client() is not None

    return {
        "status":      "ok",
        "timestamp":   datetime.now(tz=timezone.utc).isoformat(),
        "version":     "1.0.0",
        "mock_mode":   settings.mock_serial,
        "subsystems":  {
            "serial":  {
                "status":  serial_info["status"],
                "port":    serial_info["serial_port"],
            },
            "supabase": {
                "status": "ok" if supabase_ok else "not_configured",
            },
        },
    }
