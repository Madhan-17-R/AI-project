# =============================================================================
# MARUDAM Backend — Device Pydantic Models
# =============================================================================
from __future__ import annotations
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


DeviceStatusValue = Literal[
    "CONNECTED",
    "DISCONNECTED",
    "SENSOR_ERROR",
    "BACKEND_ERROR",
    "UNKNOWN",
]

DeviceEventType = Literal[
    "connected",
    "disconnected",
    "reconnected",
    "sensor_error",
    "backend_error",
    "recovery",
]


class DeviceStatus(BaseModel):
    """Current status of a MARUDAM device."""
    device_id:   str
    device_name: str = "MARUDAM Sensor Node"
    status:      DeviceStatusValue = "UNKNOWN"
    serial_port: Optional[str] = None
    last_seen:   Optional[datetime] = None
    created_at:  Optional[datetime] = None
    updated_at:  Optional[datetime] = None


class DeviceEvent(BaseModel):
    """An event in a device's lifecycle (connect, disconnect, error, etc.)."""
    device_id:  str
    timestamp:  datetime
    event_type: DeviceEventType
    message:    str = ""


class DeviceStatusResponse(BaseModel):
    """Response from GET /device/status."""
    device_id:          str
    status:             DeviceStatusValue
    serial_port:        Optional[str] = None
    last_seen:          Optional[datetime] = None
    last_reading_age_s: Optional[float] = None   # seconds since last reading


class ConnectRequest(BaseModel):
    """Body for POST /device/connect (manual port override)."""
    serial_port: str   # e.g. "COM6"
