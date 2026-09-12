#include <Arduino.h>
#include <ArduinoJson.h>
#include "config.h"
#include "sensors.h"

// =============================================================================
// MARUDAM ESP32 Sensor Node
// =============================================================================
// PRIMARY COMMUNICATION: USB Serial
//
// ESP32 -> USB -> FastAPI
//
// Serial output contains one JSON object per line.
// Wi-Fi is intentionally not used in the primary MARUDAM architecture.
// =============================================================================

SensorManager sensors(DEVICE_ID);

unsigned long lastSampleTime = 0;

// ---------------------------------------------------------------------------
// generateJsonPayload()
// ---------------------------------------------------------------------------
String generateJsonPayload(const SensorReadings& r) {
  DynamicJsonDocument doc(1024);

  doc["device_id"] = r.device_id;
  doc["timestamp"] = nullptr;

  // Soil sensors
  if (!isnan(r.soil_moisture))
    doc["soil_moisture"] = r.soil_moisture;
  else
    doc["soil_moisture"] = nullptr;

  if (!isnan(r.soil_temperature))
    doc["soil_temperature"] = r.soil_temperature;
  else
    doc["soil_temperature"] = nullptr;

  // pH and EC are not connected yet
  doc["soil_ph"] = nullptr;
  doc["soil_ec"] = nullptr;

  // Atmospheric sensors
  if (!isnan(r.air_temperature))
    doc["air_temperature"] = r.air_temperature;
  else
    doc["air_temperature"] = nullptr;

  if (!isnan(r.humidity))
    doc["humidity"] = r.humidity;
  else
    doc["humidity"] = nullptr;

  if (!isnan(r.light_lux))
    doc["light_lux"] = r.light_lux;
  else
    doc["light_lux"] = nullptr;

  // Sensor status
  JsonObject status = doc.createNestedObject("sensor_status");

  status["soil_moisture"] =
      r.status_soil_moisture;

  status["soil_temperature"] =
      r.status_soil_temperature;

  status["soil_ph"] =
      r.status_soil_ph;

  status["soil_ec"] =
      r.status_soil_ec;

  status["air_temperature"] =
      r.status_air_temperature;

  status["humidity"] =
      r.status_humidity;

  status["light_lux"] =
      r.status_light_lux;

  String output;
  serializeJson(doc, output);

  return output;
}

// ===========================================================================
// SETUP
// ===========================================================================
void setup() {

  Serial.begin(115200);
  delay(500);

  // IMPORTANT:
  // Do not print diagnostic text here.
  // FastAPI expects JSON Lines from the ESP32.

  sensors.begin();

}

// ===========================================================================
// LOOP
// ===========================================================================
void loop() {

  if (millis() - lastSampleTime >= SAMPLE_INTERVAL_MS) {

    lastSampleTime = millis();

    SensorReadings readings = sensors.readAll();

    if (!readings.is_valid) {
      // Do not send malformed/non-JSON data.
      return;
    }

    String jsonPayload = generateJsonPayload(readings);

    // ONLY JSON goes through USB Serial.
    Serial.println(jsonPayload);
  }
}