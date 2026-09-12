#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <BH1750.h>

// =============================================================================
// PIN CONFIGURATION
// All hardware GPIO assignments are defined here in one place.
// =============================================================================
#define PIN_ONE_WIRE      4    // DS18B20 soil temperature sensor (OneWire)
#define PIN_SOIL_MOISTURE 34   // Capacitive soil moisture sensor (ADC)
#define PIN_DHT           27   // DHT22 / AM2302 air temp + humidity sensor
#define DHT_TYPE          DHT22

// Soil moisture ADC calibration constants.
// Capacitive sensor: higher ADC = drier, lower ADC = wetter.
// Adjust these after calibrating against actual readings.
#define MOISTURE_ADC_DRY  3900  // ADC reading in open air / bone dry
#define MOISTURE_ADC_WET  1500  // ADC reading fully submerged

// =============================================================================
// SENSOR STATUS VALUES
// Every sensor must report one of these states — never silently fail.
// =============================================================================
#define SENSOR_OK          "ok"
#define SENSOR_UNAVAILABLE "unavailable"
#define SENSOR_ERROR       "error"

// =============================================================================
// MARUDAM SENSOR READINGS STRUCTURE
// Field names match the FastAPI backend schema and Supabase table exactly.
// NAN is used internally; the JSON serialiser converts NAN → null.
//
// Sensors:
//   soil_moisture   — Capacitive analog (ADC GPIO 34)
//   soil_temperature — DS18B20 (OneWire GPIO 4)
//   soil_ph         — Not yet connected; always null
//   soil_ec         — Not yet connected; always null
//   air_temperature  — DHT22 temperature (GPIO 27)
//   humidity         — DHT22 relative humidity (GPIO 27)
//   light_lux        — BH1750 illuminance (I2C)
// =============================================================================
struct SensorReadings {
  String  device_id;

  // ── Primary soil sensors ─────────────────────────────────────────────────
  float   soil_moisture;    // % (0–100), NAN if unavailable
  float   soil_temperature; // °C, NAN if unavailable

  // ── Future sensors (hardware not yet connected) ───────────────────────────
  // Always NAN. Set to real values once hardware is attached.
  float   soil_ph;          // pH (0–14), NAN if unavailable
  float   soil_ec;          // dS/m, NAN if unavailable

  // ── Atmospheric sensors ───────────────────────────────────────────────────
  float   air_temperature;  // °C, NAN if unavailable
  float   humidity;         // % RH (0–100), NAN if unavailable
  float   light_lux;        // lux, NAN if unavailable

  // ── Per-sensor status strings ─────────────────────────────────────────────
  // "ok" | "unavailable" | "error"
  String  status_soil_moisture;
  String  status_soil_temperature;
  String  status_soil_ph;
  String  status_soil_ec;
  String  status_air_temperature;
  String  status_humidity;
  String  status_light_lux;

  // ── Packet validity ───────────────────────────────────────────────────────
  // false only if ALL primary sensors fail simultaneously.
  // A partial packet is still transmitted.
  bool    is_valid;
};

// =============================================================================
// SENSOR MANAGER
// Encapsulates initialisation and reading of all sensors.
// One failed sensor does NOT crash the system.
// =============================================================================
class SensorManager {
private:
  OneWire*           oneWire;
  DallasTemperature* dallasTemp;
  DHT                dht;
  BH1750             lightMeter;

  bool has_ds18b20 = false;
  bool has_dht     = false;
  bool has_bh1750  = false;

  String deviceId;

public:
  SensorManager(String id) : deviceId(id), dht(PIN_DHT, DHT_TYPE) {}

  // ---------------------------------------------------------------------------
  // begin()
  // Initialise all sensors. Failures are logged, never fatal.
  // ---------------------------------------------------------------------------
  void begin() {
    // ── 1. I2C Bus ─────────────────────────────────────────────────────────
    Wire.begin();

    // ── 2. BH1750 Light Sensor (I2C) ────────────────────────────────────────
    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
      has_bh1750 = true;
      Serial.println("[BH1750]  OK  (Light Intensity)");
    } else {
      Serial.println("[BH1750]  UNAVAILABLE — check I2C wiring");
    }

    // ── 3. DS18B20 Soil Temperature (OneWire GPIO 4) ─────────────────────────
    oneWire   = new OneWire(PIN_ONE_WIRE);
    dallasTemp = new DallasTemperature(oneWire);
    dallasTemp->begin();

    if (dallasTemp->getDeviceCount() > 0) {
      has_ds18b20 = true;
      Serial.println("[DS18B20] OK  (Soil Temperature)");
    } else {
      Serial.println("[DS18B20] UNAVAILABLE — check OneWire on GPIO " + String(PIN_ONE_WIRE));
    }

    // ── 4. DHT22 Air Temperature + Humidity (GPIO 27) ────────────────────────
    dht.begin();
    // DHT22 does not have a meaningful begin() return value; test at first read.
    has_dht = true; // Assume present; detect failure on first read
    Serial.println("[DHT22]   Initialised on GPIO " + String(PIN_DHT));

    // ── 5. Soil Moisture (Capacitive Analog ADC 34) ──────────────────────────
    pinMode(PIN_SOIL_MOISTURE, INPUT);
    Serial.println("[MOISTURE] ADC pin " + String(PIN_SOIL_MOISTURE) + " configured.");

    // ── 6. pH and EC Sensors (Not yet connected) ─────────────────────────────
    Serial.println("[SOIL_PH]  Not connected — will report null.");
    Serial.println("[SOIL_EC]  Not connected — will report null.");
  }

  // ---------------------------------------------------------------------------
  // readAll()
  // Reads all sensors. Returns NAN for any unavailable reading.
  // is_valid = false only if ALL primary sensors fail simultaneously.
  // ---------------------------------------------------------------------------
  SensorReadings readAll() {
    SensorReadings r;
    r.device_id = deviceId;

    // ── Soil Moisture (Capacitive ADC) ────────────────────────────────────────
    // Capacitive sensor: DRY → high ADC, WET → low ADC.
    int   raw      = analogRead(PIN_SOIL_MOISTURE);
    float moisture = ((float)(MOISTURE_ADC_DRY - raw) /
                      (float)(MOISTURE_ADC_DRY - MOISTURE_ADC_WET)) * 100.0f;
    r.soil_moisture = constrain(moisture, 0.0f, 100.0f);
    r.status_soil_moisture = SENSOR_OK;

    // ── Soil Temperature (DS18B20) ────────────────────────────────────────────
    if (has_ds18b20) {
      dallasTemp->requestTemperatures();
      float tempC = dallasTemp->getTempCByIndex(0);
      if (tempC == DEVICE_DISCONNECTED_C || isnan(tempC)) {
        r.soil_temperature = NAN;
        r.status_soil_temperature = SENSOR_ERROR;
      } else {
        r.soil_temperature = tempC;
        r.status_soil_temperature = SENSOR_OK;
      }
    } else {
      r.soil_temperature = NAN;
      r.status_soil_temperature = SENSOR_UNAVAILABLE;
    }

    // ── Air Temperature + Humidity (DHT22) ────────────────────────────────────
    if (has_dht) {
      float h = dht.readHumidity();
      float t = dht.readTemperature();

      if (isnan(h) || isnan(t)) {
        r.air_temperature = NAN;
        r.humidity        = NAN;
        r.status_air_temperature = SENSOR_ERROR;
        r.status_humidity        = SENSOR_ERROR;
      } else {
        r.air_temperature = t;
        r.humidity        = h;
        r.status_air_temperature = SENSOR_OK;
        r.status_humidity        = SENSOR_OK;
      }
    } else {
      r.air_temperature = NAN;
      r.humidity        = NAN;
      r.status_air_temperature = SENSOR_UNAVAILABLE;
      r.status_humidity        = SENSOR_UNAVAILABLE;
    }

    // ── Light Intensity (BH1750) ──────────────────────────────────────────────
    if (has_bh1750) {
      float lux = lightMeter.readLightLevel();
      if (lux < 0) {
        r.light_lux        = NAN;
        r.status_light_lux = SENSOR_ERROR;
      } else {
        r.light_lux        = lux;
        r.status_light_lux = SENSOR_OK;
      }
    } else {
      r.light_lux        = NAN;
      r.status_light_lux = SENSOR_UNAVAILABLE;
    }

    // ── Soil pH (Not yet connected — always null) ─────────────────────────────
    r.soil_ph        = NAN;
    r.status_soil_ph = SENSOR_UNAVAILABLE;

    // ── Soil EC (Not yet connected — always null) ─────────────────────────────
    r.soil_ec        = NAN;
    r.status_soil_ec = SENSOR_UNAVAILABLE;

    // ── Packet Validity ───────────────────────────────────────────────────────
    // Consider valid if at least ONE primary sensor (moisture or any temperature) works.
    bool moisture_ok    = !isnan(r.soil_moisture);
    bool temperature_ok = !isnan(r.soil_temperature) || !isnan(r.air_temperature);
    r.is_valid = moisture_ok || temperature_ok;

    return r;
  }

  // ---------------------------------------------------------------------------
  // printAvailability()
  // Serial diagnostics summary — only called at startup.
  // ---------------------------------------------------------------------------
  void printAvailability() {
    Serial.println("  Sensor availability:");
    Serial.println("    Soil Moisture:    OK (ADC GPIO " + String(PIN_SOIL_MOISTURE) + ")");
    Serial.println("    Soil Temperature: " + String(has_ds18b20 ? "OK (DS18B20)" : "UNAVAILABLE"));
    Serial.println("    Soil pH:          Not connected (null)");
    Serial.println("    Soil EC:          Not connected (null)");
    Serial.println("    Air Temperature:  " + String(has_dht ? "OK (DHT22)" : "UNAVAILABLE"));
    Serial.println("    Humidity:         " + String(has_dht ? "OK (DHT22)" : "UNAVAILABLE"));
    Serial.println("    Light (lux):      " + String(has_bh1750 ? "OK (BH1750)" : "UNAVAILABLE"));
  }
};

#endif // SENSORS_H
