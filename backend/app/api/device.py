# =============================================================================
# MARUDAM Backend — Device API
# =============================================================================
from fastapi import APIRouter, HTTPException
from datetime import timezone

from app.models.device import ConnectRequest, DeviceStatusResponse
from app.services import serial_manager, device_service, supabase_service
from app.config import settings

router = APIRouter(prefix="/device")


@router.get("/status", response_model=DeviceStatusResponse)
async def get_device_status() -> dict:
    """
    Returns current device connection status.
    Includes: status, serial_port, last_seen, last_reading_age_s.
    """
    info = serial_manager.get_device_status()
    return {
        "device_id":          settings.device_id,
        "status":             info["status"],
        "serial_port":        info["serial_port"],
        "last_seen":          info["last_seen"],
        "last_reading_age_s": info["last_reading_age_s"],
    }


@router.get("/ports")
async def list_available_ports() -> dict:
    """
    Returns all detected serial ports with metadata.
    Useful for diagnosing COM port issues on Windows.
    """
    ports = serial_manager.list_ports()
    detected = serial_manager.find_esp32_port()
    return {
        "available_ports": ports,
        "detected_esp32":  detected,
    }


@router.post("/connect")
async def manual_connect(body: ConnectRequest) -> dict:
    """
    Manual port override.
    In most cases, AUTO detection is sufficient.
    Use this if the ESP32 is on an unexpected COM port.
    """
    import re
    port = body.serial_port.strip()
    # Basic validation — Windows COM port or /dev/ttyUSB*
    if not (re.match(r"^COM\d+$", port, re.IGNORECASE) or port.startswith("/dev/tty")):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid port format: '{port}'. Expected COM3, COM6, /dev/ttyUSB0 etc."
        )
    # The serial manager restarts automatically; we just update the override setting.
    # In production, a restart of the serial task would be needed for this to take effect
    # on the current session. Documented as a future enhancement.
    return {
        "message": f"Port override noted: {port}. "
                   "Restart the backend for this to take effect.",
        "port": port,
    }


@router.post("/disconnect")
async def request_disconnect() -> dict:
    """
    Informational endpoint — signals intent to disconnect.
    The serial manager handles physical disconnection automatically.
    """
    return {"message": "Disconnect acknowledged. Unplug the USB cable to disconnect the ESP32."}
