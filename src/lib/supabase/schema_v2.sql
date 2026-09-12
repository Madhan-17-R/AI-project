-- =============================================================================
-- MARUDAM — Supabase Schema v2 (Sensor & Device Tables)
-- =============================================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
--
-- This extends the existing schema (profiles, farms, etc.) without modifying
-- any existing tables. Safe to run on a database that already has schema v1.
--
-- Tables added:
--   devices         — registered MARUDAM sensor nodes
--   sensor_readings — time-series sensor data
--   anomalies       — detected anomalies and risk events
--   device_events   — connection/disconnection/error lifecycle events
--
-- Security:
--   sensor_readings, anomalies, device_events → public SELECT (read-only).
--   Inserts and updates → backend service role only.
--   devices → public SELECT; upsert → service role only.
-- =============================================================================

-- ─── Enable UUID extension (may already be enabled) ──────────────────────────
create extension if not exists "pgcrypto";


-- =============================================================================
-- TABLE: devices
-- One row per physical MARUDAM sensor node. Upserted by the backend.
-- =============================================================================
create table if not exists public.devices (
  id          uuid        primary key default gen_random_uuid(),
  device_id   text        not null unique,
  device_name text        not null default 'MARUDAM Sensor Node',
  status      text        not null default 'UNKNOWN'
                check (status in ('CONNECTED','DISCONNECTED','SENSOR_ERROR','BACKEND_ERROR','UNKNOWN')),
  serial_port text,
  last_seen   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.devices enable row level security;

-- Anyone can read device status (public dashboard)
create policy "Public can read device status"
  on public.devices for select
  using (true);

-- Only the service role (backend) can insert or update
create policy "Service role can upsert devices"
  on public.devices for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.handle_devices_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists devices_updated_at on public.devices;
create trigger devices_updated_at
  before update on public.devices
  for each row execute procedure public.handle_devices_updated_at();


-- =============================================================================
-- TABLE: sensor_readings
-- Time-series sensor data. Inserted by the backend for every ESP32 packet.
-- =============================================================================
create table if not exists public.sensor_readings (
  id               uuid        primary key default gen_random_uuid(),
  device_id        text        not null references public.devices(device_id) on delete cascade,
  timestamp        timestamptz not null,
  soil_moisture    numeric(6,2),
  soil_temperature numeric(6,2),
  soil_ph          numeric(5,2),
  soil_ec          numeric(6,3),
  air_temperature  numeric(6,2),
  humidity         numeric(6,2),
  light_lux        numeric(10,2),
  created_at       timestamptz not null default now()
);

-- Index for common queries
create index if not exists sensor_readings_device_time_idx
  on public.sensor_readings (device_id, timestamp desc);

alter table public.sensor_readings enable row level security;

-- Public SELECT — the Vercel frontend reads sensor data without authentication
create policy "Public can read sensor readings"
  on public.sensor_readings for select
  using (true);

-- Only service role can insert
create policy "Service role can insert sensor readings"
  on public.sensor_readings for insert
  with check (auth.role() = 'service_role');


-- =============================================================================
-- TABLE: anomalies
-- Detected anomalies from the backend anomaly service.
-- =============================================================================
create table if not exists public.anomalies (
  id             uuid        primary key default gen_random_uuid(),
  device_id      text        not null references public.devices(device_id) on delete cascade,
  timestamp      timestamptz not null,
  sensor         text        not null,
  observed_value numeric(10,3),
  expected_value numeric(10,3),
  deviation      numeric(10,3),
  risk_level     text        not null default 'LOW'
                   check (risk_level in ('NORMAL','LOW','MEDIUM','HIGH','CRITICAL')),
  message        text        not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists anomalies_device_time_idx
  on public.anomalies (device_id, timestamp desc);

alter table public.anomalies enable row level security;

create policy "Public can read anomalies"
  on public.anomalies for select
  using (true);

create policy "Service role can insert anomalies"
  on public.anomalies for insert
  with check (auth.role() = 'service_role');


-- =============================================================================
-- TABLE: device_events
-- Lifecycle events: connected, disconnected, reconnected, errors.
-- =============================================================================
create table if not exists public.device_events (
  id         uuid        primary key default gen_random_uuid(),
  device_id  text        not null references public.devices(device_id) on delete cascade,
  timestamp  timestamptz not null,
  event_type text        not null
               check (event_type in ('connected','disconnected','reconnected','sensor_error','backend_error','recovery')),
  message    text        not null default '',
  created_at timestamptz not null default now()
);

create index if not exists device_events_device_time_idx
  on public.device_events (device_id, timestamp desc);

alter table public.device_events enable row level security;

create policy "Public can read device events"
  on public.device_events for select
  using (true);

create policy "Service role can insert device events"
  on public.device_events for insert
  with check (auth.role() = 'service_role');


-- =============================================================================
-- INITIAL DEVICE SEED
-- Insert the default MARUDAM-01 device so foreign key constraints work
-- before the backend upserts its first status update.
-- =============================================================================
insert into public.devices (device_id, device_name, status)
values ('MARUDAM-01', 'MARUDAM Sensor Node', 'UNKNOWN')
on conflict (device_id) do nothing;


-- =============================================================================
-- SUPABASE REALTIME
-- Enable Realtime broadcasts for the dashboard to subscribe to.
-- Run in SQL Editor or enable via Supabase Dashboard > Realtime.
-- =============================================================================
-- Uncomment and run if Realtime is not already enabled for these tables:
-- alter publication supabase_realtime add table public.sensor_readings;
-- alter publication supabase_realtime add table public.anomalies;
-- alter publication supabase_realtime add table public.devices;
