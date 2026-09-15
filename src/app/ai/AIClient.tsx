'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/layout/AppShell';
import { type Language, getTranslations } from '@/lib/i18n/translations';
import { getCropName, estimateGrowthStageId, getCropStageName } from '@/lib/data/db';

export default function AIClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [farmContext, setFarmContext] = useState<any>(null);
  const [decision, setDecision] = useState<any | null>(null);
  const [baseline, setBaseline] = useState<any | null>(null);
  
  const t = useMemo(() => getTranslations(language), [language]);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const loadProfileAndAI = useCallback(async () => {
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
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfileAndAI();
  }, [loadProfileAndAI]);

  useEffect(() => {
    if (!deviceId) return;
    let alive = true;
    const fetchAI = async () => {
      try {
        const [dr, br] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/decision/${deviceId}`),
          fetch(`${BACKEND_URL}/api/baseline/${deviceId}`),
        ]);
        if (alive && dr.status === 'fulfilled' && dr.value.ok) setDecision(await dr.value.json());
        if (alive && br.status === 'fulfilled' && br.value.ok) setBaseline(await br.value.json());
      } catch {
        // Fallback or local dev
      }
    };
    fetchAI();
    const id = setInterval(fetchAI, 10000); // refresh every 10s
    return () => { alive = false; clearInterval(id); };
  }, [deviceId, BACKEND_URL]);

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
  const baselineColors: Record<string,string> = { LEARNING:'#3b82f6', ACTIVE:'#10b981', LOW_CONFIDENCE:'#f59e0b', REBUILDING:'#ef4444' };

  return (
    <AppShell 
      activeRoute="/ai" 
      language={language} 
      onLanguageChange={handleLanguageChange} 
      onLogout={handleLogout}
      pageTitle="AI Insights"
      farmContext={farmContext}
    >
      <div className="mrd-content" style={{ maxWidth:'1200px', margin:'0 auto', width:'100%' }}>
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 0.5rem 0', color:'var(--text-primary)' }}>AI Insights</h1>
          <p style={{ color:'var(--text-muted)', margin:0 }}>Adaptive baseline and field health.</p>
        </div>

        <div className="mrd-two-col-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start' }}>
          
          {/* DECISION MODEL */}
          <section style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand-primary)', marginBottom:'1.5rem' }}>Decision Engine</div>
            {decision ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                <div>
                  <span style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Field Status</span>
                  <span style={{ fontSize:'1.25rem', fontWeight:800, color: decision.risk_level === 'NORMAL' ? '#10b981' : '#ef4444' }}>
                    {decision.field_status}
                  </span>
                </div>
                <div>
                  <span style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Recommendation</span>
                  <span style={{ fontSize:'1rem', fontWeight:600, color:'var(--text-primary)' }}>{decision.recommendation_action || 'No action needed.'}</span>
                </div>
                {decision.evidence_summary && (
                  <div>
                    <span style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>Evidence</span>
                    <ul style={{ margin:0, padding:'0 0 0 1.2rem', color:'var(--text-secondary)', fontSize:'0.9rem' }}>
                      {decision.evidence_summary.map((e: any, i: number) => (
                        <li key={i} style={{ marginBottom:'0.25rem' }}>{e.code}: {e.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color:'var(--text-muted)' }}>Waiting for decision data...</p>
            )}
          </section>

          {/* ADAPTIVE BASELINE */}
          <section style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand-primary)', marginBottom:'1.5rem' }}>Adaptive Baseline</div>
            {baseline ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                <div>
                  <span style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Status</span>
                  <span style={{ display:'inline-block', fontSize:'0.8rem', fontWeight:700, padding:'0.25rem 0.5rem', borderRadius:'4px', color:'white', background: baselineColors[baseline.status] ?? '#6b7280' }}>
                    {baseline.status}
                  </span>
                </div>
                <div>
                  <span style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Active Factors</span>
                  <span style={{ fontSize:'0.9rem', color:'var(--text-primary)', lineHeight:1.5 }}>
                    {baseline.explanation?.active_factors?.join(', ') || 'None'}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                    <span style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)' }}>Confidence</span>
                    <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)' }}>{Number(baseline.confidence).toFixed(2)}</span>
                  </div>
                  <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                    <span style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)' }}>Quality Score</span>
                    <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)' }}>{Number(baseline.sensor_quality ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color:'var(--text-muted)' }}>Waiting for baseline data...</p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
