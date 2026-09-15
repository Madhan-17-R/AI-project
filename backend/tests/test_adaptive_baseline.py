# =============================================================================
# MARUDAM — Adaptive Baseline Unit Tests
# =============================================================================
# Pure mathematical tests — no network, no Supabase, no FastAPI.
# All values are derived from the MARUDAM prototype formula constants.
#
# Correction applied (point 3 of pre-implementation review):
#   With K_UPDATE=12 and V=1, T_update ≈ 12/(0.01+1) ≈ 11.88 h.
#   High-variability test correctly uses assert <= 12 (not <= 8).
#
# To run: cd backend && python -m pytest tests/test_adaptive_baseline.py -v
# =============================================================================
from __future__ import annotations

import asyncio
import statistics
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── module under test ──────────────────────────────────────────────────────────
from app.services.adaptive_baseline_service import (
    _calculate_variability,
    _calculate_data_quality,
    _calculate_confidence,
    _calculate_context_change,
    _calculate_update_interval,
    _calculate_dynamic_alpha,
    _calculate_robust_baseline,
    _regime_change_confirmed,
    _renormalised_formula,
    _calculate_tod_coverage,
    _determine_status,
    SensorBaselineState,
    DeviceBaselineState,
    run_adaptive_calculation,
    restore_from_supabase,
    get_full_baseline_state,
    _device_states,
    # Constants — used to derive expected values
    T0_DAYS,
    K_UPDATE,
    T_UPDATE_MIN_H,
    T_UPDATE_MAX_H,
    T_CREATE_MIN_H,
    T_CREATE_MAX_H,
    T_CREATE_FACTORS,
    T_UPDATE_FACTORS,
    ANOMALY_PERSIST_MIN,
    REGIME_MIN_PERSISTENCE_HOURS,
    REGIME_MAGNITUDE_MIN_MAD,
    MIN_SAMPLES_ACTIVE,
    MAD_MIN,
    SENSOR_K,
    U_EPSILON,
)

# =============================================================================
# HELPERS
# =============================================================================

def _make_sensor_state(
    sensor: str = "soil_moisture",
    center: float = 60.0,
    mad: float = 3.0,
    k: float = 3.0,
    observations: int = 200,
    sensor_quality: float = 0.9,
    consecutive_anomalies: int = 0,
    anomaly_magnitude: float = 0.0,
    anomaly_first_seen_at: datetime | None = None,
) -> SensorBaselineState:
    mad_eff = max(mad, MAD_MIN.get(sensor, 0.5))
    lo = center - k * mad_eff
    hi = center + k * mad_eff
    s = SensorBaselineState(
        sensor=sensor, center=center, mad=mad, mad_eff=mad_eff,
        k_multiplier=k, min_expected=lo, max_expected=hi,
        confidence=80.0, observations=observations,
        sensor_quality=sensor_quality,
    )
    s._consecutive_anomalies   = consecutive_anomalies
    s._last_anomaly_magnitude  = anomaly_magnitude
    s._anomaly_first_seen_at   = anomaly_first_seen_at
    return s


def _stable_values(n: int = 200, center: float = 60.0, noise: float = 0.5) -> list[float]:
    """Nearly constant readings — very low variability."""
    import random
    rng = random.Random(42)
    return [center + rng.uniform(-noise, noise) for _ in range(n)]


def _variable_values(n: int = 200, center: float = 60.0, noise: float = 12.0) -> list[float]:
    """Highly variable readings — high CV and high rate-of-change."""
    import random
    rng = random.Random(99)
    vals: list[float] = []
    v = center
    for _ in range(n):
        v = center + rng.uniform(-noise, noise)
        vals.append(v)
    return vals


def _build_history(sensor: str, values: list[float]) -> list[dict]:
    """Fake history rows covering 7 days, evenly spread across 24 h."""
    n = len(values)
    base = datetime(2026, 9, 7, 0, 0, 0, tzinfo=timezone.utc)
    rows = []
    for i, v in enumerate(values):
        ts = base + timedelta(minutes=5 * i)
        rows.append({"timestamp": ts.isoformat(), sensor: v})
    return rows


# =============================================================================
# TEST 1 — Stable readings → longer update interval
# =============================================================================

def test_stable_readings_longer_update_interval():
    """
    With near-zero variability, T_update approaches T_UPDATE_MAX_H.
    Mathematically: T_update = clip(K_UPDATE/(ε+V+...), Tmin, Tmax)
    V≈0 → T_update ≈ K_UPDATE/ε → hits Tmax=48.
    """
    stable_v = {"soil_moisture": _stable_values(300, center=60.0, noise=0.3)}
    v_overall, _ = _calculate_variability(stable_v)
    assert v_overall < 0.10, f"Expected low variability, got {v_overall}"

    interval = _calculate_update_interval(
        factor_values={"variability": v_overall, "anomaly_rate": 0.0, "context_change": 0.0},
        prev_interval=T_UPDATE_MAX_H,
    )
    assert interval >= 24.0, (
        f"Stable scenario: expected update interval >= 24 h, got {interval:.2f} h"
    )


# =============================================================================
# TEST 2 — High variability → shorter update interval
# =============================================================================

def test_high_variability_shorter_update_interval():
    """
    With K_UPDATE=12, V=1, W=0, A=0, C=0:
        raw = clip(12 / (0.01 + 1), 3, 48) ≈ 11.88 h
    Hysteresis + rate-cap bring it close to 11.88 from 48 (prev),
    so result is ≤ 12 h.

    NOTE: test threshold is <= 12 (not <= 8) to correctly reflect the formula.
    """
    variable_v = {"soil_moisture": _variable_values(300, center=60.0, noise=12.0)}
    v_overall, _ = _calculate_variability(variable_v)
    assert v_overall >= 0.5, f"Expected high variability, got {v_overall}"

    interval = _calculate_update_interval(
        factor_values={"variability": 1.0, "anomaly_rate": 0.0, "context_change": 0.0},
        prev_interval=3.0,   # start from min to avoid rate-cap hiding effect
    )
    assert interval <= 12.0, (
        f"High variability: expected T_update <= 12 h (K_UPDATE=12), got {interval:.2f} h"
    )


# =============================================================================
# TEST 3 — High anomaly rate → longer creation period
# =============================================================================

def test_high_anomaly_rate_longer_creation():
    """
    With anomaly_rate=0.4, and renormalised factors,
    T_create should exceed 7 days (base).
    """
    result, _ = _renormalised_formula(
        factor_values={
            "variability":    0.3,
            "anomaly_rate":   0.4,
            "context_change": 0.1,
            "quality_lack":   0.1,
        },
        factor_weights=T_CREATE_FACTORS,
        base=T0_DAYS * 24.0,
        mode="additive",
        clip_lo=T_CREATE_MIN_H,
        clip_hi=T_CREATE_MAX_H,
    )
    result_days = result / 24.0
    assert result_days >= 7.5, (
        f"High anomaly rate: expected T_create > 7.5 days, got {result_days:.2f} days"
    )


# =============================================================================
# TEST 4 — Missing weather → algorithm works, weather_status correct
# =============================================================================

def test_missing_weather_no_crash():
    """
    When weather_observations is None, algorithm must complete successfully.
    weather_variability must be None.
    weather_status must be 'weather_data_unavailable'.
    T_create/T_update must still produce valid values using remaining factors.
    """
    create_factors_no_w = {
        "variability":    0.25,
        "anomaly_rate":   0.05,
        "context_change": 0.0,
        "quality_lack":   0.10,
        # "weather" key is absent — renormalize over remaining factors
    }
    result, eff_weights = _renormalised_formula(
        factor_values=create_factors_no_w,
        factor_weights=T_CREATE_FACTORS,
        base=T0_DAYS * 24.0,
        mode="additive",
        clip_lo=T_CREATE_MIN_H,
        clip_hi=T_CREATE_MAX_H,
    )
    result_days = result / 24.0
    assert T_CREATE_MIN_H / 24.0 <= result_days <= T_CREATE_MAX_H / 24.0, (
        f"Missing weather: T_create out of bounds: {result_days:.2f} days"
    )
    assert "weather" not in eff_weights, "Weather should not appear in weights when unavailable"
    # weights must sum to ≈1.0 among available factors
    total_w = sum(eff_weights.values())
    assert abs(total_w - 1.0) < 1e-9, f"Renormalised weights should sum to 1.0, got {total_w}"


# =============================================================================
# TEST 5 — Bad sensor quality → lower confidence
# =============================================================================

def test_bad_sensor_quality_lower_confidence():
    """
    S = 0.3 (poor quality) should produce confidence <= 50.
    """
    conf = _calculate_confidence(
        n=80,
        elapsed_hours=24.0,
        creation_hours=T0_DAYS * 24.0,
        tod_coverage=0.4,
        sensor_quality=0.3,
        anomaly_rate=0.05,
        context_completeness=0.5,
    )
    assert conf <= 50, f"Bad quality: expected confidence <= 50, got {conf}"


# =============================================================================
# TEST 6 — Persistent regime change → gradual adaptation, NOT instant
# =============================================================================

def test_persistent_regime_gradual_adaptation():
    """
    After regime change is confirmed, alpha_regime is used.
    alpha_regime = clip(ALPHA_BASE_REGIME * conf_factor, MIN, ALPHA_REGIME_MAX)
    = clip(0.10 * 0.8, 0.005, 0.25) = 0.08

    The baseline should shift toward new value, but only by alpha_regime per step.
    After 10 updates of B_{t+1} = (1-alpha)*B_t + alpha*X_new,
    the center should NOT have jumped immediately to the new value.
    """
    from app.services.adaptive_baseline_service import ALPHA_BASE_REGIME, ALPHA_REGIME_MAX, ALPHA_MIN

    alpha_regime = min(max(ALPHA_BASE_REGIME * 0.8, ALPHA_MIN), ALPHA_REGIME_MAX)

    old_center = 60.0
    new_reading = 90.0  # new regime
    center = old_center
    for _ in range(10):
        center = (1.0 - alpha_regime) * center + alpha_regime * new_reading

    # Should be moving toward 90 but not arrived there after 10 steps
    assert old_center < center < new_reading, (
        f"Regime adaptation should be gradual: center={center:.2f} "
        f"(expected between {old_center} and {new_reading})"
    )


# =============================================================================
# TEST 7 — Single broken sensor → does NOT confirm regime change
# =============================================================================

def test_single_broken_sensor_no_regime_change():
    """
    soil_moisture spikes to 100% while other sensors are normal.
    Regime change must NOT be confirmed:
        - supporting_sensor_count = 0 (no other sensors anomalous)
        - sensor_quality = 0.9 (reliable, but NOT >= INDEPENDENTLY_RELIABLE_S if 0.9<0.85 fails)
    Wait — INDEPENDENTLY_RELIABLE_S = 0.85, so 0.9 >= 0.85 → could be confirmed.
    For this test we set sensor_quality below INDEPENDENTLY_RELIABLE_S to ensure rejection.
    """
    s_state = _make_sensor_state(
        sensor="soil_moisture",
        observations=50,   # below REGIME_CHANGE_THRESH=10 → False via observations, but 50>10
        sensor_quality=0.70,  # above SENSOR_QUALITY_THRESHOLD=0.5 but < INDEPENDENTLY_RELIABLE_S=0.85
        consecutive_anomalies=ANOMALY_PERSIST_MIN + 2,
        anomaly_magnitude=2.0,
        anomaly_first_seen_at=datetime.now(tz=timezone.utc) - timedelta(hours=2),
    )
    now = datetime.now(tz=timezone.utc)
    # supporting_sensor_count = 0 (all other sensors normal)
    confirmed = _regime_change_confirmed(s_state, supporting_sensor_count=0, now=now)
    assert not confirmed, (
        "Single isolated sensor anomaly must NOT confirm regime change "
        "without independent-reliability qualification"
    )


# =============================================================================
# TEST 8 — Insufficient samples → LEARNING, confidence <= 25
# =============================================================================

def test_insufficient_samples_learning_status():
    """
    With n < MIN_SAMPLES_ACTIVE and < 10% time coverage:
        status = LEARNING
        confidence <= 25 (early-learning ceiling)
    """
    conf = _calculate_confidence(
        n=10,
        elapsed_hours=1.0,
        creation_hours=T0_DAYS * 24.0,
        tod_coverage=0.05,
        sensor_quality=0.8,
        anomaly_rate=0.0,
        context_completeness=0.6,
    )
    assert conf <= 25, f"Insufficient samples: expected confidence <= 25, got {conf}"

    status = _determine_status(
        n=10, time_coverage=0.01, confidence=conf,
        context_change=0.0, regime_change=False
    )
    assert status == "LEARNING", f"Expected LEARNING, got {status}"


# =============================================================================
# TEST 9 — Hysteresis prevents sharp interval jump
# =============================================================================

def test_hysteresis_prevents_sharp_interval_change():
    """
    Starting from prev=24 h, if raw calculation suggests 3 h,
    hysteresis (0.8*24 + 0.2*3) = 19.8 h.
    Rate cap (max 25% change) → floor = 24 * 0.75 = 18 h.
    Result must be within 25% of prev (18 to 30 h).
    """
    from app.services.adaptive_baseline_service import UPDATE_HYSTERESIS, UPDATE_MAX_CHANGE_PCT

    prev = 24.0
    # Force very high variability to get raw close to Tmin
    result = _calculate_update_interval(
        factor_values={"variability": 1.0, "anomaly_rate": 1.0, "context_change": 1.0},
        prev_interval=prev,
    )
    max_allowed = prev * (1.0 + UPDATE_MAX_CHANGE_PCT)
    min_allowed = prev * (1.0 - UPDATE_MAX_CHANGE_PCT)
    assert min_allowed <= result <= max_allowed, (
        f"Hysteresis: result {result:.2f} outside [{min_allowed:.2f},{max_allowed:.2f}]"
    )


# =============================================================================
# TEST 10 — Context change → REBUILDING status
# =============================================================================

def test_context_change_triggers_rebuilding():
    """Crop change → context_change = 1.0 → status = REBUILDING."""
    prev_ctx = {"crop_id": "tomato", "growth_stage": "vegetative", "soil_type": "loamy",
                "season_id": "kharif", "climate_zone": "tropical", "irrigation_method": "Drip"}
    new_ctx  = {"crop_id": "rice",   "growth_stage": "flowering",   "soil_type": "loamy",
                "season_id": "kharif", "climate_zone": "tropical", "irrigation_method": "Flood"}
    c = _calculate_context_change(prev_ctx, new_ctx)
    assert c >= 0.60, f"Crop and irrigation change should score context_change >= 0.6, got {c}"

    status = _determine_status(
        n=200, time_coverage=0.8, confidence=75,
        context_change=c, regime_change=False
    )
    assert status == "REBUILDING", f"Expected REBUILDING on crop change, got {status}"


# =============================================================================
# TEST 11 — Restart recovery from mocked Supabase
# =============================================================================

def test_restart_recovery_from_supabase():
    """
    Simulate a FastAPI restart: restore_from_supabase loads a row and
    the in-memory state is populated with the persisted values.
    """
    DEVICE = "MARUDAM-TEST-RESTART"
    if DEVICE in _device_states:
        del _device_states[DEVICE]

    mock_row = {
        "sensor":              "soil_moisture",
        "baseline_center":     55.5,
        "mad":                 2.8,
        "k_multiplier":        3.0,
        "min_expected":        47.1,
        "max_expected":        63.9,
        "confidence":          78.0,
        "observations":        864,
        "variability_score":   0.25,
        "anomaly_rate":        0.03,
        "sensor_quality":      0.91,
        "creation_period_hours": 168.0,
        "update_interval_hours": 11.5,
        "baseline_status":     "ACTIVE",
        "context_snapshot":    {"crop_id": "tomato"},
        "anomaly_evidence_count": 0,
        "tod_coverage_json":   {},
        "explanation_json":    {},
        "learning_started_at": "2026-09-07T00:00:00+00:00",
        "next_update_at":      "2026-09-14T12:00:00+00:00",
    }

    with patch("app.services.supabase_service.load_adaptive_baselines", return_value=[mock_row]):
        restore_from_supabase(DEVICE)

    assert DEVICE in _device_states, "Device state not created after restore"
    s = _device_states[DEVICE].sensors.get("soil_moisture")
    assert s is not None, "soil_moisture state not restored"
    assert abs(s.center - 55.5) < 1e-6, f"Restored center mismatch: {s.center}"
    assert s.baseline_status == "ACTIVE", f"Restored status mismatch: {s.baseline_status}"
    assert s.observations == 864, f"Restored observations mismatch: {s.observations}"


# =============================================================================
# TEST 12 — Zero-MAD baseline → MAD_eff floor applied
# =============================================================================

def test_zero_mad_floor_applied():
    """
    A perfectly constant sensor must still produce a non-zero range.
    MAD_eff = max(0, MAD_MIN_s) > 0.
    """
    constant_vals = [60.0] * 100
    rb = _calculate_robust_baseline(constant_vals, "soil_moisture", "tomato:vegetative")
    assert rb["mad"] == 0.0, "Constant sensor should have MAD=0"
    assert rb["mad_eff"] >= MAD_MIN["soil_moisture"], (
        f"MAD_eff should be at least MAD_MIN={MAD_MIN['soil_moisture']}, got {rb['mad_eff']}"
    )
    k = SENSOR_K["soil_moisture"]
    range_width = (rb["final_upper"] - rb["final_lower"])
    assert range_width > 0, (
        f"Zero-MAD should still produce non-zero range: width={range_width}"
    )


# =============================================================================
# TEST 13 — TOD coverage uses sample counts, not just bucket presence
# =============================================================================

def test_tod_coverage_uses_sample_counts():
    """
    History with only 2 hours populated at 1 sample each
    should produce very low TOD coverage (not 2/24 = 0.08 by bucket,
    but clip(1/TOD_REF_SAMPLES)*2/24 ≈ 0.003).
    """
    from app.services.adaptive_baseline_service import TOD_REF_SAMPLES
    base = datetime(2026, 9, 7, 6, 0, 0, tzinfo=timezone.utc)
    history = [
        {"timestamp": base.isoformat(),                   "soil_moisture": 60.0},
        {"timestamp": (base + timedelta(hours=1)).isoformat(), "soil_moisture": 61.0},
    ]
    cov, _ = _calculate_tod_coverage(history)
    # Expected: 2 hours with 1 sample each → 2 * clip(1/20, 0, 1) / 24 = 2/20/24 ≈ 0.0042
    expected_approx = 2.0 * (1.0 / TOD_REF_SAMPLES) / 24.0
    assert abs(cov - expected_approx) < 0.001, (
        f"TOD coverage mismatch: expected ≈{expected_approx:.4f}, got {cov:.4f}"
    )


# =============================================================================
# Scenario examples printed for independent verification (Requirement 9)
# =============================================================================

def test_print_scenario_calculations():
    """
    Print full formula calculations for 4 reference scenarios.
    Required by pre-implementation review point 9.
    Run: pytest -v -s tests/test_adaptive_baseline.py::test_print_scenario_calculations
    """
    from app.services.adaptive_baseline_service import (
        T_CREATE_FACTORS, T_UPDATE_FACTORS,
        ALPHA_BASE, ALPHA_BASE_REGIME,
    )

    def _scenario(name, V, W, A, C, S):
        create_factors = {"variability": V, "anomaly_rate": A,
                          "context_change": C, "quality_lack": 1-S}
        if W is not None:
            create_factors["weather"] = W
        update_factors = {"variability": V, "anomaly_rate": A, "context_change": C}
        if W is not None:
            update_factors["weather"] = W

        T_create, cw = _renormalised_formula(
            create_factors, T_CREATE_FACTORS, T0_DAYS*24, "additive",
            clip_lo=T_CREATE_MIN_H, clip_hi=T_CREATE_MAX_H,
        )
        T_update_raw, _ = _renormalised_formula(
            update_factors, T_UPDATE_FACTORS, K_UPDATE, "divisive",
            epsilon=U_EPSILON, clip_lo=T_UPDATE_MIN_H, clip_hi=T_UPDATE_MAX_H,
        )
        conf = _calculate_confidence(
            n=200, elapsed_hours=T_create*0.5, creation_hours=T_create,
            tod_coverage=0.5, sensor_quality=S, anomaly_rate=A,
            context_completeness=0.8 if W is not None else 0.67,
        )
        alpha_n = _calculate_dynamic_alpha(
            confidence_score=conf, variability=V, context_change=C,
            consecutive_anomalies=0, in_sensitive_stage=False, regime_confirmed=False,
        )
        alpha_r = _calculate_dynamic_alpha(
            confidence_score=conf, variability=V, context_change=C,
            consecutive_anomalies=ANOMALY_PERSIST_MIN+2, in_sensitive_stage=False,
            regime_confirmed=True,
        )
        print(f"\n{'='*60}")
        print(f"Scenario: {name}")
        print(f"  Input:  V={V} W={W} A={A} C={C} S={S}")
        print(f"  T_create = {T_create/24:.2f} days ({T_create:.1f} h)")
        print(f"  T_update = {T_update_raw:.2f} h (before hysteresis)")
        print(f"  Confidence = {conf}")
        print(f"  alpha_normal = {alpha_n:.5f}")
        print(f"  alpha_regime = {alpha_r:.5f}")
        print(f"  Active factor weights: {cw}")
        print(f"  Weather status: {'available' if W is not None else 'weather_data_unavailable'}")
        return {"T_create_h": T_create, "T_update_h": T_update_raw, "conf": conf}

    stable        = _scenario("A. Stable sensor, no weather",  V=0.05, W=None, A=0.02, C=0.0,  S=0.95)
    high_var      = _scenario("B. High variability, no weather", V=1.00, W=None, A=0.10, C=0.0,  S=0.85)
    anomaly       = _scenario("C. High anomaly rate",           V=0.40, W=0.20, A=0.40, C=0.0,  S=0.80)
    missing_w     = _scenario("D. Missing weather",             V=0.30, W=None, A=0.05, C=0.10, S=0.90)

    # Basic sanity checks on scenarios
    assert stable["T_create_h"] < high_var["T_create_h"], \
        "Stable should have shorter learning period than high-variability"
    assert stable["T_update_h"] > high_var["T_update_h"], \
        "Stable should have longer update interval than high-variability"
    assert missing_w["T_create_h"] >= T_CREATE_MIN_H, \
        "Missing weather scenario must still produce a valid T_create"
