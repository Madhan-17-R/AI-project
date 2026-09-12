# =============================================================================
# MARUDAM Backend — FastAPI Application
# =============================================================================
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.utils.logger import get_logger
from app.api import health, device, sensor
from app.services import serial_manager, sensor_service, supabase_service, device_service, anomaly_service
from app.models.sensor import ESP32Packet

logger = get_logger("main")

# ─── Packet Processing Pipeline ───────────────────────────────────────────────

def on_packet_received(packet: ESP32Packet) -> None:
    """
    Called by the serial manager for every valid ESP32 packet.
    Pipeline:
      1. Normalise (apply UTC timestamp)
      2. Update device status
      3. Write to Supabase
      4. Run anomaly detection
    This runs in the asyncio event loop thread — keep it fast.
    """
    try:
        reading = sensor_service.normalise_packet(packet)

        device_service.record_reading_received(
            port=serial_manager.get_device_status().get("serial_port") or "MOCK"
        )

        supabase_service.upsert_reading(reading)

        anomaly_service.detect(reading)

    except Exception as e:
        logger.error(f"Error in packet pipeline: {e}")


# ─── Lifespan (startup / shutdown) ────────────────────────────────────────────

_serial_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    global _serial_task

    logger.info("=" * 55)
    logger.info("  MARUDAM Local Backend starting")
    logger.info(f"  Device ID : {settings.device_id}")
    logger.info(f"  Serial    : {settings.serial_port}")
    logger.info(f"  Mock mode : {settings.mock_serial}")
    logger.info(f"  Supabase  : {'configured' if settings.supabase_configured else 'NOT configured'}")
    logger.info("=" * 55)

    # Register packet callback before starting the reader
    serial_manager.set_packet_callback(on_packet_received)

    # Start the background serial reader task
    _serial_task = asyncio.create_task(
        serial_manager.serial_reader_task(),
        name="serial_reader",
    )
    logger.info("Serial reader task started.")

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down MARUDAM backend...")
    if _serial_task and not _serial_task.done():
        _serial_task.cancel()
        try:
            await _serial_task
        except asyncio.CancelledError:
            pass
    logger.info("Shutdown complete.")


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "MARUDAM Local Sensor API",
    description = "Local FastAPI backend for MARUDAM smart soil/plant monitoring system.",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# CORS: allow Next.js frontend (localhost:3000 in dev, Vercel in prod).
# The Vercel frontend reads from Supabase directly, not this local API.
# This CORS config is for local development only.
app.add_middleware(
    CORSMiddleware,
    allow_origins      = settings.cors_origins_list,
    allow_origin_regex = r"http://192\.168\.\d+\.\d+(:\d+)?",
    allow_credentials  = True,
    allow_methods      = ["GET", "POST"],
    allow_headers      = ["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(health.router,  tags=["health"])
app.include_router(device.router,  tags=["device"])
app.include_router(sensor.router,  tags=["sensor"])

# ─── Legacy compatibility routes ──────────────────────────────────────────────
# Keep the original API paths working so the existing dashboard doesn't break.
# These delegate to the new services transparently.

from fastapi import HTTPException as _HTTPException
from fastapi.responses import JSONResponse

@app.get("/api/status/{device_id}", tags=["legacy"])
async def legacy_device_status(device_id: str):
    info = serial_manager.get_device_status()
    age  = info.get("last_reading_age_s")
    if age is None:
        status = "UNKNOWN"
    elif age <= 120:
        status = "ONLINE"
    elif age <= 600:
        status = "STALE"
    else:
        status = "OFFLINE"
    return {
        "device_id":   device_id,
        "status":      status,
        "last_seen":   info.get("last_seen"),
        "age_seconds": int(age) if age else None,
    }

@app.get("/api/sensors/latest/{device_id}", tags=["legacy"])
async def legacy_latest(device_id: str):
    pkt = serial_manager.get_last_packet()
    if not pkt:
        raise _HTTPException(status_code=404, detail="No readings yet")
    return pkt

@app.get("/api/baseline/{device_id}", tags=["legacy"])
async def legacy_baseline(device_id: str):
    return anomaly_service.get_baselines()

@app.get("/api/events/{device_id}", tags=["legacy"])
async def legacy_events(device_id: str):
    rows = supabase_service.get_recent_anomalies(device_id, limit=20)
    return rows
