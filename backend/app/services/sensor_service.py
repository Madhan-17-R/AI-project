# =============================================================================
# MARUDAM Backend — Sensor Service
# =============================================================================
# Converts an ESP32Packet into a normalised SensorReading with a UTC timestamp.
# Applies server-side timestamp because the ESP32 has no real-time clock.
# =============================================================================
from __future__ import annotations

from datetime import datetime, timezone

from app.models.sensor import ESP32Packet, SensorReading, SensorStatus
from app.services import supabase_service
from app.services import soil_dataset_service
from app.utils.logger import get_logger

logger = get_logger("sensor_service")


from app.config import settings

def normalise_packet(packet: ESP32Packet) -> SensorReading:
    """
    Convert a validated ESP32Packet into a SensorReading.
    - Applies a server-side UTC timestamp (ESP32 has no RTC).
    - Injects median reference pH/EC from soil dataset based on crop.
    - Overrides hardware device_id with logical backend DEVICE_ID.
    - Carries forward sensor_status from the packet.
    """
    logical_device_id = settings.device_id
    logger.debug(f"Normalising packet from hardware {packet.device_id} -> logical {logical_device_id}")
    
    soil_ph = packet.soil_ph
    soil_ec = packet.soil_ec
    
    try:
        # Inject Dataset Reference Values if not physically measured
        if soil_ph is None or soil_ec is None:
            client = supabase_service.get_client()
            if client:
                farm_res = client.table("farms").select("crop_id").eq("device_id", logical_device_id).limit(1).execute()
                if farm_res.data:
                    crop_id = farm_res.data[0].get("crop_id")
                    if crop_id:
                        ref_ph, ref_ec = soil_dataset_service.get_crop_soil_reference(crop_id)
                        if soil_ph is None and ref_ph is not None:
                            soil_ph = ref_ph
                        if soil_ec is None and ref_ec is not None:
                            soil_ec = ref_ec
    except Exception as e:
        logger.error(f"Failed to resolve soil dataset reference for {logical_device_id}: {e}")

    return SensorReading(
        device_id        = logical_device_id,
        timestamp        = datetime.now(tz=timezone.utc),
        soil_moisture    = packet.soil_moisture,
        soil_temperature = packet.soil_temperature,
        soil_ph          = soil_ph,
        soil_ec          = soil_ec,
        air_temperature  = packet.air_temperature,
        humidity         = packet.humidity,
        light_lux        = packet.light_lux,
        sensor_status    = packet.sensor_status or SensorStatus(),
    )

