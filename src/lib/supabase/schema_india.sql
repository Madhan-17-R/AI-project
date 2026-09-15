-- =============================================================================
-- MARUDAM — Supabase Schema v3 (India Agricultural Context Data)
-- =============================================================================
-- This schema extends the existing tables and creates new tables for the
-- India agricultural datasets (crops, irrigation, water, languages).
-- =============================================================================

-- 1. ADD COLUMNS TO FARMS TABLE
-- (Using IF NOT EXISTS syntax for idempotency where possible, though alter table
-- add column doesn't directly support IF NOT EXISTS in all postgres versions
-- so we wrap it in a DO block)

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='soil_type') THEN
    ALTER TABLE public.farms ADD COLUMN soil_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='climate_zone') THEN
    ALTER TABLE public.farms ADD COLUMN climate_zone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='irrigation_method') THEN
    ALTER TABLE public.farms ADD COLUMN irrigation_method text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='irrigation_source') THEN
    ALTER TABLE public.farms ADD COLUMN irrigation_source text;
  END IF;
END $$;


-- 2. CREATE INDIA DATA TABLES

-- ─── Source Registry ────────────────────────────────────────────────────────
create table if not exists public.india_source_registry (
  source_id     text primary key,
  source_name   text not null,
  organization  text,
  source_url    text,
  source_year   text,
  role          text,
  created_at    timestamptz not null default now()
);

alter table public.india_source_registry enable row level security;
create policy "Public can read source registry" on public.india_source_registry for select using (true);
create policy "Service role can insert source registry" on public.india_source_registry for all using (auth.role() = 'service_role');


-- ─── Locations ─────────────────────────────────────────────────────────────
create table if not exists public.india_locations (
  state_code               text not null,
  district_code            text not null,
  state                    text not null,
  district                 text not null,
  state_census2011_code    text,
  district_census2011_code text,
  source_id                text references public.india_source_registry(source_id),
  source_year              text,
  source_url               text,
  created_at               timestamptz not null default now(),
  primary key (state_code, district_code)
);

-- Index for searching by name
create index if not exists idx_india_locations_names on public.india_locations (state, district);

alter table public.india_locations enable row level security;
create policy "Public can read locations" on public.india_locations for select using (true);
create policy "Service role can manage locations" on public.india_locations for all using (auth.role() = 'service_role');


-- ─── District Crops ────────────────────────────────────────────────────────
create table if not exists public.india_district_crops (
  id            uuid primary key default gen_random_uuid(),
  state_code    text not null,
  district_code text not null,
  state         text not null,
  district      text not null,
  crop          text not null,
  season        text,
  is_major_crop boolean not null default false,
  data_status   text not null,
  granularity   text not null,
  source_id     text references public.india_source_registry(source_id),
  source_year   text,
  source_url    text,
  note          text,
  created_at    timestamptz not null default now(),
  unique (state_code, district_code, crop, season)
);

create index if not exists idx_india_district_crops_loc on public.india_district_crops (state_code, district_code);

alter table public.india_district_crops enable row level security;
create policy "Public can read crops" on public.india_district_crops for select using (true);
create policy "Service role can manage crops" on public.india_district_crops for all using (auth.role() = 'service_role');


-- ─── District Irrigation ────────────────────────────────────────────────────
create table if not exists public.india_district_irrigation (
  state_code                      text not null,
  district_code                   text not null,
  state                           text not null,
  district                        text not null,
  primary_irrigation_method       text,
  primary_water_source            text,
  other_common_methods_or_sources text,
  data_status                     text not null,
  granularity                     text not null,
  source_id                       text references public.india_source_registry(source_id),
  source_year                     text,
  source_url                      text,
  note                            text,
  created_at                      timestamptz not null default now(),
  primary key (state_code, district_code)
);

alter table public.india_district_irrigation enable row level security;
create policy "Public can read irrigation" on public.india_district_irrigation for select using (true);
create policy "Service role can manage irrigation" on public.india_district_irrigation for all using (auth.role() = 'service_role');


-- ─── District Water Availability ───────────────────────────────────────────
-- Note: district_water.csv does not have state_code/district_code, only string names.
-- We will join on string names for this table, or resolve codes in the service.
create table if not exists public.india_district_water (
  state                                         text not null,
  district                                      text not null,
  rainfall_recharge_monsoon_ham                 numeric,
  other_recharge_monsoon_ham                    numeric,
  rainfall_recharge_nonmonsoon_ham              numeric,
  other_recharge_nonmonsoon_ham                 numeric,
  annual_groundwater_recharge_ham               numeric,
  natural_discharges_ham                        numeric,
  annual_extractable_groundwater_resource_ham   numeric,
  gw_extraction_irrigation_ham                  numeric,
  gw_extraction_industrial_ham                  numeric,
  gw_extraction_domestic_ham                    numeric,
  current_annual_groundwater_extraction_ham     numeric,
  annual_gw_allocation_domestic_2035_ham        numeric,
  net_groundwater_availability_future_use_ham   numeric,
  stage_groundwater_extraction_pct              numeric,
  derived_stage_class                           text,
  source_id                                     text references public.india_source_registry(source_id),
  source_year                                   text,
  source_url                                    text,
  data_status                                   text,
  created_at                                    timestamptz not null default now(),
  primary key (state, district)
);

alter table public.india_district_water enable row level security;
create policy "Public can read water" on public.india_district_water for select using (true);
create policy "Service role can manage water" on public.india_district_water for all using (auth.role() = 'service_role');


-- ─── District Languages ────────────────────────────────────────────────────
create table if not exists public.india_district_languages (
  state_code       text not null,
  district_code    text not null,
  state            text not null,
  district         text not null,
  major_language   text,
  mother_tongue    text,
  source_id        text references public.india_source_registry(source_id),
  source_year      text,
  source_url       text,
  data_granularity text not null,
  data_status      text not null,
  created_at       timestamptz not null default now(),
  primary key (state_code, district_code)
);

alter table public.india_district_languages enable row level security;
create policy "Public can read languages" on public.india_district_languages for select using (true);
create policy "Service role can manage languages" on public.india_district_languages for all using (auth.role() = 'service_role');
