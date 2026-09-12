'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MarudamLogo from '@/components/brand/MarudamLogo';
import MarudamHeader from '@/components/layout/MarudamHeader';
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
    <div style={{ minHeight:'100svh', background:'var(--bg-base)', color:'var(--text-primary)', display:'flex', flexDirection:'column', fontFamily:'system-ui, -apple-system, sans-serif' }}>
      
      {/* ════════════════════════════════ HEADER ════════════════════════════ */}
      <MarudamHeader 
        activeRoute="dashboard" 
        language={language} 
        onLanguageChange={handleLanguageChange} 
        onLogout={handleLogout} 
      />

      {/* ════════════════════════════════ BODY ══════════════════════════════ */}
      <main style={{ flex:1, padding:'clamp(1.5rem, 5vw, 3rem)', maxWidth:'1200px', margin:'0 auto', width:'100%', display:'flex', flexDirection:'column', gap:'2rem' }}>

        {/* HERO / WELCOME */}
        <section id="section-field" style={{ position:'relative', padding:'clamp(1.5rem, 4vw, 2.5rem)', borderRadius:'1.5rem', overflow:'hidden', display:'flex', flexDirection:'column', minHeight:'340px', border:'1px solid var(--border-brand-subtle)', boxShadow:'0 20px 40px var(--bg-glass-strong)' }}>
           {/* Background Image with Dark Forest Overlay */}
           <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', backgroundImage:'url("/farm_bg.jpg")', backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }} />
           <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'linear-gradient(135deg, rgba(10,23,11,0.85) 0%, rgba(5,12,5,0.95) 100%)', zIndex:0 }} />
           
           <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:'2rem', height:'100%', justifyContent:'space-between' }}>
             
             {/* TOP ROW: Welcome & Farm Info */}
             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1.5rem' }}>
               <div>
                 <h1 style={{ margin:0, fontSize:'clamp(1.8rem, 4vw, 2.2rem)', fontWeight:800, color:'#f8f9fa', letterSpacing:'-0.02em' }}>
                   {t.dashboard.welcomeMorning}, {farmerName || t.dashboard.farmerName} 🌱
                 </h1>
                 <p style={{ margin:'0.5rem 0 0 0', fontSize:'1.05rem', color:'rgba(255,255,255,0.8)', fontWeight:400, maxWidth:'600px', lineHeight:1.5 }}>
                   {t.dashboard.monitoringMsg.replace('{crop}', getCropName(cropId, language)).replace('{district}', locationInfo?.district || t.dashboard.district)}
                 </p>
               </div>
               
               <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                 <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', padding:'0.6rem 1.2rem', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.08)' }}>
                   <span style={{ display:'block', fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{t.dashboard.growthStage}</span>
                   <span style={{ fontSize:'0.95rem', fontWeight:600, color:'white' }}>{getCropStageName(cropId, stageId, language)}</span>
                 </div>
                 <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', padding:'0.6rem 1.2rem', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.08)' }}>
                   <span style={{ display:'block', fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{t.dashboard.plantedLabel}</span>
                   <span style={{ fontSize:'0.95rem', fontWeight:600, color:'white' }}>{sowingDate || t.dashboard.notSet}</span>
                 </div>
                 <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', padding:'0.6rem 1.2rem', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.08)' }}>
                   <span style={{ display:'block', fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{t.dashboard.deviceStatus}</span>
                   <span style={{ fontSize:'0.95rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.4rem', color: DEVICE_COLOR[deviceStatus] || '#94a3b8' }}>
                     <span style={{ width:8, height:8, borderRadius:'50%', background: DEVICE_COLOR[deviceStatus] || '#94a3b8', boxShadow: deviceStatus==='ONLINE' ? `0 0 8px ${DEVICE_COLOR.ONLINE}` : 'none' }} />
                     {t.dashboard[`device${deviceStatus.charAt(0)+deviceStatus.slice(1).toLowerCase()}` as keyof typeof t.dashboard] ?? deviceStatus}
                   </span>
                 </div>
               </div>
             </div>

             {/* BOTTOM ROW: Field Health & Recommendation */}
             <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', marginTop:'auto' }}>
               
               {/* Field Health */}
               <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:`1px solid ${STATUS_BORDER[fieldStatus] || 'rgba(255,255,255,0.1)'}`, borderRadius:'1rem', padding:'1.25rem', display:'flex', alignItems:'center', gap:'1.25rem', boxShadow:'0 10px 25px rgba(0,0,0,0.3)' }}>
                 <div style={{ position:'relative', width:'64px', height:'64px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                   <svg width="64" height="64" viewBox="0 0 120 120" style={{ position:'absolute', top:0, left:0, transform:'rotate(-90deg)' }}>
                     <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                     <circle cx="60" cy="60" r="54" fill="none" stroke={STATUS_DOT[fieldStatus] || '#94a3b8'} strokeWidth="8" strokeDasharray="339" strokeDashoffset={fieldStatus === 'NORMAL' ? 0 : fieldStatus === 'WATCH' ? 100 : 200} style={{ transition:'stroke-dashoffset 1.5s ease-in-out' }} />
                   </svg>
                 </div>
                 <div style={{ display:'flex', flexDirection:'column' }}>
                   <span style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', marginBottom:'0.25rem' }}>{t.dashboard.fieldHealthTitle}</span>
                   <span style={{ fontSize:'1.4rem', fontWeight:800, color: STATUS_TEXT[fieldStatus] || '#94a3b8', lineHeight:1.2 }}>
                     {t.dashboard[`fieldStatus${fieldStatus.charAt(0)+fieldStatus.slice(1).toLowerCase()}` as keyof typeof t.dashboard] ?? fieldStatus}
                   </span>
                 </div>
               </div>

               {/* Recommendation */}
               <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(160,224,80,0.3)', borderRadius:'1rem', padding:'1.25rem', display:'flex', flexDirection:'column', justifyContent:'center', boxShadow:'0 10px 25px rgba(0,0,0,0.3)' }}>
                 <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                   <span style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', color:'#a0e050', textTransform:'uppercase' }}>{t.dashboard.recommendationTitleUpper}</span>
                   {decision?.confidence && <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.1)', padding:'0.2rem 0.5rem', borderRadius:'999px' }}>{Math.round(decision.confidence * 100)}% {t.helpCenter.confidence}</span>}
                 </div>
                 {decision ? (
                   <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                     <span style={{ fontSize:'1.2rem', fontWeight:700, color:'white', lineHeight:1.3 }}>{translateRecommendation(recAction, language)}</span>
                     <div style={{ background:'rgba(0,0,0,0.3)', padding:'0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.05)' }}>
                       <span style={{ display:'block', fontSize:'0.7rem', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.4rem' }}>{t.dashboard.reason}</span>
                       <ul style={{ margin:0, padding:'0 0 0 1rem', color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', lineHeight:1.4, display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                         {decision.evidence_summary.map((ev, i) => (
                           <li key={i}>{translateEvidence(ev.code, language, ev.value)}</li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 ) : (
                   <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'1rem' }}>{t.dashboard.waitingForEsp || t.dashboard.awaitingData}</span>
                 )}
               </div>

             </div>
           </div>
        </section>

        {/* TWO COLUMN LAYOUT: LEFT (MAIN) / RIGHT (SIDEBAR) */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 2fr) minmax(0, 1fr)', gap:'2rem', alignItems:'start' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
            
            {/* LIVE SENSORS */}
            <div id="section-sensors">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)' }}>Live Field {t.dashboard.navSensors}</span>
                {sensorAge > 0 && <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{t.dashboard.updatedLabel} {formatSensorAge(sensorAge)}</span>}
              </div>

              {!isEspConnected ? (
                <div style={{ background:'var(--bg-card)', border:'1px dashed var(--border-subtle)', borderRadius:'1.25rem', padding:'3rem', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="1" x2="9" y2="4"></line>
                    <line x1="15" y1="1" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="23"></line>
                    <line x1="15" y1="20" x2="15" y2="23"></line>
                    <line x1="20" y1="9" x2="23" y2="9"></line>
                    <line x1="20" y1="14" x2="23" y2="14"></line>
                    <line x1="1" y1="9" x2="4" y2="9"></line>
                    <line x1="1" y1="14" x2="4" y2="14"></line>
                  </svg>
                  <div>
                    <h3 style={{ margin:'0 0 0.5rem 0', fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)' }}>{t.dashboard.waitingEsp32Title}</h3>
                    <p style={{ margin:0, fontSize:'0.9rem', color:'var(--text-muted)', maxWidth:'400px' }}>{t.dashboard.waitingEsp32Desc}</p>
                  </div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem' }}>
                  {(['soil_moisture','soil_temperature','soil_ph','soil_ec','air_temperature','humidity','light_lux'] as const).map(key => {
                    const val = sensorData[key];
                    const stat = sensorStatus(key, val);
                    const r = sensorRange(key);
                    const col = stat === 'below' ? '#60a5fa' : stat === 'above' ? '#f97316' : '#4ade80';
                    const isMoisture = key === 'soil_moisture';
                    const isHeat = key.includes('temperature');
                    const isLight = key === 'light_lux';
                    const isHumid = key === 'humidity';
                    const isPh    = key === 'soil_ph';
                    const isEc    = key === 'soil_ec';
                    
                    return (
                      <div key={key} onClick={() => setDetailsOpen(true)} style={{ background:'var(--bg-panel)', border:`1px solid var(--border-very-subtle)`, borderRadius:'1.25rem', padding:'1.5rem', cursor:'pointer', position:'relative', overflow:'hidden', transition:'transform 0.2s, background 0.2s', display:'flex', flexDirection:'column' }}>
                        {/* Subtle background glow based on status */}
                        <div style={{ position:'absolute', top:0, right:0, width:'100%', height:'100%', background:`radial-gradient(circle at top right, ${col}10, transparent 60%)`, pointerEvents:'none' }} />
                        
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                          <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', maxWidth:'70%' }}>{sensorLabel(key)}</span>
                          
                          {/* Icons */}
                          {isMoisture && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>}
                          {isHeat && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>}
                          {isLight && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
                          {isHumid && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path><path d="M12 22a8 8 0 0 0 8-8c0-3.5-3.5-7-8-11-4.5 4-8 7.5-8 11a8 8 0 0 0 8 8z" fill={col} fillOpacity="0.2"></path></svg>}
                          {(isPh || isEc) && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line></svg>}
                        </div>

                        <div>
                          <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
                            <span style={{ fontSize:'2rem', fontWeight:800, color: val == null ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight:1 }}>{val != null ? (isLight ? Math.round(val).toLocaleString() : isPh ? val.toFixed(1) : isEc ? val.toFixed(2) : val.toFixed(1)) : '--'}</span>
                            <span style={{ fontSize:'0.9rem', color:'var(--text-muted)', fontWeight:500 }}>{sensorUnit(key)}</span>
                          </div>
                          
                          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem' }}>
                            <span style={{ fontSize:'0.8rem', fontWeight:600, color: col }}>
                              {stat === 'below' ? t.dashboard.statusLow : stat === 'above' ? t.dashboard.statusHigh : t.dashboard.statusOptimal}
                            </span>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.2)' }} />
                            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                              {t.dashboard.expLabel}: {r.lo.toFixed(0)}–{r.hi.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LEARNING / ADAPTIVE BASELINE */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-very-subtle)', borderRadius:'1.5rem', padding:'2rem', display:'flex', flexDirection:'column' }}>
              <span style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.15em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'1.5rem' }}>{t.dashboard.learningUpper}</span>
              <p style={{ margin:'0 0 1.5rem 0', color:'var(--text-secondary)', fontSize:'1rem', lineHeight:1.5, maxWidth:'700px' }}>
                {t.dashboard.learningDescLong}
              </p>
              
              {adaptiveBaseline ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1.5rem' }}>
                  {Object.entries(adaptiveBaseline).slice(0,3).map(([key, b]) => {
                    const pct = Math.min(100, Math.max(0, Math.round(b.confidence * 100)));
                    return (
                      <div key={key} style={{ background:'var(--bg-input)', padding:'1.25rem', borderRadius:'1rem', border:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                          <span style={{ fontSize:'0.85rem', color:'var(--text-primary)', fontWeight:500 }}>{sensorLabel(key)}</span>
                          <span style={{ fontSize:'0.8rem', color:'var(--brand-primary)', fontWeight:600 }}>{pct}% {t.dashboard.confidence_label}</span>
                        </div>
                        <div style={{ background:'var(--border-very-subtle)', borderRadius:9999, height:6, marginBottom:'0.75rem', overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:9999, width:`${pct}%`, background:`linear-gradient(90deg, rgba(160,224,80,0.5), var(--brand-primary))`, transition:'width 1s ease-in-out' }} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                          <span>{b.observations_count} {t.dashboard.readingsCount}</span>
                          <span>{t.dashboard.rangeLabel}: {b.min_expected.toFixed(1)}–{b.max_expected.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background:'rgba(160,224,80,0.05)', padding:'1.5rem', borderRadius:'1rem', border:'1px dashed var(--border-brand-subtle)', color:'var(--brand-primary)' }}>
                  {t.dashboard.initialLearningActive}
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN (SIDEBAR) */}
          <div id="section-insights" style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
            
            {/* WEATHER */}
            <div style={{ background:'rgba(20,30,35,0.6)', border:'1px solid var(--border-very-subtle)', borderRadius:'1.5rem', padding:'1.75rem' }}>
              <span style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.15em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'1rem', display:'block' }}>{t.dashboard.weatherContextTitle}</span>
              
              {decision?.weather?.rain_probability != null ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>
                    <div>
                      <div style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>
                        {Math.round(decision.weather.rain_probability)}<span style={{ fontSize:'1rem', color:'var(--text-muted)', fontWeight:600 }}>%</span>
                      </div>
                      <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{t.dashboard.rainProbability}</span>
                    </div>
                  </div>
                  
                  <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.75rem', border:'1px solid var(--border-very-subtle)' }}>
                    <span style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.4rem' }}>{t.dashboard.howThisAffectsYou}</span>
                    <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                      {decision.weather.rain_probability > 60 ? t.dashboard.weatherHighRainDesc : t.dashboard.weatherLowRainDesc}
                    </p>
                  </div>
                </>
              ) : (
                <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>{t.dashboard.weatherUnavailable}</p>
              )}
            </div>

            {/* ROOT ZONE */}
            <div style={{ background:'linear-gradient(180deg, rgba(40,30,20,0.4) 0%, rgba(20,15,10,0.8) 100%)', border:'1px solid var(--border-very-subtle)', borderRadius:'1.5rem', padding:'1.75rem', position:'relative', overflow:'hidden' }}>
              <span style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.15em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'1rem', display:'block', position:'relative', zIndex:2 }}>{t.dashboard.rootZoneUpperTitle}</span>
              
              {/* Fake roots illustration */}
              <svg width="100%" height="120" style={{ position:'absolute', bottom:0, left:0, opacity:0.3, zIndex:1 }} viewBox="0 0 100 50" preserveAspectRatio="none">
                 <path d="M20,0 Q25,20 15,50 M50,0 Q55,30 65,50 M80,0 Q70,25 85,50 M35,10 Q40,30 30,50 M65,15 Q60,35 75,50" stroke="#8b5a2b" fill="none" strokeWidth="1" />
              </svg>

              <div style={{ position:'relative', zIndex:2 }}>
                {decision?.root_zone ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                      <span style={{ fontSize:'1.6rem', fontWeight:800, color: decision.root_zone.moisture_state === 'LOW' ? '#60a5fa' : decision.root_zone.moisture_state === 'HIGH' ? '#f97316' : 'var(--brand-primary)' }}>
                        {t.dashboard[`rootZone${decision.root_zone.moisture_state.charAt(0)+decision.root_zone.moisture_state.slice(1).toLowerCase()}` as keyof typeof t.dashboard] ?? decision.root_zone.moisture_state}
                      </span>
                    </div>
                    <p style={{ margin:0, fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                      {decision.root_zone.moisture_state === 'LOW' ? t.dashboard.rootZoneLowDesc :
                       decision.root_zone.moisture_state === 'HIGH' ? t.dashboard.rootZoneHighDesc :
                       t.dashboard.rootZoneNormalDesc}
                    </p>
                    <span style={{ display:'block', marginTop:'0.75rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>{t.dashboard.aiEstimated} • {Math.round(decision.root_zone.confidence * 100)}% {t.dashboard.confidence_label}</span>
                  </>
                ) : (
                  <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>{t.dashboard.waitingRootZone}</p>
                )}
              </div>
            </div>

            {/* TIMELINE */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-very-subtle)', borderRadius:'1.5rem', padding:'1.75rem' }}>
              <span style={{ fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.15em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'1.5rem', display:'block' }}>{t.dashboard.fieldEventsUpper}</span>
              
              {events.length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', textAlign:'center', padding:'1rem 0' }}>{t.dashboard.noUnusualEvents}</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', position:'relative' }}>
                  {/* Timeline line */}
                  <div style={{ position:'absolute', top:'10px', bottom:'10px', left:'6px', width:'2px', background:'var(--border-subtle)' }} />
                  
                  {events.slice(0, 4).map((ev) => {
                    const statusColor: Record<string,string> = { NEW:'#fb923c', ONGOING:'#facc15', PERSISTENT:'#f87171', RESOLVED:'#4ade80' };
                    const sc = statusColor[ev.status] ?? '#94a3b8';
                    return (
                      <div key={ev.id} style={{ display:'flex', gap:'1rem', position:'relative', zIndex:1 }}>
                        <div style={{ width:'14px', height:'14px', borderRadius:'50%', background:'var(--bg-base)', border:`2px solid ${sc}`, marginTop:'2px', flexShrink:0 }} />
                        <div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                            <span style={{ fontSize:'0.85rem', fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{sensorLabel(ev.sensor)}</span>
                            <span style={{ fontSize:'0.7rem', color:sc, fontWeight:600, padding:'0.1rem 0.4rem', borderRadius:'4px', background:`${sc}15` }}>{ev.status}</span>
                          </div>
                          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'block' }}>{ev.duration_minutes} {t.dashboard.durationMins} • {t.dashboard.severityLabel}: {ev.severity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DETAILS MODAL (Hidden by default, triggered by sensor clicks) */}
            {detailsOpen && (
              <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
                <div style={{ background:'#0c1a10', border:'1px solid var(--border-brand-subtle)', borderRadius:'1.5rem', padding:'2rem', width:'100%', maxWidth:'500px', boxShadow:'0 25px 50px var(--bg-glass-heavy)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                    <h3 style={{ margin:0, fontSize:'1.25rem', color:'var(--text-primary)' }}>{t.dashboard.sensorDetailsTitle}</h3>
                    <button onClick={() => setDetailsOpen(false)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.5rem' }}>×</button>
                  </div>
                  <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight:1.5 }}>
                    {t.dashboard.sensorDetailsDesc}
                  </p>
                  <button onClick={() => setDetailsOpen(false)} style={{ background:'var(--border-brand-subtle)', color:'var(--brand-primary)', border:'1px solid var(--border-brand-subtle)', borderRadius:'0.75rem', padding:'0.75rem 1.5rem', width:'100%', marginTop:'1.5rem', fontWeight:600, cursor:'pointer' }}>{t.chat.close}</button>
                </div>
              </div>
            )}

          </div>
        </div>

        <div style={{ height:'5rem' }} />
      </main>

      {/* ══════════════════════════════ CHATBOT ══════════════════════════ */}
      <MarudamChat language={language} fieldContext={fieldContext} />
    </div>
  );
}
