-- =============================================================================
-- MARUDAM — Schema v3 Migration
-- Context-Aware Adaptive Baseline Algorithm
-- =============================================================================
-- Run in Supabase SQL Editor BEFORE deploying the new backend.
-- Safe to re-run: all statements use IF NOT EXISTS / DO NOTHING patterns.
-- =============================================================================

-- ─── 1. adaptive_baselines table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.adaptive_baselines (
  id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id               text          NOT NULL,
  sensor                  text          NOT NULL,

  -- Robust statistics
  baseline_center         numeric(10,4),
  mad                     numeric(10,4),
  k_multiplier            numeric(5,2)  DEFAULT 3.0,

  -- Expected range (after MAD_eff floor + physical/crop clamping)
  min_expected            numeric(10,4),
  max_expected            numeric(10,4),

  -- Quality and confidence
  confidence              numeric(5,2),
  observations            integer       DEFAULT 0,
  variability_score       numeric(5,4),
  anomaly_rate            numeric(5,4),
  sensor_quality          numeric(5,4),

  -- Timing recommendations
  creation_period_hours   numeric(8,2),
  update_interval_hours   numeric(8,2),
  learning_started_at     timestamptz,
  learning_completed_at   timestamptz,
  next_update_at          timestamptz,

  -- State machine
  baseline_status         text          DEFAULT 'LEARNING'
    CHECK (baseline_status IN ('LEARNING','ACTIVE','LOW_CONFIDENCE','REBUILDING')),

  -- JSONB blobs for rich state (context, TOD, explanation)
  context_snapshot        jsonb,
  anomaly_evidence_count  integer       DEFAULT 0,
  tod_coverage_json       jsonb,
  explanation_json        jsonb,

  updated_at              timestamptz   NOT NULL DEFAULT now(),

  -- Unique per device/sensor pair — upsert target
  UNIQUE (device_id, sensor)
);

-- Foreign key (add if devices table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'devices'
  ) THEN
    ALTER TABLE public.adaptive_baselines
      DROP CONSTRAINT IF EXISTS adaptive_baselines_device_id_fkey;
    ALTER TABLE public.adaptive_baselines
      ADD CONSTRAINT adaptive_baselines_device_id_fkey
      FOREIGN KEY (device_id) REFERENCES public.devices(device_id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

-- ─── 2. Index for fast device lookups ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_adaptive_baselines_device
  ON public.adaptive_baselines (device_id);

-- ─── 3. Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.adaptive_baselines ENABLE ROW LEVEL SECURITY;

-- Allow public read (dashboard can display without auth)
DROP POLICY IF EXISTS "Public can read adaptive baselines" ON public.adaptive_baselines;
CREATE POLICY "Public can read adaptive baselines"
  ON public.adaptive_baselines
  FOR SELECT
  USING (true);

-- Only service role can write (backend uses service_role_key)
DROP POLICY IF EXISTS "Service role can upsert adaptive baselines" ON public.adaptive_baselines;
CREATE POLICY "Service role can upsert adaptive baselines"
  ON public.adaptive_baselines
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─── 4. farms: add soil_type column ──────────────────────────────────────────
-- Defaults to 'unknown' so existing rows are not broken.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'farms'
  ) THEN
    ALTER TABLE public.farms
      ADD COLUMN IF NOT EXISTS soil_type text NOT NULL DEFAULT 'unknown';
  END IF;
END;
$$;

-- ─── Verification query (run after migration to confirm) ──────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'adaptive_baselines'
-- ORDER BY ordinal_position;
