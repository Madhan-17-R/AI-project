# =============================================================================
# MARUDAM Backend — Sensor Service
# =============================================================================
# Converts an ESP32Packet into a normalised SensorReading with a UTC timestamp.
# Applies server-side timestamp because the ESP32 has no real-time clock.
# =============================================================================
from __future__ import annotations

from datetime import datetime, timezone

from app.models.sensor import ESP32Packet, SensorReading, SensorStatus
from app.utils.logger import get_logger

logger = get_logger("sensor_service")


def normalise_packet(packet: ESP32Packet) -> SensorReading:
    """
    Convert a validated ESP32Packet into a SensorReading.
    - Applies a server-side UTC timestamp (ESP32 has no RTC).
    - Carries forward sensor_status from the packet.
    """
    logger.debug(f"Normalising packet from {packet.device_id}")

    return SensorReading(
        device_id        = packet.device_id,
        timestamp        = datetime.now(tz=timezone.utc),
        soil_moisture    = packet.soil_moisture,
        soil_temperature = packet.soil_temperature,
        soil_ph          = packet.soil_ph,
        soil_ec          = packet.soil_ec,
        air_temperature  = packet.air_temperature,
        humidity         = packet.humidity,
        light_lux        = packet.light_lux,
        sensor_status    = packet.sensor_status or SensorStatus(),
    )
