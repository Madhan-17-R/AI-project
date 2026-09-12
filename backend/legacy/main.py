import os
import json
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# =========================================================================
# PROTOTYPE CONFIGURATION
# =========================================================================
BASELINE_ALPHA = 0.05
THRESHOLDS = {
    "soil_moisture": 8.0,
    "soil_temperature": 5.0,
    "air_humidity": 15.0,
    "light_intensity": 50000.0,
    "surrounding_temperature": 15.0
}

# =========================================================================
# DATABASE SETUP (SQLite)
# =========================================================================

DB_FILE = "sensors.db"
DB_URL = f"sqlite:///./{DB_FILE}"

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SensorReadingModel(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    soil_moisture = Column(Float, nullable=True)
    soil_temperature = Column(Float, nullable=True)
    light_intensity = Column(Float, nullable=True)
    air_humidity = Column(Float, nullable=True)
    surrounding_temperature = Column(Float, nullable=True)

class FieldBaselineModel(Base):
    __tablename__ = "field_baselines"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    sensor_name = Column(String, index=True)
    min_expected = Column(Float)
    max_expected = Column(Float)
    center = Column(Float)
    confidence = Column(Float, default=0.1)
    observations_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class SensorEventModel(Base):
    __tablename__ = "sensor_events"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    event_type = Column(String)
    sensor = Column(String)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    magnitude = Column(Float)
    severity = Column(String)
    confidence = Column(Float, default=0.5)
    status = Column(String)
    persistence_counter = Column(Integer, default=1)

# --- Phase 5 Models ---
class WeatherCacheModel(Base):
    __tablename__ = "weather_cache"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    temperature = Column(Float)
    rain_probability = Column(Float)
    expected_rain = Column(String) # Low, Meaningful, High
    updated_at = Column(DateTime, default=datetime.utcnow)

class DecisionRecordModel(Base):
    __tablename__ = "decision_records"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    field_status = Column(String)
    risk_type = Column(String)
    risk_level = Column(String)
    confidence = Column(Float)
    recommendation_action = Column(String)
    evidence_summary = Column(Text) # JSON string
    root_zone_moisture = Column(String)
    root_zone_confidence = Column(Float)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================================
# API SCHEMAS
# =========================================================================

class BaselineInitPayload(BaseModel):
    soil_moisture_min: float
    soil_moisture_max: float
    optimal_temp_min: float
    optimal_temp_max: float

class SensorReadingCreate(BaseModel):
    device_id: str
    soil_moisture: Optional[float] = None
    soil_temperature: Optional[float] = None
    light_intensity: Optional[float] = None
    air_humidity: Optional[float] = None
    surrounding_temperature: Optional[float] = None

class SensorReadingResponse(SensorReadingCreate):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class MockWeatherPayload(BaseModel):
    device_id: str
    temperature: float
    rain_probability: float
    expected_rain: str

# =========================================================================
# FASTAPI APP
# =========================================================================

app = FastAPI(title="Marudam Local Sensor API")

# CORS: allow localhost (Next.js dev) and any private 192.168.x.x LAN origin.
# This remains strictly local — no public endpoints are exposed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"http://192\.168\.\d+\.\d+(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Phase 4 Baseline & Event Logic ---

@app.get("/api/status/{device_id}")
def get_device_status(device_id: str, db: Session = Depends(get_db)):
    """Returns device connectivity status based on latest reading timestamp."""
    reading = db.query(SensorReadingModel)\
        .filter(SensorReadingModel.device_id == device_id)\
        .order_by(SensorReadingModel.timestamp.desc()).first()
    if not reading:
        return {"device_id": device_id, "status": "UNKNOWN", "last_seen": None}
    age_seconds = (datetime.utcnow() - reading.timestamp).total_seconds()
    if age_seconds <= 120:
        status = "ONLINE"
    elif age_seconds <= 600:
        status = "STALE"
    else:
        status = "OFFLINE"
    return {
        "device_id": device_id,
        "status": status,
        "last_seen": reading.timestamp.isoformat(),
        "age_seconds": int(age_seconds),
    }

@app.post("/api/baseline/init/{device_id}")
def init_baseline(device_id: str, payload: BaselineInitPayload, db: Session = Depends(get_db)):
    existing = db.query(FieldBaselineModel).filter(FieldBaselineModel.device_id == device_id).count()
    if existing > 0:
        return {"msg": "Baseline already initialized/learning. Skipping."}
    
    defaults = [
        {"sensor": "soil_moisture", "min": payload.soil_moisture_min, "max": payload.soil_moisture_max},
        {"sensor": "soil_temperature", "min": payload.optimal_temp_min, "max": payload.optimal_temp_max},
        {"sensor": "air_humidity", "min": 40.0, "max": 80.0},
        {"sensor": "light_intensity", "min": 0.0, "max": 100000.0},
        {"sensor": "surrounding_temperature", "min": 15.0, "max": 40.0}
    ]
    
    for d in defaults:
        b = FieldBaselineModel(
            device_id=device_id,
            sensor_name=d["sensor"],
            min_expected=d["min"],
            max_expected=d["max"],
            center=(d["min"] + d["max"]) / 2.0,
            confidence=0.1,
            observations_count=0
        )
        db.add(b)
    db.commit()
    return {"msg": "Initialized regional prior."}

@app.get("/api/baseline/{device_id}")
def get_baseline(device_id: str, db: Session = Depends(get_db)):
    baselines = db.query(FieldBaselineModel).filter(FieldBaselineModel.device_id == device_id).all()
    if not baselines: return {}
    resp = {}
    for b in baselines:
        resp[b.sensor_name] = {
            "center": b.center,
            "min_expected": b.min_expected,
            "max_expected": b.max_expected,
            "confidence": b.confidence,
            "observations_count": b.observations_count
        }
    return resp

@app.get("/api/events/{device_id}")
def get_events(device_id: str, db: Session = Depends(get_db)):
    events = db.query(SensorEventModel).filter(SensorEventModel.device_id == device_id)\
               .order_by(SensorEventModel.start_time.desc()).limit(20).all()
    return events

def _process_sensor_learning(device_id: str, sensor_name: str, value: float, db: Session):
    if value is None: return
    baseline = db.query(FieldBaselineModel).filter(
        FieldBaselineModel.device_id == device_id, 
        FieldBaselineModel.sensor_name == sensor_name
    ).first()
    if not baseline: return
    
    deviation = value - baseline.center
    abs_dev = abs(deviation)
    threshold = THRESHOLDS.get(sensor_name, 10.0)
    
    active_event = db.query(SensorEventModel).filter(
        SensorEventModel.device_id == device_id,
        SensorEventModel.sensor == sensor_name,
        SensorEventModel.status.in_(["NEW", "ONGOING", "PERSISTENT"])
    ).first()

    if abs_dev > threshold:
        if active_event:
            active_event.persistence_counter += 1
            if active_event.persistence_counter >= 3:
                active_event.status = "PERSISTENT"
                active_event.severity = "HIGH"
            else:
                active_event.status = "ONGOING"
                active_event.severity = "MODERATE"
            active_event.duration_minutes = int((datetime.utcnow() - active_event.start_time).total_seconds() / 60)
            active_event.magnitude = deviation
        else:
            evt_type = f"{sensor_name.upper()}_{'RISE' if deviation > 0 else 'DROP'}"
            new_evt = SensorEventModel(
                device_id=device_id, event_type=evt_type, sensor=sensor_name,
                magnitude=deviation, severity="MODERATE", status="NEW", persistence_counter=1
            )
            db.add(new_evt)
    else:
        baseline.center = (BASELINE_ALPHA * value) + ((1 - BASELINE_ALPHA) * baseline.center)
        baseline.observations_count += 1
        half_range = (baseline.max_expected - baseline.min_expected) / 2.0
        baseline.min_expected = baseline.center - half_range
        baseline.max_expected = baseline.center + half_range
        if baseline.confidence < 0.95: baseline.confidence += 0.02
        baseline.updated_at = datetime.utcnow()
        if active_event:
            active_event.status = "RESOLVED"
            active_event.end_time = datetime.utcnow()
            active_event.duration_minutes = int((active_event.end_time - active_event.start_time).total_seconds() / 60)

@app.post("/api/sensors/readings", response_model=SensorReadingResponse)
def create_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    db_reading = SensorReadingModel(
        device_id=reading.device_id, soil_moisture=reading.soil_moisture,
        soil_temperature=reading.soil_temperature, light_intensity=reading.light_intensity,
        air_humidity=reading.air_humidity, surrounding_temperature=reading.surrounding_temperature
    )
    db.add(db_reading)
    _process_sensor_learning(reading.device_id, "soil_moisture", reading.soil_moisture, db)
    _process_sensor_learning(reading.device_id, "soil_temperature", reading.soil_temperature, db)
    _process_sensor_learning(reading.device_id, "light_intensity", reading.light_intensity, db)
    _process_sensor_learning(reading.device_id, "air_humidity", reading.air_humidity, db)
    _process_sensor_learning(reading.device_id, "surrounding_temperature", reading.surrounding_temperature, db)
    
    db.commit()
    db.refresh(db_reading)
    return db_reading

@app.get("/api/sensors/latest/{device_id}", response_model=SensorReadingResponse)
def get_latest_reading(device_id: str, db: Session = Depends(get_db)):
    reading = db.query(SensorReadingModel).filter(SensorReadingModel.device_id == device_id).order_by(SensorReadingModel.timestamp.desc()).first()
    if reading is None: raise HTTPException(status_code=404, detail="Not found")
    return reading

# --- Phase 5 Weather, Root-Zone & Decision Engine ---

@app.post("/api/weather/mock")
def set_mock_weather(payload: MockWeatherPayload, db: Session = Depends(get_db)):
    """ Sets the mock weather for deterministic test scenarios. """
    cache = db.query(WeatherCacheModel).filter(WeatherCacheModel.device_id == payload.device_id).first()
    if not cache:
        cache = WeatherCacheModel(device_id=payload.device_id)
        db.add(cache)
    cache.temperature = payload.temperature
    cache.rain_probability = payload.rain_probability
    cache.expected_rain = payload.expected_rain
    cache.updated_at = datetime.utcnow()
    db.commit()
    return {"msg": "Mock weather updated"}

@app.get("/api/weather/{device_id}")
def get_weather(device_id: str, db: Session = Depends(get_db)):
    """ Returns latest cached weather. """
    cache = db.query(WeatherCacheModel).filter(WeatherCacheModel.device_id == device_id).first()
    if not cache:
        return {"status": "unavailable"}
    # Check if stale (e.g. > 12 hours)
    if datetime.utcnow() - cache.updated_at > timedelta(hours=12):
        return {"status": "stale", "data": {"temperature": cache.temperature, "rain_probability": cache.rain_probability, "expected_rain": cache.expected_rain}}
    return {"status": "ok", "data": {"temperature": cache.temperature, "rain_probability": cache.rain_probability, "expected_rain": cache.expected_rain}}

@app.get("/api/decision/{device_id}")
def evaluate_decision(device_id: str, db: Session = Depends(get_db)):
    """ Phase 5 Core Evidence Fusion Engine. Recomputes decision dynamically. """
    latest_reading = db.query(SensorReadingModel).filter(SensorReadingModel.device_id == device_id).order_by(SensorReadingModel.timestamp.desc()).first()
    if not latest_reading:
        return {"field_status": "UNCERTAIN", "recommendation_action": "CHECK_FIELD", "evidence_summary": [{"code": "NO_SENSOR_DATA"}]}

    baselines = db.query(FieldBaselineModel).filter(FieldBaselineModel.device_id == device_id).all()
    if not baselines:
        return {"field_status": "UNCERTAIN", "recommendation_action": "MONITOR", "evidence_summary": [{"code": "AWAITING_BASELINE"}]}
    base_map = {b.sensor_name: b for b in baselines}
    
    events = db.query(SensorEventModel).filter(
        SensorEventModel.device_id == device_id, 
        SensorEventModel.status.in_(["NEW", "ONGOING", "PERSISTENT"])
    ).all()
    
    weather_cache = db.query(WeatherCacheModel).filter(WeatherCacheModel.device_id == device_id).first()

    # 1. Root Zone Estimation
    root_zone_moisture = "UNKNOWN"
    rz_confidence = 0.5
    evidence = []

    moisture_event = next((e for e in events if e.sensor == "soil_moisture" and e.event_type == "SOIL_MOISTURE_DROP"), None)
    
    if latest_reading.soil_moisture is not None and "soil_moisture" in base_map:
        b = base_map["soil_moisture"]
        if latest_reading.soil_moisture < b.min_expected:
            if moisture_event and moisture_event.status == "PERSISTENT":
                root_zone_moisture = "LOW"
                rz_confidence = 0.8
                evidence.append({"code": "MOISTURE_DROP_PERSISTENT", "value": latest_reading.soil_moisture})
            else:
                root_zone_moisture = "NORMAL" # Wait for persistence
                evidence.append({"code": "MOISTURE_DROP_RECENT"})
        elif latest_reading.soil_moisture > b.max_expected:
            root_zone_moisture = "HIGH"
            evidence.append({"code": "MOISTURE_ABOVE_BASELINE"})
        else:
            root_zone_moisture = "NORMAL"

    # Contextual Modifiers for Root-Zone Confidence
    if root_zone_moisture == "LOW":
        if latest_reading.surrounding_temperature and latest_reading.surrounding_temperature > 32:
            rz_confidence = min(1.0, rz_confidence + 0.1)
            evidence.append({"code": "HIGH_SURROUNDING_TEMPERATURE"})
        if latest_reading.air_humidity and latest_reading.air_humidity < 40:
            rz_confidence = min(1.0, rz_confidence + 0.1)
            evidence.append({"code": "LOW_AIR_HUMIDITY"})

    # 2. Weather Fusion
    rain_prob = 0
    if weather_cache and (datetime.utcnow() - weather_cache.updated_at < timedelta(hours=12)):
        rain_prob = weather_cache.rain_probability
        if rain_prob > 50:
            evidence.append({"code": "HIGH_RAIN_PROBABILITY"})
        elif rain_prob < 20:
            evidence.append({"code": "LOW_RAIN_PROBABILITY"})
    else:
        evidence.append({"code": "WEATHER_UNAVAILABLE"})

    # 3. Cause Ranking & Recommendation
    risk_type = "NONE"
    risk_level = "LOW"
    action = "MONITOR"
    decision_confidence = 0.5

    # Counterfactual reasoning check conceptually inline:
    # If moisture was normal, we would not trigger WATER_DEFICIT.
    is_water_deficit = root_zone_moisture == "LOW"

    if is_water_deficit:
        risk_type = "WATER_DEFICIT"
        if rain_prob > 70:
            # Weather modifies recommendation urgency!
            risk_level = "MODERATE"
            action = "WAIT_FOR_RAIN"
            decision_confidence = rz_confidence * 0.9
            evidence.append({"code": "DELAY_IRRIGATION_RAIN_EXPECTED"})
        elif rain_prob < 30:
            risk_level = "HIGH"
            action = "CONSIDER_IRRIGATION"
            decision_confidence = rz_confidence * 0.95
        else:
            risk_level = "MODERATE"
            action = "CONSIDER_IRRIGATION"
            decision_confidence = rz_confidence * 0.8
            
    # Uncertainty / Low Confidence Safety
    # If baseline is very new (low obs count), reduce confidence heavily.
    if base_map.get("soil_moisture") and base_map["soil_moisture"].confidence < 0.3:
        action = "CHECK_FIELD"
        decision_confidence = 0.2
        evidence.append({"code": "BASELINE_CONFIDENCE_LOW"})

    status = "NORMAL"
    if risk_level == "MODERATE": status = "WATCH"
    if risk_level == "HIGH": status = "ATTENTION"
    if action == "CHECK_FIELD": status = "UNCERTAIN"
    if risk_type == "NONE" and status == "UNCERTAIN": action = "MONITOR"

    decision = {
        "field_status": status,
        "risk_type": risk_type,
        "risk_level": risk_level,
        "confidence": round(decision_confidence, 2),
        "recommendation_action": action,
        "evidence_summary": evidence,
        "root_zone": {
            "moisture_state": root_zone_moisture,
            "confidence": round(rz_confidence, 2)
        },
        "weather": {
            "rain_probability": rain_prob if weather_cache else None,
            "status": "ok" if weather_cache else "unavailable"
        }
    }

    # Store decision record
    rec = DecisionRecordModel(
        device_id=device_id, field_status=status, risk_type=risk_type, risk_level=risk_level,
        confidence=decision_confidence, recommendation_action=action, evidence_summary=json.dumps(evidence),
        root_zone_moisture=root_zone_moisture, root_zone_confidence=rz_confidence
    )
    db.add(rec)
    db.commit()

    return decision

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
