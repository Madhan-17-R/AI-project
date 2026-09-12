-- =============================================================================
-- Marudam — Supabase PostgreSQL Schema
-- =============================================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query).
-- Row-Level Security is ENABLED on all farmer-owned tables.
-- A farmer can only read/write their own rows.
-- =============================================================================

-- ─── Enable UUID generation ─────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLE: profiles
-- One row per registered farmer. Linked to auth.users via user_id.
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  name        text not null,
  language    text not null default 'English',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Farmer can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Farmer can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Farmer can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- =============================================================================
-- TABLE: farms
-- A farmer may eventually own multiple farms; for MVP one is typical.
-- =============================================================================
create table if not exists public.farms (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'My Field',
  state       text not null,
  district    text not null,
  crop_id     text not null,
  sowing_date date,
  device_id   text not null default 'FIELD_001',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.farms enable row level security;

create policy "Farmer can read own farms"
  on public.farms for select
  using (auth.uid() = user_id);

create policy "Farmer can insert own farms"
  on public.farms for insert
  with check (auth.uid() = user_id);

create policy "Farmer can update own farms"
  on public.farms for update
  using (auth.uid() = user_id);

create policy "Farmer can delete own farms"
  on public.farms for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- TABLE: baseline_schedules
-- Stores the recommended learning period and review interval per farm.
-- Versioned — previous baselines are preserved, not deleted.
-- =============================================================================
create table if not exists public.baseline_schedules (
  id                        uuid primary key default gen_random_uuid(),
  farm_id                   uuid not null references public.farms(id) on delete cascade,
  user_id                   uuid not null references auth.users(id) on delete cascade,
  version                   integer not null default 1,
  is_active                 boolean not null default true,
  initial_learning_start    timestamptz not null default now(),
  recommended_learning_days integer not null default 14,
  current_learning_end      timestamptz,
  recommended_review_days   integer not null default 30,
  next_review_date          timestamptz,
  reason_code               text not null default 'DEFAULT',
  reason_context            jsonb,
  created_at                timestamptz not null default now()
);

alter table public.baseline_schedules enable row level security;

create policy "Farmer can read own schedules"
  on public.baseline_schedules for select
  using (auth.uid() = user_id);

create policy "Farmer can insert own schedules"
  on public.baseline_schedules for insert
  with check (auth.uid() = user_id);

create policy "Farmer can update own schedules"
  on public.baseline_schedules for update
  using (auth.uid() = user_id);

-- =============================================================================
-- TABLE: farmer_observations
-- Structured observations collected through chatbot interactions.
-- Only explicit, structured facts are stored — not full conversation logs.
-- =============================================================================
create table if not exists public.farmer_observations (
  id            uuid primary key default gen_random_uuid(),
  farm_id       uuid not null references public.farms(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  observed_at   timestamptz not null default now(),
  key           text not null,
  value         text not null,
  source        text not null default 'chatbot'
);

alter table public.farmer_observations enable row level security;

create policy "Farmer can read own observations"
  on public.farmer_observations for select
  using (auth.uid() = user_id);

create policy "Farmer can insert own observations"
  on public.farmer_observations for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- HELPER: auto-update updated_at timestamp
-- =============================================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger farms_updated_at
  before update on public.farms
  for each row execute procedure public.handle_updated_at();
