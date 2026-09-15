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
from app.services import serial_manager, sensor_service, supabase_service, device_service, anomaly_service, adaptive_baseline_service, india_context_service, ai_service
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

        anomaly_result = anomaly_service.detect(reading)
        
        # Trigger Gemini AI if an anomaly was successfully stored (event_ids present)
        if anomaly_result and anomaly_result.event_ids:
            # We must fetch context asynchronously, then run AI.
            # Create a fire-and-forget task so we don't block the packet pipeline.
            async def run_ai():
                try:
                    context = await india_context_service.get_context_for_device(reading.device_id)
                    user_lang = context.get("user_language", "English")
                    await ai_service.analyze_events_with_gemini(anomaly_result, context, user_lang)
                except Exception as e:
                    logger.error(f"Background AI task failed: {e}")
            
            asyncio.create_task(run_ai())

    except Exception as e:
        logger.error(f"Error in packet pipeline: {e}")


# ─── Lifespan (startup / shutdown) ────────────────────────────────────────────

_serial_task: asyncio.Task | None = None
_adaptive_task: asyncio.Task | None = None


async def _adaptive_baseline_loop(device_id: str) -> None:
    """
    ADAPTIVE PATH background loop.
    Runs every T_update hours. Fetches bounded history, recalculates
    robust baselines, and persists to Supabase.
    Never called per-packet (that is the FAST PATH in anomaly_service).
    """
    logger.info(f"Adaptive baseline loop started for {device_id}")
    while True:
        try:
            # Context is resolved from the India agricultural datasets
            context = await india_context_service.get_context_for_device(device_id)
            
            state = await adaptive_baseline_service.run_adaptive_calculation(
                device_id=device_id, context=context
            )
            sleep_hours = max(state.update_interval_hours, 0.25)  # min 15-min loop
        except Exception as e:
            logger.error(f"Adaptive baseline loop error: {e}")
            sleep_hours = 1.0   # back off 1 h on error

        await asyncio.sleep(sleep_hours * 3600)


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

    # Restore previously persisted adaptive baselines (survives restarts)
    adaptive_baseline_service.restore_from_supabase(settings.device_id)

    # Start the background serial reader task
    _serial_task = asyncio.create_task(
        serial_manager.serial_reader_task(),
        name="serial_reader",
    )
    logger.info("Serial reader task started.")

    # Start the adaptive baseline background task
    _adaptive_task = asyncio.create_task(
        _adaptive_baseline_loop(settings.device_id),
        name="adaptive_baseline",
    )
    logger.info("Adaptive baseline task started.")

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down MARUDAM backend...")
    for task in [_serial_task, _adaptive_task]:
        if task and not task.done():
            task.cancel()
            try:
                await task
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
    # Try Supabase first to get injected dataset values (pH, EC)
    row = supabase_service.get_latest_reading(device_id)
    if row:
        return row
    
    pkt = serial_manager.get_last_packet()
    if not pkt:
        raise _HTTPException(status_code=404, detail="No readings yet")
    return pkt

@app.get("/api/baseline/{device_id}", tags=["legacy"])
async def legacy_baseline(device_id: str):
    """Returns the full adaptive baseline state for a device.
    Backward compatible: sensors.* key contains center, min_expected,
    max_expected, confidence, observations for the existing dashboard.
    """
    return adaptive_baseline_service.get_full_baseline_state(device_id)

@app.get("/api/events/{device_id}", tags=["legacy"])
async def legacy_events(device_id: str):
    rows = supabase_service.get_recent_anomalies(device_id, limit=20)
    return rows

@app.get("/api/context/{device_id}", tags=["context"])
async def get_device_context(device_id: str):
    """Returns the resolved India agricultural context for a device."""
    context = await india_context_service.get_context_for_device(device_id)
    return context

@app.get("/api/decision/{device_id}", tags=["legacy"])
async def evaluate_decision(device_id: str):
    """
    Phase 5 Core Evidence Fusion Engine. Recomputes decision dynamically.
    Ported from legacy SQLite implementation to Supabase backend architecture.
    """
    latest_reading = supabase_service.get_latest_reading(device_id)
    if not latest_reading:
        return {"field_status": "UNCERTAIN", "recommendation_action": "CHECK_FIELD", "evidence_summary": [{"code": "NO_SENSOR_DATA"}]}

    baselines_raw = adaptive_baseline_service.get_full_baseline_state(device_id)
    baselines = baselines_raw.get("sensors", {})
    if not baselines:
        return {"field_status": "UNCERTAIN", "recommendation_action": "MONITOR", "evidence_summary": [{"code": "AWAITING_BASELINE"}]}

    events = supabase_service.get_recent_anomalies(device_id, limit=20)
    
    # 1. Root Zone Estimation
    root_zone_moisture = "UNKNOWN"
    rz_confidence = 0.5
    evidence = []

    # Map legacy event status/type to new Supabase anomaly fields
    moisture_event = next((e for e in events if e.get("sensor") == "soil_moisture" and e.get("deviation", 0) < 0), None)
    is_persistent = moisture_event and moisture_event.get("risk_level") in ["HIGH", "CRITICAL"]

    latest_sm = latest_reading.get("soil_moisture")
    if latest_sm is not None and "soil_moisture" in baselines:
        b = baselines["soil_moisture"]
        min_expected = b.get("min_expected", 0)
        max_expected = b.get("max_expected", 100)
        
        if latest_sm < min_expected:
            if is_persistent:
                root_zone_moisture = "LOW"
                rz_confidence = 0.8
                evidence.append({"code": "MOISTURE_DROP_PERSISTENT", "value": latest_sm})
            else:
                root_zone_moisture = "NORMAL" # Wait for persistence
                evidence.append({"code": "MOISTURE_DROP_RECENT"})
        elif latest_sm > max_expected:
            root_zone_moisture = "HIGH"
            evidence.append({"code": "MOISTURE_ABOVE_BASELINE"})
        else:
            root_zone_moisture = "NORMAL"

    # Contextual Modifiers for Root-Zone Confidence
    if root_zone_moisture == "LOW":
        st = latest_reading.get("air_temperature") # mapped from surrounding_temperature
        if st is not None and st > 32:
            rz_confidence = min(1.0, rz_confidence + 0.1)
            evidence.append({"code": "HIGH_SURROUNDING_TEMPERATURE"})
        rh = latest_reading.get("humidity") # mapped from air_humidity
        if rh is not None and rh < 40:
            rz_confidence = min(1.0, rz_confidence + 0.1)
            evidence.append({"code": "LOW_AIR_HUMIDITY"})

    # 2. Weather Fusion (Weather data unavailable in new DB yet, use legacy fallback)
    rain_prob = 0
    evidence.append({"code": "WEATHER_UNAVAILABLE"})

    # 3. Cause Ranking & Recommendation
    risk_type = "NONE"
    risk_level = "LOW"
    action = "MONITOR"
    decision_confidence = 0.5

    is_water_deficit = root_zone_moisture == "LOW"

    if is_water_deficit:
        risk_type = "WATER_DEFICIT"
        if rain_prob > 70:
            risk_level = "MODERATE"
            action = "WAIT_FOR_RAIN"
            decision_confidence = rz_confidence * 0.9
            evidence.append({"code": "DELAY_IRRIGATION_RAIN_EXPECTED"})
        elif rain_prob < 30:
            risk_level = "HIGH"
            action = "CONSIDER_IRRIGATION"
            decision_confidence = rz_confidence * 0.95
        else:
            risk_level = "MODERATE"
            action = "CONSIDER_IRRIGATION"
            decision_confidence = rz_confidence * 0.8
            
    # Uncertainty / Low Confidence Safety
    if "soil_moisture" in baselines and baselines["soil_moisture"].get("confidence", 1.0) < 0.3:
        action = "CHECK_FIELD"
        decision_confidence = 0.2
        evidence.append({"code": "BASELINE_CONFIDENCE_LOW"})

    status = "NORMAL"
    if risk_level == "MODERATE": status = "WATCH"
    if risk_level == "HIGH": status = "ATTENTION"
    if action == "CHECK_FIELD": status = "UNCERTAIN"
    if risk_type == "NONE" and status == "UNCERTAIN": action = "MONITOR"

    decision = {
        "field_status": status,
        "risk_type": risk_type,
        "risk_level": risk_level,
        "confidence": round(decision_confidence, 2),
        "recommendation_action": action,
        "evidence_summary": evidence,
        "root_zone": {
            "moisture_state": root_zone_moisture,
            "confidence": round(rz_confidence, 2)
        },
        "weather": {
            "rain_probability": None,
            "status": "unavailable"
        }
    }

    # Persistence not supported in current architecture yet
    return decision
