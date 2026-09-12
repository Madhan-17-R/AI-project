# =============================================================================
# MARUDAM Backend — Sensor Pydantic Models
# =============================================================================
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# ─── Sensor Status ────────────────────────────────────────────────────────────

class SensorStatus(BaseModel):
    """Per-sensor status as reported by the ESP32."""
    soil_moisture:    str = "unknown"
    soil_temperature: str = "unknown"
    soil_ph:          str = "unavailable"
    soil_ec:          str = "unavailable"
    air_temperature:  str = "unknown"
    humidity:         str = "unknown"
    light_lux:        str = "unknown"


# ─── Raw ESP32 Packet ─────────────────────────────────────────────────────────

class ESP32Packet(BaseModel):
    """
    Parsed from the raw JSON Line received over USB serial.
    All sensor values are optional (null if sensor unavailable or errored).
    The timestamp field from ESP32 is ignored (it has no RTC); the backend
    applies a server-side UTC timestamp instead.
    """
    device_id:        str
    timestamp:        Optional[str]   = None   # Ignored — backend applies UTC
    soil_moisture:    Optional[float] = None
    soil_temperature: Optional[float] = None
    soil_ph:          Optional[float] = None
    soil_ec:          Optional[float] = None
    air_temperature:  Optional[float] = None
    humidity:         Optional[float] = None
    light_lux:        Optional[float] = None
    sensor_status:    Optional[SensorStatus] = None

    @field_validator("device_id")
    @classmethod
    def device_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("device_id must not be empty")
        return v.strip()

    @field_validator("soil_moisture")
    @classmethod
    def moisture_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 100.0):
            raise ValueError(f"soil_moisture {v} out of range [0, 100]")
        return v

    @field_validator("humidity")
    @classmethod
    def humidity_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 100.0):
            raise ValueError(f"humidity {v} out of range [0, 100]")
        return v

    @field_validator("soil_temperature", "air_temperature")
    @classmethod
    def temperature_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-40.0 <= v <= 85.0):
            raise ValueError(f"temperature {v} out of range [-40, 85]")
        return v

    @field_validator("soil_ph")
    @classmethod
    def ph_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 14.0):
            raise ValueError(f"soil_ph {v} out of range [0, 14]")
        return v

    @field_validator("light_lux")
    @classmethod
    def lux_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError(f"light_lux {v} must be >= 0")
        return v


# ─── Normalised Sensor Reading (for Supabase + internal use) ──────────────────

class SensorReading(BaseModel):
    """
    A validated, normalised sensor reading ready to be stored in Supabase.
    The timestamp here is always a server-side UTC datetime.
    """
    device_id:        str
    timestamp:        datetime
    soil_moisture:    Optional[float] = None
    soil_temperature: Optional[float] = None
    soil_ph:          Optional[float] = None
    soil_ec:          Optional[float] = None
    air_temperature:  Optional[float] = None
    humidity:         Optional[float] = None
    light_lux:        Optional[float] = None
    sensor_status:    Optional[SensorStatus] = None


# ─── API Response Models ──────────────────────────────────────────────────────

class SensorReadingResponse(SensorReading):
    """Sensor reading as returned by the API (includes DB id)."""
    id: Optional[str] = None
    created_at: Optional[datetime] = None


class LatestSensorResponse(BaseModel):
    """Response from GET /sensor/latest."""
    device_id: str
    reading: Optional[SensorReading] = None
    source: str = "supabase"  # "supabase" | "local"
