'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/layout/AppShell';
import { type Language, getTranslations } from '@/lib/i18n/translations';
import { fetchRecentAnomalies, subscribeToAnomalies } from '@/lib/supabase/sensors';
import type { Anomaly } from '@/lib/supabase/sensors';
import { getCropName, estimateGrowthStageId, getCropStageName } from '@/lib/data/db';

export default function AlertsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [farmContext, setFarmContext] = useState<any>(null);
  
  const t = useMemo(() => getTranslations(language), [language]);

  const loadProfileAndAlerts = useCallback(async () => {
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

      const recentAnomalies = await fetchRecentAnomalies(devId, 50);
      setAnomalies(recentAnomalies);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfileAndAlerts();
  }, [loadProfileAndAlerts]);

  useEffect(() => {
    if (!deviceId) return;
    const unsub = subscribeToAnomalies(deviceId, (newAnomaly) => {
      setAnomalies(prev => [newAnomaly, ...prev].slice(0, 50));
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
  const SEV_COLOR: Record<string,string> = { CRITICAL:'#dc2626', HIGH:'#ea580c', MEDIUM:'#d97706', LOW:'#ca8a04', NORMAL:'#16a34a' };
  const SEV_BG: Record<string,string> = { CRITICAL:'#fee2e2', HIGH:'#ffedd5', MEDIUM:'#fef3c7', LOW:'#fefce8', NORMAL:'#dcfce7' };

  return (
    <AppShell 
      activeRoute="/alerts" 
      language={language} 
      onLanguageChange={handleLanguageChange} 
      onLogout={handleLogout}
      pageTitle="Alerts"
      farmContext={farmContext}
    >
      <div className="mrd-content" style={{ maxWidth:'900px', margin:'0 auto', width:'100%' }}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 0.5rem 0', color:'var(--text-primary)' }}>System Alerts</h1>
          <p style={{ color:'var(--text-muted)', margin:0 }}>Recent field anomalies from {deviceId}</p>
        </div>

        {anomalies.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {anomalies.map((a, i) => {
              const r = a.risk_level ?? 'WATCH';
              return (
                <div key={a.id || i} style={{ display:'flex', flexDirection:'column', gap:'0.75rem', padding:'1.5rem', background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-subtle)', borderLeft:`4px solid ${SEV_COLOR[r] || '#d97706'}`, boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:700, color:SEV_COLOR[r] || '#d97706', background:SEV_BG[r] || '#fef3c7', padding:'0.2rem 0.5rem', borderRadius:'4px' }}>
                        {r}
                      </span>
                      <span style={{ fontSize:'1rem', fontWeight:600, color:'var(--text-primary)' }}>
                        {a.sensor || 'Anomaly Detected'}
                      </span>
                    </div>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:'2rem', fontSize:'0.9rem', color:'var(--text-secondary)' }}>
                    {a.observed_value != null && <span>Reading: <strong>{Number(a.observed_value).toFixed(2)}</strong></span>}
                    {a.expected_value != null && <span>Expected: {Number(a.expected_value).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:'3rem', textAlign:'center', background:'var(--bg-panel)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-subtle)' }}>
            <p style={{ color:'var(--text-muted)' }}>No recent anomalies detected.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
