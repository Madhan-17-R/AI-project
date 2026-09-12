#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"    // Local configuration — gitignored, never committed
#include "sensors.h"

// =============================================================================
// ESP32 SENSOR NODE — KhetAI
// =============================================================================
// Communication modes (set in config.h):
//   "WIFI"   → POST readings to FastAPI backend over local Wi-Fi.
//   "SERIAL" → Print readings to USB Serial only (offline/debug).
//
// Wi-Fi failure behaviour:
//   - If Wi-Fi is unavailable at startup, the node falls back to Serial mode
//     after WIFI_TIMEOUT_MS and continues reading sensors.
//   - In the main loop, Wi-Fi reconnect is attempted without blocking
//     sensor acquisition.
// =============================================================================

SensorManager  sensors(DEVICE_ID);
unsigned long  lastSampleTime   = 0;
unsigned long  lastReconnectAttempt = 0;
bool           wifiAvailable    = false;  // Runtime flag — updated dynamically

// ---------------------------------------------------------------------------
// getISOTimestamp()
// Returns a simple UTC-ish timestamp string. The ESP32 does not have
// a real-time clock by default, so this is the time since boot in
// ISO-like format. For accurate timestamps, add NTP sync.
// ---------------------------------------------------------------------------
String getISOTimestamp() {
  unsigned long ms    = millis();
  unsigned long sec   = ms / 1000;
  unsigned long mins  = sec / 60;
  unsigned long hours = mins / 60;
  char buf[30];
  snprintf(buf, sizeof(buf), "1970-01-01T%02lu:%02lu:%02luZ",
           hours % 24, mins % 60, sec % 60);
  return String(buf);
}

// ---------------------------------------------------------------------------
// printHumanReadable()
// Outputs a clean human-readable report to Serial.
// ---------------------------------------------------------------------------
void printHumanReadable(const SensorReadings& r) {
  Serial.println("=====================================");
  Serial.println("DEVICE:   " + r.device_id);
  Serial.println("TIME:     " + getISOTimestamp());
  Serial.println("-------------------------------------");

  if (!isnan(r.soil_moisture))
    Serial.println("SOIL MOISTURE:          " + String(r.soil_moisture, 1) + " %");
  else
    Serial.println("SOIL MOISTURE:          UNAVAILABLE");

  if (!isnan(r.soil_temperature))
    Serial.println("SOIL TEMPERATURE:       " + String(r.soil_temperature, 1) + " C");
  else
    Serial.println("SOIL TEMPERATURE:       UNAVAILABLE");

  if (!isnan(r.light_intensity))
    Serial.println("LIGHT INTENSITY:        " + String((int)r.light_intensity) + " lux");
  else
    Serial.println("LIGHT INTENSITY:        UNAVAILABLE");

  if (!isnan(r.air_humidity))
    Serial.println("AIR HUMIDITY:           " + String(r.air_humidity, 1) + " %");
  else
    Serial.println("AIR HUMIDITY:           UNAVAILABLE");

  if (!isnan(r.surrounding_temperature))
    Serial.println("SURROUNDING TEMP:       " + String(r.surrounding_temperature, 1) + " C");
  else
    Serial.println("SURROUNDING TEMP:       UNAVAILABLE");

  Serial.println("=====================================");
}

// ---------------------------------------------------------------------------
// generateJsonPayload()
// Serializes sensor readings as valid JSON.
// IMPORTANT: NaN is NOT valid JSON. Unavailable sensors are sent as null.
// ---------------------------------------------------------------------------
String generateJsonPayload(const SensorReadings& r) {
  // Use a dynamic document to handle optional null values cleanly.
  DynamicJsonDocument doc(512);

  doc["device_id"] = r.device_id;

  // Each sensor is explicitly set to null if its value is NaN,
  // ensuring the FastAPI backend always receives valid JSON.
  if (!isnan(r.soil_moisture))
    doc["soil_moisture"] = r.soil_moisture;
  else
    doc["soil_moisture"] = nullptr;

  if (!isnan(r.soil_temperature))
    doc["soil_temperature"] = r.soil_temperature;
  else
    doc["soil_temperature"] = nullptr;

  if (!isnan(r.light_intensity))
    doc["light_intensity"] = r.light_intensity;
  else
    doc["light_intensity"] = nullptr;

  if (!isnan(r.air_humidity))
    doc["air_humidity"] = r.air_humidity;
  else
    doc["air_humidity"] = nullptr;

  if (!isnan(r.surrounding_temperature))
    doc["surrounding_temperature"] = r.surrounding_temperature;
  else
    doc["surrounding_temperature"] = nullptr;

  String output;
  serializeJson(doc, output);
  return output;
}

// ---------------------------------------------------------------------------
// tryConnectWiFi()
// Attempts a non-blocking Wi-Fi connection with a finite timeout.
// Returns true if connected within WIFI_TIMEOUT_MS.
// ---------------------------------------------------------------------------
bool tryConnectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start >= WIFI_TIMEOUT_MS) {
      Serial.println("\nWi-Fi timeout — falling back to Serial mode.");
      WiFi.disconnect(true);
      return false;
    }
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected!");
  Serial.print("  IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("  Backend: ");
  Serial.println(BACKEND_URL);
  return true;
}

// ---------------------------------------------------------------------------
// sendViaWiFi()
// POSTs a JSON payload to the FastAPI backend.
// If Wi-Fi is not connected, skips silently (sensor loop continues).
// ---------------------------------------------------------------------------
void sendViaWiFi(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Not connected — skipping HTTP POST.");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);  // 5 second HTTP timeout

  Serial.println("[WiFi] Posting to: " + String(BACKEND_URL));
  int code = http.POST(jsonPayload);

  if (code > 0) {
    Serial.println("[WiFi] Response: HTTP " + String(code));
  } else {
    Serial.println("[WiFi] POST failed, error: " + String(http.errorToString(code)));
  }

  http.end();
}

// ===========================================================================
// SETUP
// ===========================================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n===========================================");
  Serial.println("  KhetAI ESP32 Sensor Node");
  Serial.println("  Device: " + String(DEVICE_ID));
  Serial.println("  Mode:   " + String(COMMUNICATION_MODE));
  Serial.println("===========================================\n");

  // Initialize all sensors (failures are logged, not fatal)
  sensors.begin();
  Serial.println();
  sensors.printAvailability();
  Serial.println();

  // Attempt Wi-Fi only if configured
  if (String(COMMUNICATION_MODE) == "WIFI") {
    wifiAvailable = tryConnectWiFi();
    if (!wifiAvailable) {
      Serial.println("Operating in Serial-only mode until Wi-Fi is restored.");
    }
  } else {
    Serial.println("Serial mode — Wi-Fi disabled.");
  }

  Serial.println("\nStarting sensor loop...\n");
}

// ===========================================================================
// LOOP
// ===========================================================================
void loop() {
  // ── Wi-Fi Reconnect (non-blocking) ────────────────────────────────────────
  // If we are in Wi-Fi mode but currently disconnected, attempt reconnect once
  // per minute without blocking sensor acquisition.
  if (String(COMMUNICATION_MODE) == "WIFI" &&
      WiFi.status() != WL_CONNECTED &&
      (millis() - lastReconnectAttempt >= 60000UL)) {
    lastReconnectAttempt = millis();
    Serial.println("[WiFi] Disconnected — attempting reconnect...");
    wifiAvailable = tryConnectWiFi();
  }

  // ── Sensor Acquisition ────────────────────────────────────────────────────
  if (millis() - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = millis();

    SensorReadings readings = sensors.readAll();

    if (!readings.is_valid) {
      Serial.println("[ERROR] No valid readings from any sensor — skipping transmission.");
      return;
    }

    // Always print human-readable output to Serial for diagnostics
    printHumanReadable(readings);

    // Generate a valid JSON payload (NaN → null)
    String jsonPayload = generateJsonPayload(readings);
    Serial.println("[JSON] " + jsonPayload);

    // Route based on communication mode
    if (String(COMMUNICATION_MODE) == "WIFI") {
      sendViaWiFi(jsonPayload);
    }
    // In SERIAL mode the human-readable + JSON output above is sufficient.
  }
}
