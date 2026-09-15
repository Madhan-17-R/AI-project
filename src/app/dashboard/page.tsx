'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MarudamLogo from '@/components/brand/MarudamLogo';
import AppShell from '@/components/layout/AppShell';
import MarudamChat from '@/components/chatbot/MarudamChat';

import {
  LOCATIONS,
  getCropName,
  getCropStageName,
  getSeasonName,
  estimateSeasonId,
  estimateGrowthStageId,
  getInitialBaseline,
} from '@/lib/data/db';
import {
  type Language,
  getTranslations,
  translateEvidence,
  translateRecommendation,
} from '@/lib/i18n/translations';
import { recommendBaselineSchedule, detectWeatherVariability } from '@/lib/baseline/scheduler';
import {
  fetchLatestReading,
  fetchRecentAnomalies,
  fetchDeviceStatus,
  subscribeToReadings,
  subscribeToAnomalies,
  subscribeToDeviceStatus,
  type SensorReading as SupabaseSensorReading,
  type Anomaly as SupabaseAnomaly,
  type DeviceRow,
} from '@/lib/supabase/sensors';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SensorData {
  soil_moisture:    number | null;
  soil_temperature: number | null;
  soil_ph:          number | null;
  soil_ec:          number | null;
  air_temperature:  number | null;
  humidity:         number | null;
  light_lux:        number | null;
  // Legacy field aliases kept for backward compat with existing dashboard render
  light_intensity:         number | null;
  air_humidity:            number | null;
  surrounding_temperature: number | null;
  timestamp: string;
}

type DataSource = 'supabase' | 'local' | 'none';
interface FieldBaseline {
  [key: string]: {
    center: number;
    min_expected: number;
    max_expected: number;
    confidence: number;
    observations_count: number;
  };
}
interface SensorEvent {
  id: number;
  event_type: string;
  sensor: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  magnitude: number;
  severity: string;
  confidence: number;
  status: string;
}
interface DecisionData {
  field_status: string;
  risk_type: string;
  risk_level: string;
  confidence: number;
  recommendation_action: string;
  evidence_summary: Array<{ code: string; value?: number }>;
  root_zone?: { moisture_state: string; confidence: number };
  weather?: { status: string; rain_probability?: number };
}

interface FarmProfile {
  name: string;
  language: Language;
  state: string;
  district: string;
  crop_id: string;
  sowing_date: string | null;
  device_id: string;
}

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_TEXT:  Record<string, string> = { NORMAL:'#4ade80',               WATCH:'#facc15',               ATTENTION:'#fb923c',                UNCERTAIN:'#94a3b8' };
const STATUS_BORDER:Record<string, string> = { NORMAL:'rgba(74,222,128,0.28)', WATCH:'rgba(250,204,21,0.28)', ATTENTION:'rgba(249,115,22,0.32)',   UNCERTAIN:'rgba(148,163,184,0.22)' };
const STATUS_DOT:   Record<string, string> = { NORMAL:'#4ade80',               WATCH:'#facc15',               ATTENTION:'#fb923c',                UNCERTAIN:'#94a3b8' };

const DEVICE_COLOR: Record<string, string> = { ONLINE:'#4ade80', STALE:'#facc15', OFFLINE:'#f87171', UNKNOWN:'#94a3b8' };

export default function DashboardPage() {
  const router = useRouter();
  const [farmerName,    setFarmerName]    = useState('');
  const [language,      setLanguage]      = useState<Language>('English');
  const [farmProfile,   setFarmProfile]   = useState<FarmProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [detailsOpen,   setDetailsOpen]   = useState(false);

  // ─── Sensor / backend state ────────────────────────────────────────────────
  const [sensorData,      setSensorData]      = useState<SensorData | null>(null);
  const [adaptiveBaseline,setAdaptiveBaseline]= useState<FieldBaseline | null>(null);
  const [events,          setEvents]          = useState<SensorEvent[]>([]);
  const [decision,        setDecision]        = useState<DecisionData | null>(null);
  const [deviceStatus,    setDeviceStatus]    = useState<'ONLINE'|'STALE'|'OFFLINE'|'UNKNOWN'>('UNKNOWN');
  const [sensorAge,       setSensorAge]       = useState(0); // seconds since last reading
  const [dataSource,      setDataSource]      = useState<DataSource>('none');
  const [cloudDevice,     setCloudDevice]     = useState<DeviceRow | null>(null);
  const [cloudAnomalies,  setCloudAnomalies]  = useState<SupabaseAnomaly[]>([]);
  const lastReadingTs = useRef<string | null>(null);
  const t = useMemo(() => getTranslations(language), [language]);

  // ─── Clock ─────────────────────────────────────────────────────────────────
  // Clock removed as it is no longer used in UI directly, replaced by sensorAge


  // ─── Load Supabase profile ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, language')
        .eq('user_id', user.id)
        .single();

      const { data: farm } = await supabase
        .from('farms')
        .select('state, district, crop_id, sowing_date, device_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (profile) {
        setFarmerName(profile.name ?? '');
        setLanguage((profile.language as Language) ?? 'English');
      }
      if (farm) {
        setFarmProfile({
          name: profile?.name ?? '',
          language: (profile?.language as Language) ?? 'English',
          state: farm.state,
          district: farm.district,
          crop_id: farm.crop_id ?? 'tomato',
          sowing_date: farm.sowing_date,
          device_id: farm.device_id ?? 'FIELD_001',
        });
      }
      setProfileLoaded(true);
    };
    load();
  }, [router]);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ language: newLang }).eq('user_id', user.id);
    }
  };

  // ─── Data sources ──────────────────────────────────────────────────────────
  const deviceId = farmProfile?.device_id ?? 'MARUDAM-01';
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Helper: map Supabase SensorReading to local SensorData shape
  const mapSupabaseReading = useCallback((r: SupabaseSensorReading): SensorData => ({
    soil_moisture:           r.soil_moisture,
    soil_temperature:        r.soil_temperature,
    soil_ph:                 r.soil_ph,
    soil_ec:                 r.soil_ec,
    air_temperature:         r.air_temperature,
    humidity:                r.humidity,
    light_lux:               r.light_lux,
    // Legacy aliases for existing rendering code
    light_intensity:         r.light_lux,
    air_humidity:            r.humidity,
    surrounding_temperature: r.air_temperature,
    timestamp:               r.timestamp,
  }), []);

  // ── 1. Supabase initial fetch + Realtime subscriptions ────────────────────
  useEffect(() => {
    if (!profileLoaded) return;

    // Initial fetch from Supabase
    const init = async () => {
      const [reading, anomalies, device] = await Promise.all([
        fetchLatestReading(deviceId),
        fetchRecentAnomalies(deviceId, 20),
        fetchDeviceStatus(deviceId),
      ]);

      if (reading) {
        // Only apply if newer than what we have
        if (!lastReadingTs.current || reading.timestamp > lastReadingTs.current) {
          lastReadingTs.current = reading.timestamp;
          setSensorData(mapSupabaseReading(reading));
          setSensorAge(0);
          setDataSource('supabase');
        }
      }
      if (anomalies.length > 0) setCloudAnomalies(anomalies);
      if (device) setCloudDevice(device);
    };
    init();

    // Realtime: new sensor reading inserted → update dashboard
    const unsubReadings = subscribeToReadings(deviceId, (reading) => {
      if (!lastReadingTs.current || reading.timestamp > lastReadingTs.current) {
        lastReadingTs.current = reading.timestamp;
        setSensorData(mapSupabaseReading(reading));
        setSensorAge(0);
        setDataSource('supabase');
      }
    });

    // Realtime: new anomaly inserted
    const unsubAnomalies = subscribeToAnomalies(deviceId, (anomaly) => {
      setCloudAnomalies(prev => [anomaly, ...prev].slice(0, 20));
    });

    // Realtime: device status changed
    const unsubDevice = subscribeToDeviceStatus(deviceId, (device) => {
      setCloudDevice(device);
    });

    return () => {
      unsubReadings();
      unsubAnomalies();
      unsubDevice();
    };
  }, [profileLoaded, deviceId, mapSupabaseReading]);

  // ── 2. Local backend polling (fallback for local dev) ─────────────────────
  const fetchBackend = useCallback(async () => {
    try {
      const [sr, br, er, dr, st] = await Promise.allSettled([
        fetch(`${BACKEND_URL}/api/sensors/latest/${deviceId}`),
        fetch(`${BACKEND_URL}/api/baseline/${deviceId}`),
        fetch(`${BACKEND_URL}/api/events/${deviceId}`),
        fetch(`${BACKEND_URL}/api/decision/${deviceId}`),
        fetch(`${BACKEND_URL}/api/status/${deviceId}`),
      ]);

      let localHasData = false;
      if (sr.status === 'fulfilled' && sr.value.ok) {
        const d = await sr.value.json();
        // Only override Supabase data if local data is newer
        const localTs = d.timestamp as string | null;
        if (!lastReadingTs.current || (localTs && localTs > lastReadingTs.current)) {
          lastReadingTs.current = localTs || lastReadingTs.current;
          // Map legacy field names to new names
          setSensorData({
            soil_moisture:           d.soil_moisture ?? null,
            soil_temperature:        d.soil_temperature ?? null,
            soil_ph:                 d.soil_ph ?? null,
            soil_ec:                 d.soil_ec ?? null,
            air_temperature:         d.air_temperature ?? d.surrounding_temperature ?? null,
            humidity:                d.humidity ?? d.air_humidity ?? null,
            light_lux:               d.light_lux ?? d.light_intensity ?? null,
            light_intensity:         d.light_lux ?? d.light_intensity ?? null,
            air_humidity:            d.humidity ?? d.air_humidity ?? null,
            surrounding_temperature: d.air_temperature ?? d.surrounding_temperature ?? null,
            timestamp:               localTs || new Date().toISOString(),
          });
          setSensorAge(0);
          setDataSource('local');
          localHasData = true;
        }
      }
      if (br.status === 'fulfilled' && br.value.ok) {
        const d = await br.value.json();
        if (Object.keys(d).length > 0) setAdaptiveBaseline(d);
      }
      if (er.status === 'fulfilled' && er.value.ok) setEvents(await er.value.json());
      if (dr.status === 'fulfilled' && dr.value.ok) setDecision(await dr.value.json());
      if (st.status === 'fulfilled' && st.value.ok) {
        const d = await st.value.json();
        setDeviceStatus(d.status ?? 'UNKNOWN');
      }
    } catch {
      // Local backend offline — Supabase Realtime is the primary source
    }
  }, [deviceId, BACKEND_URL]);

  useEffect(() => {
    let alive = true;
    const run = () => { if (alive) fetchBackend(); };
    run();
    const id = setInterval(run, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [fetchBackend]);

  // Tick sensor age
  useEffect(() => {
    if (!sensorData) return;
    const id = setInterval(() => setSensorAge(a => a + 1), 1000);
    return () => clearInterval(id);
  }, [sensorData]);

  // ─── Derived context ───────────────────────────────────────────────────────
  const cropId      = farmProfile?.crop_id ?? 'tomato';
  const sowingDate  = farmProfile?.sowing_date ?? '';
  const seasonId    = useMemo(() => estimateSeasonId(sowingDate),         [sowingDate]);
  const stageId     = useMemo(() => estimateGrowthStageId(cropId, sowingDate), [cropId, sowingDate]);
  const locationInfo = useMemo(() => LOCATIONS.find(l => l.state === farmProfile?.state && l.district === farmProfile?.district), [farmProfile]);
  const cropProfile = useMemo(() => getInitialBaseline(cropId, stageId), [cropId, stageId]);

  // Baseline schedule recommendation
  const recentRainProbs = useMemo(() => {
    if (decision?.weather?.rain_probability != null) return [decision.weather.rain_probability];
    return [];
  }, [decision]);

  const baselineSchedule = useMemo(() => recommendBaselineSchedule({
    climate_zone: locationInfo?.climate_zone ?? 'Tropical Wet and Dry',
    season_id: seasonId,
    crop_id: cropId,
    growth_stage_id: stageId,
    weather_variability: detectWeatherVariability(recentRainProbs),
  }), [locationInfo, seasonId, cropId, stageId, recentRainProbs]);

  // ─── Field context object for chatbot ─────────────────────────────────────
  const fieldContext = useMemo(() => ({
    farmer_name: farmerName,
    language,
    location: farmProfile ? { state: farmProfile.state, district: farmProfile.district, climate_zone: locationInfo?.climate_zone } : null,
    crop: { id: cropId, name: getCropName(cropId, language), growth_stage: getCropStageName(cropId, stageId, language), season: getSeasonName(seasonId, language) },
    sensor: sensorData ? {
      soil_moisture: sensorData.soil_moisture,
      soil_temperature: sensorData.soil_temperature,
      air_humidity: sensorData.air_humidity,
      surrounding_temperature: sensorData.surrounding_temperature,
      last_reading_seconds_ago: sensorAge,
    } : null,
    decision: decision ? {
      field_status: decision.field_status,
      risk_type: decision.risk_type,
      risk_level: decision.risk_level,
      recommendation_action: decision.recommendation_action,
      confidence: decision.confidence,
      evidence: decision.evidence_summary?.map(e => ({ code: e.code, value: e.value })),
      root_zone: decision.root_zone,
      weather_rain_probability: decision.weather?.rain_probability,
      weather_status: decision.weather?.status,
    } : null,
    adaptive_baseline: adaptiveBaseline,
    baseline_schedule: baselineSchedule,
    device_status: deviceStatus,
  }), [farmerName, language, farmProfile, locationInfo, cropId, stageId, seasonId, sensorData, sensorAge, decision, adaptiveBaseline, baselineSchedule, deviceStatus]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fieldStatus = decision?.field_status ?? 'UNCERTAIN';
  const recAction   = decision?.recommendation_action ?? '';

  const formatSensorAge = (sec: number): string => {
    if (sec < 60)  return t.common.justNow;
    if (sec < 3600) return `${Math.floor(sec / 60)} ${t.common.minutes} ${t.common.ago}`;
    return `${Math.floor(sec / 3600)} ${t.common.hours} ${t.common.ago}`;
  };

  const sensorLabel = (key: string): string => ({
    soil_moisture:           t.dashboard.sensorSoilMoisture,
    soil_temperature:        t.dashboard.sensorSoilTemperature,
    air_humidity:            t.dashboard.sensorAirHumidity,
    surrounding_temperature: t.dashboard.sensorSurroundingTemp,
    light_intensity:         t.dashboard.sensorLight,
  }[key] ?? key);

  const sensorUnit = (key: string): string => ({
    soil_moisture: t.common.percent, soil_temperature: t.common.celsius,
    air_humidity: t.common.percent, surrounding_temperature: t.common.celsius,
    light_intensity: t.common.lux,
  }[key] ?? '');

  const sensorRange = (key: string): { lo: number; hi: number } => {
    const b = adaptiveBaseline?.[key];
    if (b) return { lo: b.min_expected, hi: b.max_expected };
    return {
      soil_moisture: { lo: cropProfile.soil_moisture_min, hi: cropProfile.soil_moisture_max },
      soil_temperature: { lo: cropProfile.optimal_temp_min, hi: cropProfile.optimal_temp_max },
      air_humidity: { lo: 40, hi: 90 },
      surrounding_temperature: { lo: 20, hi: 38 },
      light_intensity: { lo: 20000, hi: 80000 },
    }[key] ?? { lo: 0, hi: 100 };
  };

  const sensorStatus = (key: string, val: number | null): 'normal' | 'below' | 'above' => {
    if (val == null) return 'normal';
    const { lo, hi } = sensorRange(key);
    if (val < lo) return 'below';
    if (val > hi) return 'above';
    return 'normal';
  };

  // ─── Style helpers ─────────────────────────────────────────────────────────
  // Inline styles are now used directly in elements


  // ─── Loading state ─────────────────────────────────────────────────────────
  if (!profileLoaded) {
    return (
      <div style={{minHeight:'100svh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-base)',color:'var(--text-muted)',fontSize:'0.9rem',flexDirection:'column',gap:'1.5rem'}}>
        <div style={{ animation: 'pulse 2s infinite ease-in-out' }}>
          <MarudamLogo size={48} />
        </div>
        <span>{t.common.loading}</span>
      </div>
    );
  }

  const isEspConnected = !!sensorData && sensorAge < 600; // less than 10 mins old

  // Cloud device status from Supabase (for Vercel where local backend is unavailable)
  const cloudConnected = cloudDevice?.status === 'CONNECTED';
  const effectiveDeviceStatus = dataSource === 'local' ? deviceStatus : (cloudDevice?.status ?? 'UNKNOWN');


  return (
    <AppShell
      activeRoute="/dashboard"
      language={language}
      onLanguageChange={handleLanguageChange}
      onLogout={handleLogout}
      pageTitle={t.dashboard?.title || 'Dashboard'}
      farmContext={farmProfile ? {
        cropName: getCropName(cropId, language),
        district: farmProfile.district,
        state: farmProfile.state,
        deviceId: farmProfile.device_id,
        growthStage: getCropStageName(cropId, stageId, language),
      } : undefined}
    >
      <div style={{
        padding: '1.5rem 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        minHeight: '100%',
        backgroundImage: "linear-gradient(rgba(5, 16, 6, 0.76), rgba(5, 16, 6, 0.86)), url('/farm_bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}>

        {/* â”€â”€ TWO-COLUMN GRID â”€â”€ */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,2fr) minmax(0,1fr)', gap:'1.5rem', alignItems:'start' }}>

          {/* LEFT: Live Sensors */}
          <div id="section-sensors" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ margin:0, fontSize:'1rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.01em' }}>Live Sensors</h2>
              {sensorAge > 0 && <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{t.dashboard.updatedLabel} {formatSensorAge(sensorAge)}</span>}
            </div>

            {!isEspConnected ? (
              <div style={{ background:'rgba(255,255,255,0.06)', border:'1.5px dashed rgba(255,255,255,0.2)', borderRadius:'var(--radius-card)', padding:'3rem 2rem', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', boxShadow:'var(--shadow-card)', backdropFilter:'blur(4px)' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(168,224,96,0.18)', border:'1px solid rgba(168,224,96,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8e060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line>
                    <line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line>
                    <line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin:'0 0 0.375rem 0', fontSize:'1rem', fontWeight:600, color:'#ffffff' }}>{t.dashboard.waitingEsp32Title}</h3>
                  <p style={{ margin:0, fontSize:'0.875rem', color:'rgba(255,255,255,0.8)', maxWidth:'360px', lineHeight:1.5 }}>{t.dashboard.waitingEsp32Desc}</p>
                </div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:'0.75rem' }}>
                {(['soil_moisture','soil_temperature','soil_ph','soil_ec','air_temperature','humidity','light_lux'] as const).map(key => {
                  const val = sensorData[key];
                  const stat = sensorStatus(key, val);
                  const r = sensorRange(key);
                  const col = stat === 'below' ? '#3b82f6' : stat === 'above' ? '#f97316' : 'var(--status-normal)';
                  const isMoisture = key === 'soil_moisture';
                  const isHeat = key.includes('temperature');
                  const isLight = key === 'light_lux';
                  const isHumid = key === 'humidity';
                  const isPh    = key === 'soil_ph';
                  const isEc    = key === 'soil_ec';
                  return (
                    <div key={key} onClick={() => setDetailsOpen(true)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'0.75rem', padding:'1rem', cursor:'pointer', display:'flex', flexDirection:'column', gap:'0.625rem', boxShadow:'var(--shadow-card)', transition:'box-shadow 0.2s' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <span style={{ fontSize:'0.74rem', fontWeight:600, color:'var(--text-muted)', lineHeight:1.3, maxWidth:'72%' }}>{sensorLabel(key)}</span>
                        <div style={{ width:26, height:26, borderRadius:'0.375rem', background:'var(--brand-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {isMoisture && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>}
                          {isHeat && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>}
                          {isLight && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line></svg>}
                          {isHumid && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>}
                          {(isPh || isEc) && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line></svg>}
                        </div>
                      </div>
                      <div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:'0.15rem' }}>
                          <span style={{ fontSize:'1.45rem', fontWeight:700, color: val == null ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight:1 }}>
                            {val != null ? (isLight ? Math.round(val).toLocaleString() : isPh ? val.toFixed(1) : isEc ? val.toFixed(2) : val.toFixed(1)) : '--'}
                          </span>
                          <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:500 }}>{sensorUnit(key)}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginTop:'0.2rem' }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:col, flexShrink:0, display:'inline-block' }} />
                          <span style={{ fontSize:'0.68rem', fontWeight:600, color:col }}>
                            {stat === 'below' ? t.dashboard.statusLow : stat === 'above' ? t.dashboard.statusHigh : t.dashboard.statusOptimal}
                          </span>
                          <span style={{ fontSize:'0.65rem', color:'var(--text-faint)' }}>Â· {r.lo.toFixed(0)}â€“{r.hi.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: AI insight cards */}
          <div id="section-insights" style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>



            {/* AI ADAPTIVE BASELINE */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-card)', padding:'1rem 1.125rem', boxShadow:'var(--shadow-card)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text-muted)', textTransform:'uppercase' }}>AI Adaptive Baseline</span>
              </div>
              {adaptiveBaseline ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {Object.entries(adaptiveBaseline).slice(0,2).map(([key, b]) => {
                    const pct = Math.min(100, Math.max(0, Math.round(b.confidence * 100)));
                    return (
                      <div key={key} style={{ padding:'0.5rem 0.625rem', background:'var(--bg-base)', borderRadius:'0.5rem', border:'1px solid var(--border-very-subtle)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                          <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:500 }}>{sensorLabel(key)}</span>
                          <span style={{ fontSize:'0.72rem', color:'var(--brand-primary)', fontWeight:700 }}>{pct}%</span>
                        </div>
                        <div style={{ background:'var(--border-subtle)', borderRadius:9999, height:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:9999, width:`${pct}%`, background:'var(--brand-primary)', transition:'width 1s ease-in-out' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.5 }}>{t.dashboard.initialLearningActive}</p>
              )}
            </div>

            {/* WEATHER CONTEXT */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-card)', padding:'1rem 1.125rem', boxShadow:'var(--shadow-card)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/></svg>
                <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text-muted)', textTransform:'uppercase' }}>Weather Context</span>
              </div>
              {decision?.weather?.rain_probability != null ? (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>
                    <div>
                      <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>
                        {Math.round(decision.weather.rain_probability)}<span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:500 }}>%</span>
                      </div>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{t.dashboard.rainProbability}</span>
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                    {decision.weather.rain_probability > 60 ? t.dashboard.weatherHighRainDesc : t.dashboard.weatherLowRainDesc}
                  </p>
                </div>
              ) : (
                <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-muted)' }}>{t.dashboard.weatherUnavailable}</p>
              )}
            </div>

            {/* ROOT-ZONE */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-card)', padding:'1rem 1.125rem', boxShadow:'var(--shadow-card)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M9 6c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2.2-3 6-3 6S9 8.2 9 6z"/></svg>
                <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text-muted)', textTransform:'uppercase' }}>Root-Zone Condition</span>
              </div>
              {decision?.root_zone ? (
                <div>
                  <div style={{ fontSize:'1rem', fontWeight:700, color: decision.root_zone.moisture_state === 'LOW' ? '#3b82f6' : decision.root_zone.moisture_state === 'HIGH' ? '#f97316' : 'var(--brand-primary)', marginBottom:'0.3rem' }}>
                    {t.dashboard[`rootZone${decision.root_zone.moisture_state.charAt(0)+decision.root_zone.moisture_state.slice(1).toLowerCase()}` as keyof typeof t.dashboard] ?? decision.root_zone.moisture_state}
                  </div>
                  <p style={{ margin:'0 0 0.3rem', fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                    {decision.root_zone.moisture_state === 'LOW' ? t.dashboard.rootZoneLowDesc : decision.root_zone.moisture_state === 'HIGH' ? t.dashboard.rootZoneHighDesc : t.dashboard.rootZoneNormalDesc}
                  </p>
                  <span style={{ fontSize:'0.68rem', color:'var(--text-faint)' }}>{t.dashboard.aiEstimated} Â· {Math.round(decision.root_zone.confidence * 100)}%</span>
                </div>
              ) : (
                <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-muted)' }}>{t.dashboard.waitingRootZone}</p>
              )}
            </div>

            {/* FIELD EVENTS */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-card)', padding:'1rem 1.125rem', boxShadow:'var(--shadow-card)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text-muted)', textTransform:'uppercase' }}>Field Events</span>
              </div>
              {events.length === 0 ? (
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--text-muted)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <p style={{ margin:0, fontSize:'0.82rem' }}>{t.dashboard.noUnusualEvents}</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {events.slice(0, 4).map((ev) => {
                    const statusColor: Record<string,string> = { NEW:'#f97316', ONGOING:'#f59e0b', PERSISTENT:'#ef4444', RESOLVED:'#22c55e' };
                    const sc = statusColor[ev.status] ?? '#94a3b8';
                    return (
                      <div key={ev.id} style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:sc, marginTop:'0.35rem', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.1rem' }}>
                            <span style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-primary)' }}>{sensorLabel(ev.sensor)}</span>
                            <span style={{ fontSize:'0.63rem', color:sc, fontWeight:700, padding:'0.1rem 0.3rem', borderRadius:'4px', background:`${sc}18` }}>{ev.status}</span>
                          </div>
                          <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{ev.duration_minutes} {t.dashboard.durationMins} Â· {ev.severity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        <div style={{ height:'2rem' }} />
      </div>{/* end background wrapper */}

      {/* Sensor details modal */}
      {detailsOpen && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'1rem', padding:'1.75rem', width:'100%', maxWidth:'460px', boxShadow:'var(--shadow-card-hover)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <h3 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)' }}>{t.dashboard.sensorDetailsTitle}</h3>
              <button onClick={() => setDetailsOpen(false)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.5rem', lineHeight:1 }}>Ã—</button>
            </div>
            <p style={{ margin:'0 0 1.25rem', color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.6 }}>{t.dashboard.sensorDetailsDesc}</p>
            <button onClick={() => setDetailsOpen(false)} style={{ background:'var(--brand-light)', color:'var(--brand-primary)', border:'1px solid var(--border-brand-subtle)', borderRadius:'0.625rem', padding:'0.625rem 1.25rem', width:'100%', fontWeight:600, cursor:'pointer', fontSize:'0.875rem' }}>{t.chat.close}</button>
          </div>
        </div>
      )}

      <MarudamChat language={language} fieldContext={fieldContext} />
    </AppShell>
  );
}
