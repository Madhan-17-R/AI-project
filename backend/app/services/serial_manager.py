# =============================================================================
# MARUDAM Backend — Serial Manager
# =============================================================================
# Responsibilities:
#   - Scan available COM ports
#   - Auto-detect the ESP32 using USB metadata (VID/PID or description)
#   - Open the serial connection
#   - Read JSON Lines continuously
#   - Detect disconnection and reconnect automatically
#   - Never crash FastAPI when the USB cable is removed
#   - Expose the latest valid packet and device status for other services
#
# Design: runs as a background asyncio task inside the FastAPI process.
# The task is started on app startup and cancelled on shutdown.
# =============================================================================
from __future__ import annotations

import asyncio
import json
import random
import time
from datetime import datetime, timezone
from typing import Callable, Optional

import serial
import serial.tools.list_ports

from app.config import settings
from app.models.sensor import ESP32Packet, SensorStatus
from app.utils.logger import get_logger

logger = get_logger("serial_manager")

# ─── ESP32 USB vendor/product IDs ─────────────────────────────────────────────
# These cover the most common ESP32 DevKit USB-to-Serial chips.
# CP2102 (Silicon Labs) and CH340 are the most prevalent.
ESP32_USB_VIDS: set[int] = {
    0x10C4,  # Silicon Labs CP2102
    0x1A86,  # QinHeng Electronics CH340
    0x0403,  # FTDI
    0x067B,  # Prolific PL2303
}

# Substrings to look for in port description (case-insensitive fallback)
ESP32_DESCRIPTION_HINTS = [
    "cp210",
    "ch340",
    "ftdi",
    "usb serial",
    "uart",
    "esp32",
    "silicon labs",
]

# ─── Global state (in-process, not shared across workers) ─────────────────────
_current_port:   Optional[str]   = None
_device_status:  str             = "UNKNOWN"   # CONNECTED / DISCONNECTED / UNKNOWN
_last_packet:    Optional[dict]  = None
_last_seen:      Optional[float] = None        # time.time()
_on_packet_cb:   Optional[Callable[[ESP32Packet], None]] = None


# ─── Public accessors ─────────────────────────────────────────────────────────

def get_device_status() -> dict:
    age = round(time.time() - _last_seen, 1) if _last_seen else None
    return {
        "device_id":          settings.device_id,
        "status":             _device_status,
        "serial_port":        _current_port,
        "last_seen":          datetime.fromtimestamp(_last_seen, tz=timezone.utc).isoformat() if _last_seen else None,
        "last_reading_age_s": age,
    }


def get_last_packet() -> Optional[dict]:
    return _last_packet


def set_packet_callback(cb: Callable[[ESP32Packet], None]) -> None:
    """Register a callback that is called for every valid parsed packet."""
    global _on_packet_cb
    _on_packet_cb = cb


# ─── Port discovery ───────────────────────────────────────────────────────────

def list_ports() -> list[dict]:
    """Return all available serial ports with metadata."""
    ports = []
    for p in serial.tools.list_ports.comports():
        ports.append({
            "port":        p.device,
            "description": p.description or "",
            "vid":         p.vid,
            "pid":         p.pid,
            "hwid":        p.hwid or "",
        })
    return ports


def find_esp32_port() -> Optional[str]:
    """
    Scan COM ports and return the most likely ESP32 port.
    Uses USB VID matching first, then falls back to description hints.
    Returns None if no candidate is found.
    """
    candidates = []
    for p in serial.tools.list_ports.comports():
        score = 0

        # Strong signal: USB VID matches known ESP32 USB chips
        if p.vid in ESP32_USB_VIDS:
            score += 10

        # Weaker signal: description contains known strings
        desc_lower = (p.description or "").lower()
        for hint in ESP32_DESCRIPTION_HINTS:
            if hint in desc_lower:
                score += 5
                break

        if score > 0:
            candidates.append((score, p.device))

    if not candidates:
        return None

    # Return the highest-scoring port
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]


def resolve_port() -> Optional[str]:
    """
    Determine which serial port to use.
    - If SERIAL_PORT=AUTO → auto-detect ESP32
    - Otherwise use the configured port directly
    """
    if settings.serial_port.upper() == "AUTO":
        port = find_esp32_port()
        if port:
            logger.info(f"ESP32 auto-detected on {port}")
        else:
            logger.warning("ESP32 not detected on any COM port. Is it plugged in?")
        return port
    else:
        logger.info(f"Using configured port: {settings.serial_port}")
        return settings.serial_port


# ─── JSON parsing ─────────────────────────────────────────────────────────────

def parse_json_line(raw_line: str) -> Optional[ESP32Packet]:
    """
    Parse a raw serial line as a JSON ESP32Packet.
    Returns None and logs the error for any malformed input — never raises.
    """
    line = raw_line.strip()
    if not line or not line.startswith("{"):
        # Startup banners, diagnostics, empty lines — silently ignore
        return None

    try:
        data = json.loads(line)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from serial: {e} | raw: {line[:120]}")
        return None

    try:
        packet = ESP32Packet(**data)
        return packet
    except Exception as e:
        logger.error(f"Sensor validation failed: {e} | raw: {line[:120]}")
        return None


# ─── Mock sensor mode ─────────────────────────────────────────────────────────

def _generate_mock_packet() -> ESP32Packet:
    """Generate a realistic fake sensor packet for development without hardware."""
    return ESP32Packet(
        device_id        = settings.device_id,
        timestamp        = None,
        soil_moisture    = round(random.uniform(40.0, 75.0), 1),
        soil_temperature = round(random.uniform(22.0, 32.0), 1),
        soil_ph          = None,
        soil_ec          = None,
        air_temperature  = round(random.uniform(28.0, 38.0), 1),
        humidity         = round(random.uniform(50.0, 80.0), 1),
        light_lux        = round(random.uniform(1000.0, 80000.0), 0),
        sensor_status    = SensorStatus(
            soil_moisture    = "ok",
            soil_temperature = "ok",
            soil_ph          = "unavailable",
            soil_ec          = "unavailable",
            air_temperature  = "ok",
            humidity         = "ok",
            light_lux        = "ok",
        ),
    )


# ─── Background task ──────────────────────────────────────────────────────────

async def serial_reader_task() -> None:
    """
    Long-running asyncio task.
    - Opens the serial port.
    - Reads JSON Lines continuously.
    - On disconnect: updates status, waits, retries.
    - On valid packet: updates globals, fires callback.
    - Never propagates exceptions to the FastAPI event loop.
    """
    global _current_port, _device_status, _last_packet, _last_seen

    # ── Mock mode ─────────────────────────────────────────────────────────────
    if settings.mock_serial:
        logger.warning("MOCK_SERIAL=true — generating fake sensor data. Disable in production!")
        while True:
            packet = _generate_mock_packet()
            _last_packet = packet.model_dump()
            _last_seen   = time.time()
            _device_status = "CONNECTED"
            _current_port  = "MOCK"
            if _on_packet_cb:
                try:
                    _on_packet_cb(packet)
                except Exception as e:
                    logger.error(f"Packet callback error: {e}")
            await asyncio.sleep(settings.serial_baud and 5)   # 5s mock interval
        return

    # ── Real serial loop ──────────────────────────────────────────────────────
    logger.info("Serial reader task started.")

    while True:
        port = resolve_port()

        if not port:
            if _device_status != "DISCONNECTED":
                _device_status = "DISCONNECTED"
                _current_port  = None
                logger.warning("No ESP32 found. Retrying in 10 s...")
            await asyncio.sleep(10)
            continue

        # ── Attempt to open the port ──────────────────────────────────────────
        try:
            ser = serial.Serial(
                port=port,
                baudrate=settings.serial_baud,
                timeout=2.0,
            )
            _current_port  = port
            _device_status = "CONNECTED"
            logger.info(f"Serial connection established on {port} @ {settings.serial_baud} baud.")
        except serial.SerialException as e:
            logger.error(f"Cannot open {port}: {e}. Retrying in 10 s...")
            _device_status = "DISCONNECTED"
            await asyncio.sleep(10)
            continue

        # ── Read loop ─────────────────────────────────────────────────────────
        try:
            while True:
                # Use run_in_executor to avoid blocking the event loop
                raw = await asyncio.get_event_loop().run_in_executor(
                    None, _readline_safe, ser
                )

                if raw is None:
                    # Port was closed externally / device removed
                    break

                packet = parse_json_line(raw)
                if packet is None:
                    continue

                # ── Valid packet received ─────────────────────────────────────
                logger.info(
                    f"Received packet from {packet.device_id} | "
                    f"moisture={packet.soil_moisture} temp={packet.soil_temperature} "
                    f"rh={packet.humidity} lux={packet.light_lux}"
                )
                _last_packet   = packet.model_dump()
                _last_seen     = time.time()
                _device_status = "CONNECTED"

                if _on_packet_cb:
                    try:
                        _on_packet_cb(packet)
                    except Exception as e:
                        logger.error(f"Packet callback error: {e}")

        except serial.SerialException as e:
            logger.error(f"Serial read error on {port}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in serial reader: {e}")
        finally:
            try:
                if ser.is_open:
                    ser.close()
            except Exception:
                pass
            _device_status = "DISCONNECTED"
            _current_port  = None
            logger.warning(f"ESP32 disconnected from {port}. Scanning for reconnection in 5 s...")
            await asyncio.sleep(5)


def _readline_safe(ser: serial.Serial) -> Optional[str]:
    """
    Read one line from the serial port.
    Returns None if the port is closed/disconnected.
    Blocks for up to ser.timeout seconds then returns empty string.
    """
    try:
        raw_bytes = ser.readline()
        if not raw_bytes:
            return ""
        return raw_bytes.decode("utf-8", errors="replace")
    except serial.SerialException:
        return None
    except Exception:
        return None
