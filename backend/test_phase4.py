import requests
import time

BASE_URL = "http://localhost:8000/api"
DEVICE = "FIELD_001"

def init_baseline():
    print("Seeding Initial Regional Baseline...")
    res = requests.post(f"{BASE_URL}/baseline/init/{DEVICE}", json={
        "soil_moisture_min": 35.0,
        "soil_moisture_max": 60.0,
        "optimal_temp_min": 22.0,
        "optimal_temp_max": 28.0
    })
    print(res.json())

def send_reading(moisture):
    payload = {
        "device_id": DEVICE,
        "soil_moisture": moisture,
        "soil_temperature": 25.0,
        "light_intensity": 50000,
        "air_humidity": 60.0,
        "surrounding_temperature": 30.0
    }
    requests.post(f"{BASE_URL}/sensors/readings", json=payload)
    
def print_status():
    b_res = requests.get(f"{BASE_URL}/baseline/{DEVICE}")
    e_res = requests.get(f"{BASE_URL}/events/{DEVICE}")
    
    moist_b = b_res.json().get("soil_moisture", {})
    events = e_res.json()
    
    print(f"\n[STATUS] Baseline Center: {moist_b.get('center', 0):.2f}, Expected Range: {moist_b.get('min_expected', 0):.2f}-{moist_b.get('max_expected', 0):.2f}")
    if events:
        evt = events[0]
        if evt['sensor'] == 'soil_moisture':
            print(f"[EVENTS] {evt['event_type']} | Status: {evt['status']} | Severity: {evt['severity']}")
    else:
        print("[EVENTS] No active moisture events.")
    print("-" * 50)


print("=== PHASE 4 DETERMINISTIC TEST ===")
init_baseline()

print("\n--- PHASE 1: NORMAL LEARNING ---")
for val in [42, 43, 44, 45, 44, 43, 42]:
    print(f"Sending: {val}")
    send_reading(val)
    print_status()

print("\n--- PHASE 2: ABNORMAL DROPS (EVENT CREATION & PERSISTENCE) ---")
for val in [28, 27, 26, 27, 25]:
    print(f"Sending: {val}")
    send_reading(val)
    print_status()

print("\n--- PHASE 3: RECOVERY (EVENT RESOLUTION) ---")
for val in [34, 40, 45]:
    print(f"Sending: {val}")
    send_reading(val)
    print_status()
