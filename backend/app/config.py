# =============================================================================
# MARUDAM Backend — Configuration
# =============================================================================
# All settings are loaded from environment variables (via .env file).
# Never hard-code secrets here.
# =============================================================================
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Supabase ──────────────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # ── Device ────────────────────────────────────────────────────────────────
    device_id: str = "MARUDAM-01"

    # ── Serial Port ───────────────────────────────────────────────────────────
    # "AUTO" → scan and auto-detect the ESP32.
    # "COM6" → use a specific port (override for difficult setups).
    serial_port: str = "AUTO"
    serial_baud: int = 115200

    # ── Mock Mode ─────────────────────────────────────────────────────────────
    # Set MOCK_SERIAL=true to generate fake sensor data without an ESP32.
    # MUST be false in production / Vercel.
    mock_serial: bool = False

    # ── Server ────────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"

    # ── Anomaly thresholds (configurable, not hard-coded) ────────────────────
    # Threshold = how many units from baseline center triggers an event.
    threshold_soil_moisture: float = 8.0
    threshold_soil_temperature: float = 5.0
    threshold_air_temperature: float = 15.0
    threshold_humidity: float = 15.0
    threshold_light_lux: float = 50000.0

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


# Singleton settings instance — import this everywhere
settings = Settings()
