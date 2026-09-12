# MARUDAM — Smart Soil & Plant Monitoring System

MARUDAM is an AI-powered agricultural monitoring system designed for Indian farmers. It uses a physical ESP32 sensor node connected to a laptop via USB, streams real-time sensor data through a local FastAPI backend, stores everything in Supabase, and presents a multilingual dashboard on the web.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    HARDWARE (LOCAL)                          │
│                                                              │
│  Sensors ──→ ESP32 ──→ Micro-USB ──→ Laptop                 │
│               │                         │                    │
│  (DS18B20,    │                    FastAPI Backend           │
│   DHT22,      │   JSON Lines            │                    │
│   BH1750,     │   @ 115200 baud         │                    │
│   Capacitive) │                         ↓                    │
│                                    Supabase (Cloud DB)       │
└──────────────────────────────────────────────────────────────┘
                                          │
                                          │ Realtime / REST
                                          ↓
┌──────────────────────────────────────────────────────────────┐
│                    CLOUD (VERCEL)                            │
│                                                              │
│  Next.js Dashboard ←─── Supabase Realtime                   │
│  (multilingual, AI chatbot, anomaly alerts)                  │
└──────────────────────────────────────────────────────────────┘
```

> **Critical**: Vercel **cannot** access COM6/COM7/USB ports. The ESP32 → FastAPI path is entirely local. The cloud path is Supabase ↔ Vercel.

---

## Project Structure

```
crop-monitor/                    ← Next.js application root
├── src/
│   ├── app/                     ← Next.js pages (App Router)
│   │   ├── page.tsx             ← Landing page
│   │   ├── dashboard/           ← Main sensor dashboard
│   │   ├── login/               ← Supabase authentication
│   │   ├── register/
│   │   ├── settings/
│   │   ├── help/
│   │   └── api/chat/            ← OpenAI chatbot API route
│   ├── components/              ← React components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        ← Browser Supabase client
│   │   │   ├── server.ts        ← Server-side Supabase client
│   │   │   ├── sensors.ts       ← Sensor query & Realtime utilities
│   │   │   ├── schema.sql       ← Existing schema (auth, profiles, farms)
│   │   │   └── schema_v2.sql    ← NEW: sensor/device/anomaly tables
│   │   ├── data/db.ts           ← Crop data & location lookup
│   │   ├── i18n/translations.ts ← EN/Hindi/Tamil/Telugu/Kannada
│   │   └── baseline/scheduler.ts
│   └── proxy.ts                 ← Next.js 16 session proxy
├── backend/
│   ├── app/                     ← New modular FastAPI backend
│   │   ├── main.py              ← FastAPI app factory
│   │   ├── config.py            ← Pydantic settings
│   │   ├── models/              ← Pydantic data models
│   │   ├── services/
│   │   │   ├── serial_manager.py   ← USB serial port detection & reader
│   │   │   ├── sensor_service.py   ← Data normalisation
│   │   │   ├── supabase_service.py ← Supabase writes
│   │   │   ├── device_service.py   ← Device status tracking
│   │   │   └── anomaly_service.py  ← Adaptive baseline + anomaly detection
│   │   ├── api/                    ← FastAPI routers
│   │   └── utils/logger.py
│   ├── legacy/main.py           ← PRESERVED original SQLite backend
│   ├── tests/                   ← Pytest tests
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                   ← Entry point: python run.py
├── esp32/
│   ├── include/config.h         ← Device config (gitignored)
│   └── src/
│       ├── main.cpp             ← Firmware (SERIAL mode default)
│       └── sensors.h           ← Sensor drivers
├── .env.local                   ← Frontend env (gitignored)
├── .env.local.example           ← Frontend env template
└── README.md
```

---

## Supported Sensors

| Sensor | Measurement | Interface | GPIO |
|--------|------------|-----------|------|
| Capacitive Moisture v1.2 | Soil Moisture (%) | ADC | GPIO 34 |
| DS18B20 (waterproof) | Soil Temperature (°C) | OneWire | GPIO 4 |
| DHT22 / AM2302 | Air Temperature + Humidity | Digital | GPIO 27 |
| BH1750 | Light Intensity (lux) | I2C | SDA/SCL |
| *(future)* pH sensor | Soil pH | Analog | — |
| *(future)* EC sensor | Soil EC (dS/m) | Analog | — |

---

## ESP32 JSON Protocol

The ESP32 outputs one JSON object per line over USB serial at 115200 baud:

```json
{
  "device_id": "MARUDAM-01",
  "timestamp": null,
  "soil_moisture": 62.4,
  "soil_temperature": 28.5,
  "soil_ph": null,
  "soil_ec": null,
  "air_temperature": 32.1,
  "humidity": 67.2,
  "light_lux": 450.0,
  "sensor_status": {
    "soil_moisture": "ok",
    "soil_temperature": "ok",
    "soil_ph": "unavailable",
    "soil_ec": "unavailable",
    "air_temperature": "ok",
    "humidity": "ok",
    "light_lux": "ok"
  }
}
```

- `timestamp` is always `null` — the FastAPI backend applies a server-side UTC timestamp.
- Unavailable sensors are `null` with status `"unavailable"`. Failed sensors are `null` with `"error"`.
- Startup diagnostic banners are printed once and ignored by the parser.

---

## Setup Guide

### 1. Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `src/lib/supabase/schema.sql` (existing auth schema).
3. Then run `src/lib/supabase/schema_v2.sql` (new sensor/device/anomaly tables).
4. In **Realtime**, enable these tables:
   - `sensor_readings`
   - `anomalies`
   - `devices`
5. Note your **Project URL**, **Publishable Key**, and **Service Role Key**.

### 2. ESP32 Firmware

```bash
cd esp32
```

The `include/config.h` file is gitignored. It already contains sensible defaults:
- `DEVICE_ID` = `"MARUDAM-01"`
- `COMMUNICATION_MODE` = `"SERIAL"` ← USB mode (no Wi-Fi needed)
- `SAMPLE_INTERVAL_MS` = `5000` (5 seconds)

Flash with PlatformIO:
```bash
pio run -t upload
```

Verify output:
```bash
pio device monitor --baud 115200
```
You should see JSON lines appearing every 5 seconds.

### 3. FastAPI Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and fill in:
#   SUPABASE_URL=
#   SUPABASE_SERVICE_ROLE_KEY=
#   DEVICE_ID=MARUDAM-01
#   SERIAL_PORT=AUTO

# Start the backend
python run.py
```

Expected log output:
```
[INFO] serial_manager — Scanning serial ports...
[INFO] serial_manager — ESP32 auto-detected on COM6
[INFO] serial_manager — Serial connection established on COM6 @ 115200 baud
[INFO] serial_manager — Received packet from MARUDAM-01 | moisture=55.2 temp=28.5 ...
[INFO] supabase_service — Sensor reading stored for MARUDAM-01
```

#### Mock Mode (no hardware)
```bash
# In .env:
MOCK_SERIAL=true
```
Generates realistic fake sensor data for frontend/Supabase testing.

### 4. Next.js Frontend

```bash
# From crop-monitor/ (root)
npm install

# Configure environment
copy .env.local.example .env.local
# Edit .env.local and fill in:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
#   OPENAI_API_KEY=       (optional, for AI chatbot)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Backend + subsystem health |
| `GET` | `/device/status` | ESP32 connection status |
| `GET` | `/device/ports` | List COM ports (for diagnosis) |
| `POST` | `/device/connect` | Manual port override |
| `GET` | `/sensor/latest` | Latest sensor reading |
| `GET` | `/sensor/history?limit=100` | Historical readings |
| `GET` | `/sensor/anomalies?limit=20` | Recent anomalies |
| `GET` | `/sensor/baseline` | Adaptive baseline state |

Legacy routes (backward compatible):
- `GET /api/status/{device_id}`
- `GET /api/sensors/latest/{device_id}`
- `GET /api/baseline/{device_id}`
- `GET /api/events/{device_id}`

---

## Environment Variables

### Frontend (`crop-monitor/.env.local`)

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Supabase publishable key (browser-safe) |
| `NEXT_PUBLIC_BACKEND_URL` | Public | Local FastAPI URL (default: `http://localhost:8000`) |
| `OPENAI_API_KEY` | **SECRET** | OpenAI key — server-side only, never prefix with `NEXT_PUBLIC_` |

### Backend (`backend/.env`)

| Variable | Type | Description |
|----------|------|-------------|
| `SUPABASE_URL` | Config | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET** | Service role key — NEVER expose to frontend |
| `DEVICE_ID` | Config | Must match ESP32 `DEVICE_ID` in `config.h` |
| `SERIAL_PORT` | Config | `AUTO` (recommended) or `COM6`, `COM7`, etc. |
| `MOCK_SERIAL` | Config | `false` in production; `true` for dev without hardware |
| `LOG_LEVEL` | Config | `INFO`, `DEBUG`, `WARNING`, `ERROR` |

---

## Vercel Deployment

1. Connect your GitHub repository to Vercel.
2. Set **Root Directory** to `crop-monitor` (the directory containing `package.json`).
3. Set **Framework Preset** to `Next.js`.
4. Add these **Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY` (optional)
5. Deploy.

> ⚠️ Do **not** add `NEXT_PUBLIC_BACKEND_URL` on Vercel — the Vercel-deployed site reads from Supabase, not from your laptop's COM port.

---

## Troubleshooting

### ESP32 not detected
```
[WARNING] ESP32 not detected on any COM port
```
- Check that the USB cable supports **data** (not charge-only).
- Check Device Manager for `Silicon Labs CP210x` or `CH340` driver.
- Try: `GET http://localhost:8000/device/ports` to see all available ports.
- Set `SERIAL_PORT=COM6` in `.env` as a manual override.

### `MIDDLEWARE_INVOCATION_FAILED` on Vercel
The proxy reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
Ensure both are set in **Vercel → Project Settings → Environment Variables** and redeploy.

### Backend not receiving data
- Verify ESP32 `COMMUNICATION_MODE` is `"SERIAL"` in `config.h`.
- Run `pio device monitor` to confirm JSON is appearing on the serial port.
- Check that no other program (Arduino IDE, PlatformIO monitor) has the port open.

### Supabase not receiving data
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`.
- Check backend logs for `[ERROR] supabase_service`.
- Verify `schema_v2.sql` has been run in Supabase SQL Editor.

### Dashboard shows stale data
- The dashboard shows `"☁️ Cloud"` when reading from Supabase and `"🔗 Local Device"` when connected to the local backend.
- Stale data is labelled with "last updated X ago".

---

## Running Tests

```bash
cd backend
venv\Scripts\activate
pytest tests/ -v
```

---

## AI / Anomaly Detection

The anomaly service (`backend/app/services/anomaly_service.py`) uses:
- **Adaptive baseline** with exponential smoothing (α = 0.05)
- **Persistence tracking** — risk escalates over consecutive out-of-range readings
- **Multi-sensor evidence fusion** — low moisture + high temperature + low humidity = water stress
- **Configurable thresholds** via environment variables

Risk levels: `NORMAL` → `LOW` → `MEDIUM` → `HIGH` → `CRITICAL`

**Modular design**: The `detect()` function has a clean interface. AI teammates can replace the algorithm by implementing the same function signature.
