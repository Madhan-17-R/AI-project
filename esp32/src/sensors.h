#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_SHT31.h>
#include <BH1750.h>

// =============================================================================
// PIN CONFIGURATION
// All hardware GPIO assignments are defined here in one place.
// =============================================================================
#define PIN_ONE_WIRE      4    // DS18B20 soil temperature sensor (OneWire)
#define PIN_SOIL_MOISTURE 34   // Capacitive soil moisture sensor (ADC)

// Soil moisture ADC calibration constants.
// Dry air reading (higher ADC = drier for capacitive sensor).
// Fully submerged reading (lower ADC = wetter).
// Adjust these constants if calibrating against actual readings.
#define MOISTURE_ADC_DRY  3900  // ADC reading in open air / bone dry
#define MOISTURE_ADC_WET  1500  // ADC reading fully submerged

// =============================================================================
// STANDARD SENSOR DATA STRUCTURE
// Field names must stay compatible with the FastAPI backend payload schema.
// =============================================================================
struct SensorReadings {
  String  device_id;
  float   soil_moisture;           // % (0–100), NAN if unavailable
  float   soil_temperature;        // °C, NAN if unavailable
  float   light_intensity;         // lux, NAN if unavailable
  float   air_humidity;            // % (0–100), NAN if unavailable
  float   surrounding_temperature; // °C, NAN if unavailable
  bool    is_valid;                // false only if ALL primary sensors failed
};

// =============================================================================
// SENSOR MANAGER
// Encapsulates initialization and reading of all five sensors.
// One failed sensor does NOT crash the system.
// =============================================================================
class SensorManager {
private:
  OneWire*          oneWire;
  DallasTemperature* dallasTemp;
  Adafruit_SHT31    sht31;
  BH1750            lightMeter;

  bool has_ds18b20  = false;
  bool has_sht31    = false;
  bool has_bh1750   = false;

  String deviceId;

public:
  SensorManager(String id) : deviceId(id) {}

  void begin() {
    // ── 1. I2C Bus ────────────────────────────────────────────────────────────
    // Wire.begin() MUST be called before any I2C sensor is initialized.
    Wire.begin();

    // ── 2. Air Humidity + Surrounding Temperature (SHT31 @ I2C 0x44) ─────────
    if (sht31.begin(0x44)) {
      has_sht31 = true;
      Serial.println("[SHT31]   OK  (Air Humidity + Surrounding Temp)");
    } else {
      Serial.println("[SHT31]   UNAVAILABLE — check wiring to I2C 0x44");
    }

    // ── 3. Light Intensity (BH1750 @ I2C default) ─────────────────────────────
    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
      has_bh1750 = true;
      Serial.println("[BH1750]  OK  (Light Intensity)");
    } else {
      Serial.println("[BH1750]  UNAVAILABLE — check I2C wiring");
    }

    // ── 4. Soil Temperature (DS18B20 via OneWire on PIN_ONE_WIRE) ─────────────
    oneWire   = new OneWire(PIN_ONE_WIRE);
    dallasTemp = new DallasTemperature(oneWire);
    dallasTemp->begin();

    if (dallasTemp->getDeviceCount() > 0) {
      has_ds18b20 = true;
      Serial.println("[DS18B20] OK  (Soil Temperature)");
    } else {
      Serial.println("[DS18B20] UNAVAILABLE — check OneWire on GPIO " + String(PIN_ONE_WIRE));
    }

    // ── 5. Soil Moisture (Capacitive Analog on PIN_SOIL_MOISTURE) ─────────────
    pinMode(PIN_SOIL_MOISTURE, INPUT);
    Serial.println("[MOISTURE] ADC pin " + String(PIN_SOIL_MOISTURE) + " configured.");
  }

  // ---------------------------------------------------------------------------
  // readAll()
  // Reads all five sensors. Returns NAN for any unavailable reading.
  // is_valid = false only if both primary sensors (moisture + temperature) fail.
  // ---------------------------------------------------------------------------
  SensorReadings readAll() {
    SensorReadings r;
    r.device_id = deviceId;

    // ── Soil Temperature (DS18B20) ────────────────────────────────────────────
    if (has_ds18b20) {
      dallasTemp->requestTemperatures();
      float tempC = dallasTemp->getTempCByIndex(0);
      r.soil_temperature = (tempC == DEVICE_DISCONNECTED_C) ? NAN : tempC;
    } else {
      r.soil_temperature = NAN;
    }

    // ── Air Humidity + Surrounding Temperature (SHT31) ───────────────────────
    if (has_sht31) {
      r.surrounding_temperature = sht31.readTemperature();
      r.air_humidity             = sht31.readHumidity();
    } else {
      r.surrounding_temperature = NAN;
      r.air_humidity             = NAN;
    }

    // ── Light Intensity (BH1750) ──────────────────────────────────────────────
    r.light_intensity = has_bh1750 ? lightMeter.readLightLevel() : NAN;

    // ── Soil Moisture (Capacitive ADC — floating-point conversion) ────────────
    // The capacitive sensor outputs higher ADC values when drier.
    // We convert linearly: DRY_ADC → 0%, WET_ADC → 100%.
    int   raw      = analogRead(PIN_SOIL_MOISTURE);
    float moisture = ((float)(MOISTURE_ADC_DRY - raw) /
                      (float)(MOISTURE_ADC_DRY - MOISTURE_ADC_WET)) * 100.0f;
    r.soil_moisture = constrain(moisture, 0.0f, 100.0f);

    // ── Validity ──────────────────────────────────────────────────────────────
    // Mark invalid only if BOTH primary sensors fail simultaneously.
    // A single sensor gap is acceptable and must NOT stop transmission.
    bool moisture_ok    = !isnan(r.soil_moisture);
    bool temperature_ok = !isnan(r.soil_temperature) ||
                          !isnan(r.surrounding_temperature);
    r.is_valid = moisture_ok || temperature_ok;

    return r;
  }

  // Availability summary for Serial diagnostics
  void printAvailability() {
    Serial.println("  Soil Moisture:          OK (ADC)");
    Serial.println("  Soil Temperature:       " + String(has_ds18b20 ? "OK" : "UNAVAILABLE"));
    Serial.println("  Light Intensity:        " + String(has_bh1750  ? "OK" : "UNAVAILABLE"));
    Serial.println("  Air Humidity:           " + String(has_sht31   ? "OK" : "UNAVAILABLE"));
    Serial.println("  Surrounding Temp:       " + String(has_sht31   ? "OK" : "UNAVAILABLE"));
  }
};

#endif // SENSORS_H
