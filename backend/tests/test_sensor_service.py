# =============================================================================
# MARUDAM Backend — Tests: Sensor Service
# =============================================================================
import pytest
from datetime import datetime, timezone
from app.models.sensor import ESP32Packet, SensorStatus
from app.services.sensor_service import normalise_packet


class TestNormalisePacket:

    def _make_packet(self, **kwargs) -> ESP32Packet:
        defaults = {
            "device_id": "MARUDAM-01",
            "soil_moisture": 55.0,
        }
        defaults.update(kwargs)
        return ESP32Packet(**defaults)

    def test_applies_utc_timestamp(self):
        """Normalisation must always apply a server-side UTC timestamp."""
        pkt = self._make_packet(timestamp=None)
        result = normalise_packet(pkt)
        assert result.timestamp is not None
        assert result.timestamp.tzinfo is not None
        assert result.timestamp.tzinfo == timezone.utc

    def test_ignores_esp32_timestamp(self):
        """The ESP32 timestamp (boot-relative) must be ignored."""
        pkt = self._make_packet(timestamp="1970-01-01T00:00:00Z")
        result = normalise_packet(pkt)
        # The result timestamp must be recent (within last 10 seconds)
        age = (datetime.now(tz=timezone.utc) - result.timestamp).total_seconds()
        assert age < 10

    def test_preserves_sensor_values(self):
        pkt = self._make_packet(
            soil_moisture=62.4,
            soil_temperature=28.5,
            air_temperature=32.1,
            humidity=67.2,
            light_lux=450.0,
        )
        result = normalise_packet(pkt)
        assert result.soil_moisture == pytest.approx(62.4)
        assert result.soil_temperature == pytest.approx(28.5)
        assert result.air_temperature == pytest.approx(32.1)
        assert result.humidity == pytest.approx(67.2)
        assert result.light_lux == pytest.approx(450.0)

    def test_null_sensors_preserved(self):
        pkt = self._make_packet(soil_ph=None, soil_ec=None, light_lux=None)
        result = normalise_packet(pkt)
        assert result.soil_ph is None
        assert result.soil_ec is None
        assert result.light_lux is None

    def test_sensor_status_defaults_when_absent(self):
        """Missing sensor_status in packet should default to empty SensorStatus."""
        pkt = self._make_packet()
        assert pkt.sensor_status is None
        result = normalise_packet(pkt)
        assert result.sensor_status is not None

    def test_sensor_status_preserved(self):
        pkt = self._make_packet(
            sensor_status=SensorStatus(
                soil_moisture="ok",
                soil_temperature="error",
                soil_ph="unavailable",
                soil_ec="unavailable",
                air_temperature="ok",
                humidity="ok",
                light_lux="ok",
            )
        )
        result = normalise_packet(pkt)
        assert result.sensor_status.soil_temperature == "error"
        assert result.sensor_status.soil_ph == "unavailable"
