import requests
import time
import json

BASE_URL = "http://localhost:8000/api"
DEVICE = "FIELD_001"

def set_mock_weather(temp, prob, exp):
    requests.post(f"{BASE_URL}/weather/mock", json={
        "device_id": DEVICE,
        "temperature": temp,
        "rain_probability": prob,
        "expected_rain": exp
    })

def send_reading(moisture, surr_temp=30.0, humidity=60.0):
    payload = {
        "device_id": DEVICE,
        "soil_moisture": moisture,
        "soil_temperature": 25.0,
        "light_intensity": 50000,
        "air_humidity": humidity,
        "surrounding_temperature": surr_temp
    }
    requests.post(f"{BASE_URL}/sensors/readings", json=payload)
    
def get_decision():
    res = requests.get(f"{BASE_URL}/decision/{DEVICE}")
    return res.json()

print("\n=== PHASE 5 DETERMINISTIC TEST ===")
print("Re-Seeding Baseline (Assuming Phase 4 already seeded and learned over time)...")

print("\n--- TEST A: NORMAL FIELD ---")
# Reset state by sending a lot of normal readings to resolve events
for _ in range(5): send_reading(45) 
set_mock_weather(30.0, 10.0, "Low")
dec = get_decision()
print(f"Status: {dec['field_status']}, Action: {dec['recommendation_action']}, RZ: {dec['root_zone']['moisture_state']}")

print("\n--- TEST B: PERSISTENT LOW MOISTURE ---")
# Drop moisture significantly
for _ in range(5): send_reading(25) 
dec = get_decision()
print(f"Risk: {dec['risk_type']} ({dec['risk_level']}), Action: {dec['recommendation_action']}, RZ: {dec['root_zone']['moisture_state']}")

print("\n--- TEST C: DRYING CONTEXT (High Temp + Low Humidity) ---")
# Send reading with extreme drying context
send_reading(25, surr_temp=38.0, humidity=25.0)
dec = get_decision()
print(f"Confidence (should be higher): {dec['root_zone']['confidence']}, Evidence: {dec['evidence_summary']}")

print("\n--- TEST D: LOW RAIN PROBABILITY (Strong Irrigation Action) ---")
set_mock_weather(35.0, 15.0, "Low")
dec = get_decision()
print(f"Action: {dec['recommendation_action']}, Rain Prob: {dec['weather']['rain_probability']}%")
print(f"Evidence: {json.dumps(dec['evidence_summary'], indent=2)}")

print("\n--- TEST E: HIGH RAIN PROBABILITY (Weather modifies Action!) ---")
set_mock_weather(30.0, 85.0, "High")
dec = get_decision()
print(f"Action: {dec['recommendation_action']}, Rain Prob: {dec['weather']['rain_probability']}%")
print(f"Evidence: {json.dumps(dec['evidence_summary'], indent=2)}")

print("\n--- TEST I: COUNTERFACTUAL (Normalize Soil Moisture) ---")
for _ in range(5): send_reading(45) 
dec = get_decision()
print(f"Action: {dec['recommendation_action']}, Risk: {dec['risk_type']}")
