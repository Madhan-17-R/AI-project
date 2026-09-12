# =============================================================================
# MARUDAM Backend — Sensor API
# =============================================================================
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.config import settings
from app.services import serial_manager, supabase_service, anomaly_service

router = APIRouter(prefix="/sensor")


@router.get("/latest")
async def get_latest_reading(device_id: Optional[str] = None) -> dict:
    """
    Returns the most recent sensor reading.
    Tries Supabase first; falls back to the in-memory last packet.
    """
    did = device_id or settings.device_id

    # ── Try Supabase (cloud/persistent) ──────────────────────────────────────
    supabase_row = supabase_service.get_latest_reading(did)
    if supabase_row:
        return {"source": "supabase", "reading": supabase_row}

    # ── Fall back to in-memory last packet ────────────────────────────────────
    packet = serial_manager.get_last_packet()
    if packet:
        return {"source": "local", "reading": packet}

    raise HTTPException(status_code=404, detail=f"No readings found for device: {did}")


@router.get("/history")
async def get_reading_history(
    device_id: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> dict:
    """Returns the last N sensor readings from Supabase."""
    did = device_id or settings.device_id
    rows = supabase_service.get_reading_history(did, limit=limit)
    return {"device_id": did, "count": len(rows), "readings": rows}


@router.get("/anomalies")
async def get_anomalies(
    device_id: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
) -> dict:
    """Returns recent anomaly records from Supabase."""
    did = device_id or settings.device_id
    rows = supabase_service.get_recent_anomalies(did, limit=limit)
    return {"device_id": did, "count": len(rows), "anomalies": rows}


@router.get("/baseline")
async def get_baseline() -> dict:
    """Returns the current adaptive baseline state for all sensors."""
    return {
        "device_id": settings.device_id,
        "baselines": anomaly_service.get_baselines(),
    }
