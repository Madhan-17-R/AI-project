"""
Marudam Demo Script
===================
Demonstrates three scenarios by feeding real requests into the existing
FastAPI endpoints. The normal application pipeline (baseline learning,
event detection, root-zone estimation, evidence fusion) processes all
data. Nothing is written directly to the database.

Usage:
  python demo.py              # runs all 3 scenarios sequentially
  python demo.py --scenario 1 # run a specific scenario only

Requirements:
  - FastAPI backend must be running: python -m uvicorn main:app --port 8000
  - Next.js dashboard open at: http://localhost:3000/dashboard

IMPORTANT: This script feeds simulated field sensor readings.
           It does NOT bypass the decision engine.
           All results are visible on the live dashboard.
"""

import argparse
import requests
import sys
import time

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000/api"
DEVICE = "FIELD_001"

# ─── Helpers ──────────────────────────────────────────────────────────────────

def post_reading(moisture, surr_temp=30.0, humidity=60.0, light=50000, soil_temp=25.0):
    """Send a simulated sensor reading through the normal FastAPI pipeline."""
    payload = {
        "device_id": DEVICE,
        "soil_moisture": moisture,
        "soil_temperature": soil_temp,
        "light_intensity": light,
        "air_humidity": humidity,
        "surrounding_temperature": surr_temp,
    }
    try:
        r = requests.post(f"{BASE_URL}/sensors/readings", json=payload, timeout=5)
        r.raise_for_status()
    except Exception as e:
        print(f"  [WARN] Could not post reading: {e}")

def set_weather(temp, rain_prob, expected_rain):
    """Inject mock weather (clearly a test/simulation value)."""
    payload = {
        "device_id": DEVICE,
        "temperature": temp,
        "rain_probability": rain_prob,
        "expected_rain": expected_rain,
    }
    try:
        r = requests.post(f"{BASE_URL}/weather/mock", json=payload, timeout=5)
        r.raise_for_status()
        print(f"  [WEATHER] Simulation → Temp: {temp}°C, Rain: {rain_prob}%, Expected: {expected_rain}")
    except Exception as e:
        print(f"  [WARN] Could not set mock weather: {e}")

def get_decision():
    """Fetch and print the current decision from the backend."""
    try:
        r = requests.get(f"{BASE_URL}/decision/{DEVICE}", timeout=5)
        r.raise_for_status()
        d = r.json()
        print(f"  [DECISION] Status: {d.get('field_status')} | Risk: {d.get('risk_type')} ({d.get('risk_level')}) "
              f"| Action: {d.get('recommendation_action')} | Confidence: {int(d.get('confidence', 0)*100)}%")
        ev = d.get("evidence_summary", [])
        if isinstance(ev, str):
            import json
            ev = json.loads(ev)
        if ev:
            for e in ev:
                val_str = f"(value={e['value']:.1f})" if 'value' in e else ''
                print(f"            Evidence: {e.get('code', '?')} {val_str}")
    except Exception as e:
        print(f"  [WARN] Could not fetch decision: {e}")

def init_baseline():
    """Initialize the field baseline from a regional prior if not yet done."""
    try:
        r = requests.post(f"{BASE_URL}/baseline/init/{DEVICE}", json={
            "soil_moisture_min": 35.0,
            "soil_moisture_max": 60.0,
            "optimal_temp_min": 22.0,
            "optimal_temp_max": 28.0,
        }, timeout=5)
        r.raise_for_status()
        print(f"  [BASELINE] {r.json().get('msg')}")
    except Exception as e:
        print(f"  [WARN] Baseline init: {e}")

def separator(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def pause(seconds, msg=""):
    if msg:
        print(f"  [WAIT] {msg}")
    time.sleep(seconds)

# ─── Scenarios ────────────────────────────────────────────────────────────────

def scenario_1_normal():
    separator("SCENARIO 1 — NORMAL FIELD CONDITIONS")
    print("  Feeds normal moisture readings (42–45%) after baseline is seeded.")
    print("  Expected result: FIELD STATUS = NORMAL / Action = MONITOR")
    print()

    init_baseline()
    set_weather(28.0, 10.0, "Low")

    # Resolve any prior events by sending normal readings
    print("  Sending normal readings to establish field learning...")
    for val in [42, 43, 44, 45, 44, 43, 42]:
        post_reading(moisture=val, surr_temp=28.0, humidity=62.0)
        pause(0.3)

    pause(1)
    get_decision()

def scenario_2_water_deficit_low_rain():
    separator("SCENARIO 2 — WATER DEFICIT + LOW RAIN PROBABILITY")
    print("  Persistent moisture drop (25–28%) with dry weather forecast.")
    print("  Expected: FIELD STATUS = ATTENTION | Action = CONSIDER_IRRIGATION")
    print()

    set_weather(34.0, 15.0, "Low")

    print("  Sending persistent moisture drop readings...")
    for val in [28, 27, 26, 27, 25]:
        post_reading(moisture=val, surr_temp=34.0, humidity=35.0)
        pause(0.3)

    pause(1)
    get_decision()

def scenario_3_water_deficit_high_rain():
    separator("SCENARIO 3 — WATER DEFICIT + HIGH RAIN PROBABILITY (Weather Changes Action)")
    print("  Same sensor state (moisture still low), but rain forecast changes to 85%.")
    print("  Expected: Action = WAIT_FOR_RAIN / MONITOR")
    print("  This proves weather actually modifies the recommendation.")
    print()

    # Same sensor state — do NOT send normal readings
    # Just inject different weather
    set_weather(30.0, 85.0, "High")

    # One more dry reading to keep event alive
    post_reading(moisture=26.0, surr_temp=30.0, humidity=40.0)

    pause(1)
    get_decision()

# ─── Entry Point ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Marudam Demo Script")
    parser.add_argument("--scenario", type=int, choices=[1, 2, 3], help="Run a specific scenario (1, 2, or 3)")
    args = parser.parse_args()

    print("\nMarudam — Deterministic Decision Support Demo")
    print("----------------------------------------------")
    print(f"Backend: {BASE_URL}")
    print(f"Device:  {DEVICE}")
    print()
    print("NOTE: This script feeds simulated sensor readings through the real")
    print("      FastAPI pipeline. No data is written directly to the database.")
    print("      All results are visible on the live dashboard.")

    if args.scenario == 1:
        scenario_1_normal()
    elif args.scenario == 2:
        scenario_2_water_deficit_low_rain()
    elif args.scenario == 3:
        scenario_3_water_deficit_high_rain()
    else:
        scenario_1_normal()
        pause(2, "Pausing before Scenario 2...")
        scenario_2_water_deficit_low_rain()
        pause(2, "Pausing before Scenario 3 (same field, rain forecast changes)...")
        scenario_3_water_deficit_high_rain()

    print("\n" + "="*60)
    print("  Demo complete. Open http://localhost:3000/dashboard")
    print("  to see the live results. Try switching the language")
    print("  in the Farmer Profile — the decision stays identical.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
