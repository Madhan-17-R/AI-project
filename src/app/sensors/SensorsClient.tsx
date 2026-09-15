'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/layout/AppShell';
import { type Language, getTranslations } from '@/lib/i18n/translations';
import { fetchLatestReading, subscribeToReadings } from '@/lib/supabase/sensors';
import type { SensorReading } from '@/lib/supabase/sensors';
import { getCropName, estimateGrowthStageId, getCropStageName } from '@/lib/data/db';

export default function SensorsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [farmContext, setFarmContext] = useState<any>(null);
  
  const t = useMemo(() => getTranslations(language), [language]);

  const loadProfileAndSensors = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('language').eq('user_id', user.id).single();
    if (profile) setLanguage((profile.language as Language) ?? 'English');

    const { data: farm } = await supabase.from('farms')
      .select('state, district, crop_id, sowing_date, device_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single();
    
    if (farm) {
      const devId = farm.device_id ?? 'MARUDAM-01';
      setDeviceId(devId);
      setFarmContext({
        cropName: getCropName(farm.crop_id, (profile?.language as Language) ?? 'English'),
        district: farm.district,
        state: farm.state,
        deviceId: devId,
        growthStage: getCropStageName(farm.crop_id, estimateGrowthStageId(farm.crop_id, farm.sowing_date), (profile?.language as Language) ?? 'English')
      });

      const initialReading = await fetchLatestReading(devId);
      if (initialReading) setReading(initialReading);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfileAndSensors();
  }, [loadProfileAndSensors]);

  useEffect(() => {
    if (!deviceId) return;
    const unsub = subscribeToReadings(deviceId, (newReading) => {
      setReading((prev: SensorReading | null) => (!prev || newReading.timestamp > prev.timestamp) ? newReading : prev);
    });
    return () => unsub();
  }, [deviceId]);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').update({ language: newLang }).eq('user_id', user.id);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{minHeight:'100svh', background:'var(--bg-base)'}} />;

  const sensors = reading ? [
    { key: 'soil_moisture', label: t.dashboard.sensorSoilMoisture, val: reading.soil_moisture, unit: '%' },
    { key: 'soil_temperature', label: t.dashboard.sensorSoilTemperature, val: reading.soil_temperature, unit: '°C' },
    { key: 'soil_ph', label: 'Soil pH', val: reading.soil_ph, unit: 'pH' },
    { key: 'soil_ec', label: 'Soil EC', val: reading.soil_ec, unit: 'mS/cm' },
    { key: 'air_temperature', label: t.dashboard.sensorSurroundingTemp, val: reading.air_temperature, unit: '°C' },
    { key: 'humidity', label: t.dashboard.sensorAirHumidity, val: reading.humidity, unit: '%' },
    { key: 'light_lux', label: t.dashboard.sensorLight, val: reading.light_lux, unit: 'lux' },
  ] : [];

  return (
    <AppShell 
      activeRoute="/sensors" 
      language={language} 
      onLanguageChange={handleLanguageChange} 
      onLogout={handleLogout}
      pageTitle="Sensors"
      farmContext={farmContext}
    >
      <div className="mrd-content" style={{ maxWidth:'1200px', margin:'0 auto', width:'100%' }}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 0.5rem 0', color:'var(--text-primary)' }}>Live Sensors</h1>
          <p style={{ color:'var(--text-muted)', margin:0 }}>Real-time telemetry from {deviceId}</p>
        </div>

        {reading ? (
          <div className="mrd-sensor-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1rem' }}>
            {sensors.map(s => (
              <div key={s.key} className="mrd-sensor-card" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</span>
                <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
                  <span style={{ fontSize:'2rem', fontWeight:800, color:'var(--text-primary)' }}>
                    {s.val != null ? Number(s.val).toFixed(s.key === 'soil_ph' || s.key === 'soil_ec' ? 2 : 1) : '--'}
                  </span>
                  <span style={{ fontSize:'0.9rem', color:'var(--text-faint)', fontWeight:600 }}>{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:'3rem', textAlign:'center', background:'var(--bg-panel)', borderRadius:'var(--radius-lg)' }}>
            <p style={{ color:'var(--text-muted)' }}>Waiting for sensor data...</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
