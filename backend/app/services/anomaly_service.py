# =============================================================================
# MARUDAM Backend — Anomaly Service
# =============================================================================
# Ported and adapted from the original SQLite-based decision engine (legacy/).
#
# Architecture:
#   - Maintains an in-memory adaptive baseline per sensor.
#   - Compares each new reading to the baseline.
#   - Tracks persistence (how many consecutive out-of-range readings).
#   - Performs multi-sensor evidence fusion.
#   - Generates anomaly records which are stored in Supabase.
#
# Design principle: MODULAR and REPLACEABLE.
#   Your AI teammates can swap the anomaly detection algorithm by replacing
#   the detect() function while keeping the rest of the pipeline intact.
# =============================================================================
from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.models.sensor import SensorReading
from app.utils.logger import get_logger
import app.services.supabase_service as supa

logger = get_logger("anomaly_service")


# ─── Risk Levels ─────────────────────────────────────────────────────────────
RISK_LEVELS = ["NORMAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"]


# ─── Per-Sensor Baseline State ────────────────────────────────────────────────

@dataclass
class SensorBaseline:
    """Adaptive baseline for a single sensor using exponential smoothing."""
    sensor:             str
    center:             float
    min_expected:       float
    max_expected:       float
    confidence:         float = 0.1    # 0 = no data, 1 = fully calibrated
    observations:       int   = 0
    persistence_count:  int   = 0      # consecutive out-of-range readings
    alpha:              float = 0.05   # EWM learning rate

    def update(self, value: float) -> None:
        """Update baseline toward the new in-range value."""
        self.center = self.alpha * value + (1 - self.alpha) * self.center
        half_range  = (self.max_expected - self.min_expected) / 2.0
        self.min_expected = self.center - half_range
        self.max_expected = self.center + half_range
        self.observations += 1
        self.persistence_count = 0
        if self.confidence < 0.95:
            self.confidence = min(0.95, self.confidence + 0.02)

    def is_out_of_range(self, value: float) -> bool:
        threshold = self._threshold()
        return abs(value - self.center) > threshold

    def deviation(self, value: float) -> float:
        return value - self.center

    def _threshold(self) -> float:
        thresholds = {
            "soil_moisture":    settings.threshold_soil_moisture,
            "soil_temperature": settings.threshold_soil_temperature,
            "air_temperature":  settings.threshold_air_temperature,
            "humidity":         settings.threshold_humidity,
            "light_lux":        settings.threshold_light_lux,
        }
        return thresholds.get(self.sensor, 10.0)


# ─── Global Baseline Store ────────────────────────────────────────────────────

# Sensible crop-neutral defaults for initial priors.
# These are replaced quickly by real readings.
_INITIAL_PRIORS: dict[str, dict] = {
    "soil_moisture":    {"center": 50.0, "min_expected": 35.0,  "max_expected": 65.0},
    "soil_temperature": {"center": 25.0, "min_expected": 15.0,  "max_expected": 35.0},
    "air_temperature":  {"center": 30.0, "min_expected": 20.0,  "max_expected": 40.0},
    "humidity":         {"center": 65.0, "min_expected": 40.0,  "max_expected": 85.0},
    "light_lux":        {"center": 40000.0, "min_expected": 0.0, "max_expected": 100000.0},
}

_baselines: dict[str, SensorBaseline] = {}


def _get_baseline(sensor: str) -> SensorBaseline:
    if sensor not in _baselines:
        prior = _INITIAL_PRIORS.get(sensor, {"center": 50.0, "min_expected": 0.0, "max_expected": 100.0})
        _baselines[sensor] = SensorBaseline(
            sensor       = sensor,
            center       = prior["center"],
            min_expected = prior["min_expected"],
            max_expected = prior["max_expected"],
        )
    return _baselines[sensor]


# ─── Evidence ────────────────────────────────────────────────────────────────

@dataclass
class Evidence:
    code:    str
    sensor:  Optional[str] = None
    value:   Optional[float] = None
    message: str = ""


# ─── Anomaly Detection ───────────────────────────────────────────────────────

@dataclass
class AnomalyResult:
    """Result of anomaly analysis for a single sensor reading packet."""
    device_id:   str
    timestamp:   datetime
    risk_level:  str = "NORMAL"
    evidence:    list[Evidence] = field(default_factory=list)
    field_status: str = "NORMAL"         # NORMAL | WATCH | ATTENTION | UNCERTAIN
    recommendation: str = "MONITOR"


SENSORS_TO_MONITOR = [
    "soil_moisture",
    "soil_temperature",
    "air_temperature",
    "humidity",
    "light_lux",
]


def detect(reading: SensorReading) -> AnomalyResult:
    """
    Main anomaly detection entry point.
    Analyses one SensorReading, updates baselines, and returns an AnomalyResult.
    Also writes any detected anomalies to Supabase.

    ─── MODULAR DESIGN ─────────────────────────────────────────────────────────
    To replace this algorithm, implement a function with the same signature:
        def detect(reading: SensorReading) -> AnomalyResult
    and swap the import in the API layer.
    ────────────────────────────────────────────────────────────────────────────
    """
    result = AnomalyResult(
        device_id  = reading.device_id,
        timestamp  = reading.timestamp,
    )

    max_risk_idx = 0   # track the worst sensor for final risk_level

    sensor_values: dict[str, Optional[float]] = {
        "soil_moisture":    reading.soil_moisture,
        "soil_temperature": reading.soil_temperature,
        "air_temperature":  reading.air_temperature,
        "humidity":         reading.humidity,
        "light_lux":        reading.light_lux,
    }

    # ── Per-sensor baseline update & event detection ──────────────────────────
    for sensor, value in sensor_values.items():
        if value is None:
            # Sensor not available — skip baseline update, not an anomaly
            continue

        baseline = _get_baseline(sensor)

        if baseline.is_out_of_range(value):
            baseline.persistence_count += 1
            dev = baseline.deviation(value)

            # Risk scales with persistence
            if baseline.persistence_count >= 5:
                risk_idx = 4   # CRITICAL
            elif baseline.persistence_count >= 3:
                risk_idx = 3   # HIGH
            elif baseline.persistence_count >= 2:
                risk_idx = 2   # MEDIUM
            else:
                risk_idx = 1   # LOW

            max_risk_idx = max(max_risk_idx, risk_idx)

            ev = Evidence(
                code    = f"{sensor.upper()}_{'ABOVE' if dev > 0 else 'BELOW'}_BASELINE",
                sensor  = sensor,
                value   = value,
                message = (
                    f"{sensor} = {value:.1f} (baseline center: {baseline.center:.1f}, "
                    f"expected: {baseline.min_expected:.1f}–{baseline.max_expected:.1f})"
                ),
            )
            result.evidence.append(ev)

            # Write individual anomaly to Supabase
            supa.upsert_anomaly(
                device_id      = reading.device_id,
                sensor         = sensor,
                observed_value = value,
                expected_value = baseline.center,
                deviation      = dev,
                risk_level     = RISK_LEVELS[risk_idx],
                message        = ev.message,
            )
            logger.info(
                f"Anomaly [{RISK_LEVELS[risk_idx]}] {ev.code}: "
                f"{value:.1f} (persistence={baseline.persistence_count})"
            )

        else:
            # In-range — update baseline, reset persistence counter
            baseline.update(value)

    # ── Multi-sensor fusion: water stress indicator ───────────────────────────
    # Low soil moisture + high air temperature + low humidity → stronger signal
    sm  = sensor_values.get("soil_moisture")
    at  = sensor_values.get("air_temperature")
    rh  = sensor_values.get("humidity")

    sm_bl = _get_baseline("soil_moisture")
    at_bl = _get_baseline("air_temperature")
    rh_bl = _get_baseline("humidity")

    water_stress_signals = 0
    if sm  is not None and sm_bl.is_out_of_range(sm)  and sm_bl.deviation(sm) < 0:
        water_stress_signals += 1
    if at  is not None and at_bl.is_out_of_range(at)  and at_bl.deviation(at) > 0:
        water_stress_signals += 1
    if rh  is not None and rh_bl.is_out_of_range(rh)  and rh_bl.deviation(rh) < 0:
        water_stress_signals += 1

    if water_stress_signals >= 2:
        result.evidence.append(Evidence(
            code    = "WATER_STRESS_MULTI_SENSOR",
            message = f"Water stress indicated by {water_stress_signals} concurrent sensors",
        ))
        max_risk_idx = max(max_risk_idx, 2)   # at least MEDIUM for fusion

    # ── Finalize result ───────────────────────────────────────────────────────
    result.risk_level = RISK_LEVELS[max_risk_idx]

    if max_risk_idx == 0:
        result.field_status   = "NORMAL"
        result.recommendation = "MONITOR"
    elif max_risk_idx <= 2:
        result.field_status   = "WATCH"
        result.recommendation = "OBSERVE"
    elif max_risk_idx == 3:
        result.field_status   = "ATTENTION"
        result.recommendation = "CONSIDER_IRRIGATION" if water_stress_signals >= 1 else "CHECK_FIELD"
    else:
        result.field_status   = "CRITICAL"
        result.recommendation = "IMMEDIATE_ACTION"

    if result.risk_level != "NORMAL":
        logger.info(
            f"Analysis complete: {result.field_status} / {result.risk_level} / "
            f"{result.recommendation} | {len(result.evidence)} evidence items"
        )

    return result


def get_baselines() -> dict:
    """Return current baseline state for all monitored sensors (for API)."""
    return {
        sensor: {
            "center":        b.center,
            "min_expected":  b.min_expected,
            "max_expected":  b.max_expected,
            "confidence":    b.confidence,
            "observations":  b.observations,
            "persistence":   b.persistence_count,
        }
        for sensor, b in _baselines.items()
    }
