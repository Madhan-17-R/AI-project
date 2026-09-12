// =============================================================================
// Marudam — Baseline Schedule Recommender
// =============================================================================
// DETERMINISTIC rules-based system that recommends:
//   - Initial learning period (days)
//   - Review interval (days)
// based on: location, climate, crop, season, growth stage, weather variability.
//
// AI may EXPLAIN the reason, but CANNOT override these ranges.
// =============================================================================

export type WeatherVariability = 'stable' | 'moderate' | 'high';

export interface BaselineScheduleInput {
  climate_zone: string;            // From LOCATIONS
  season_id: string;               // KHARIF | RABI | ZAID
  crop_id: string;
  growth_stage_id: string;
  weather_variability: WeatherVariability;
  is_new_crop_or_stage?: boolean;  // Whether this is a fresh start due to crop/stage change
}

export interface BaselineScheduleResult {
  recommended_learning_days: number;
  recommended_review_interval_days: number;
  reason_code: string;
  reason_context: Record<string, string | number>;
}

// ─── Configurable limits ─────────────────────────────────────────────────────
const MIN_LEARNING_DAYS = 7;
const MAX_LEARNING_DAYS = 45;
const MIN_REVIEW_DAYS   = 14;
const MAX_REVIEW_DAYS   = 90;

// ─── Base periods by climate zone ────────────────────────────────────────────
const CLIMATE_BASE: Record<string, { learning: number; review: number }> = {
  'Coastal':              { learning: 14, review: 21 }, // High natural variability
  'Tropical Wet and Dry': { learning: 12, review: 28 },
  'Semi-Arid':            { learning: 10, review: 30 },
  'Tropical Monsoon':     { learning: 14, review: 21 },
  'Tropical Savanna':     { learning: 10, review: 28 },
  'Sub-Tropical':         { learning: 10, review: 30 },
};

// ─── Season modifiers ────────────────────────────────────────────────────────
const SEASON_MODIFIER: Record<string, { learning: number; review: number }> = {
  KHARIF: { learning: +4, review: -7 }, // Monsoon → more variability → more learning, shorter review window
  RABI:   { learning:  0, review:  0 }, // Winter → stable, baseline period
  ZAID:   { learning: -2, review: +7 }, // Summer → dry, stable, shorter learning
};

// ─── Critical growth stages requiring fresh baseline ─────────────────────────
const SENSITIVE_STAGES = new Set(['flowering', 'panicle', 'pod_dev', 'boll_dev']);

// ─── Weather variability multipliers ─────────────────────────────────────────
const VARIABILITY_MULTIPLIER: Record<WeatherVariability, number> = {
  stable:   0.85,
  moderate: 1.00,
  high:     1.40,
};

// ─── Main function ────────────────────────────────────────────────────────────
export function recommendBaselineSchedule(
  input: BaselineScheduleInput
): BaselineScheduleResult {
  const {
    climate_zone,
    season_id,
    crop_id,
    growth_stage_id,
    weather_variability,
    is_new_crop_or_stage = false,
  } = input;

  // 1. Start from climate base
  const base = CLIMATE_BASE[climate_zone] ?? { learning: 12, review: 28 };
  let learning_days = base.learning;
  let review_days   = base.review;

  // 2. Season modifier
  const season_mod = SEASON_MODIFIER[season_id] ?? { learning: 0, review: 0 };
  learning_days += season_mod.learning;
  review_days   += season_mod.review;

  // 3. Weather variability multiplier
  const mult = VARIABILITY_MULTIPLIER[weather_variability];
  learning_days = Math.round(learning_days * mult);
  review_days   = Math.round(review_days * (2 - mult + 0.15)); // inverse: high variability → shorter review interval

  // 4. Sensitive growth stages → slightly longer learning
  if (SENSITIVE_STAGES.has(growth_stage_id)) {
    learning_days = Math.round(learning_days * 1.15);
    review_days   = Math.round(review_days * 0.85); // More frequent review at sensitive stages
  }

  // 5. If this is a fresh start, bump learning
  if (is_new_crop_or_stage) {
    learning_days += 3;
  }

  // 6. Clamp to allowed range
  learning_days = clamp(learning_days, MIN_LEARNING_DAYS, MAX_LEARNING_DAYS);
  review_days   = clamp(review_days,   MIN_REVIEW_DAYS,   MAX_REVIEW_DAYS);

  // 7. Choose reason code
  let reason_code: string;
  if (is_new_crop_or_stage) {
    reason_code = 'NEW_CROP_OR_STAGE';
  } else if (weather_variability === 'high') {
    reason_code = 'HIGH_WEATHER_VARIABILITY';
  } else if (weather_variability === 'stable') {
    reason_code = 'STABLE_CONDITIONS';
  } else {
    reason_code = 'MODERATE_CONDITIONS';
  }

  return {
    recommended_learning_days: learning_days,
    recommended_review_interval_days: review_days,
    reason_code,
    reason_context: {
      climate_zone,
      season_id,
      crop_id,
      growth_stage_id,
      weather_variability,
      is_new_crop_or_stage: is_new_crop_or_stage ? 'true' : 'false',
    },
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Compute next review date ─────────────────────────────────────────────────
export function computeNextReviewDate(
  learningStartDate: Date,
  learningDays: number,
  reviewIntervalDays: number
): Date {
  const learningEnd = new Date(learningStartDate);
  learningEnd.setDate(learningEnd.getDate() + learningDays);
  const nextReview = new Date(learningEnd);
  nextReview.setDate(nextReview.getDate() + reviewIntervalDays);
  return nextReview;
}

// ─── Detect weather variability from weather cache ────────────────────────────
export function detectWeatherVariability(
  recentRainProbabilities: number[]
): WeatherVariability {
  if (recentRainProbabilities.length < 2) return 'moderate';
  const diffs = recentRainProbabilities
    .slice(1)
    .map((v, i) => Math.abs(v - recentRainProbabilities[i]));
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  if (avgDiff < 12) return 'stable';
  if (avgDiff < 30) return 'moderate';
  return 'high';
}
