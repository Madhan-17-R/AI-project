'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/layout/AppShell';
import { type Language, getTranslations } from '@/lib/i18n/translations';
import { getCropName, estimateGrowthStageId, getCropStageName, getSeasonName, estimateSeasonId } from '@/lib/data/db';

interface FarmData {
  state: string;
  district: string;
  crop_id: string;
  sowing_date: string;
  device_id: string;
}

export default function FarmClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [farmerName, setFarmerName] = useState('');

  const t = useMemo(() => getTranslations(language), [language]);

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('name, language').eq('user_id', user.id).single();
    if (profile) {
      setFarmerName(profile.name ?? '');
      setLanguage((profile.language as Language) ?? 'English');
    }

    const { data: farm } = await supabase.from('farms')
      .select('state, district, crop_id, sowing_date, device_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single();
    
    if (farm) {
      setFarmData(farm);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ language: newLang }).eq('user_id', user.id);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!farmData) {
    return <div style={{minHeight:'100svh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}>Loading...</div>;
  }

  const cropId = farmData?.crop_id ?? 'tomato';
  const sowingDate = farmData?.sowing_date ?? '';
  const stageId = estimateGrowthStageId(cropId, sowingDate);
  const seasonId = estimateSeasonId(sowingDate);

  const farmContext = farmData ? {
    cropName: getCropName(cropId, language),
    district: farmData.district,
    state: farmData.state,
    deviceId: farmData.device_id,
    growthStage: getCropStageName(cropId, stageId, language)
  } : undefined;

  return (
    <AppShell 
      activeRoute="/farm" 
      language={language} 
      onLanguageChange={handleLanguageChange} 
      onLogout={handleLogout}
      pageTitle="Farm Profile"
      farmContext={farmContext}
    >
      <div className="mrd-content" style={{ maxWidth:'900px', margin:'0 auto', width:'100%', gap:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 0.5rem 0', color:'var(--text-primary)' }}>Farm Profile</h1>
          <p style={{ color:'var(--text-muted)', margin:0 }}>Manage your agricultural details.</p>
        </div>

        {farmData ? (
          <>
            <section style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand-primary)', marginBottom:'1.5rem' }}>Location Details</div>
              <div className="mrd-two-col-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>State</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{farmData.state}</span>
                </div>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>District</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{farmData.district}</span>
                </div>
              </div>
            </section>

            <section style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand-primary)', marginBottom:'1.5rem' }}>Crop Details</div>
              <div className="mrd-two-col-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Crop Type</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{getCropName(cropId, language)}</span>
                </div>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Sowing Date</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{farmData.sowing_date || 'Not specified'}</span>
                </div>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Growth Stage</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{getCropStageName(cropId, stageId, language)}</span>
                </div>
                <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Season</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{getSeasonName(seasonId, language)}</span>
                </div>
              </div>
            </section>

            <section style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--brand-primary)', marginBottom:'1.5rem' }}>Device Details</div>
              <div style={{ background:'var(--bg-panel)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Assigned Device ID</span>
                <span style={{ fontWeight:600, color:'var(--text-primary)', fontFamily:'monospace' }}>{farmData.device_id}</span>
              </div>
            </section>
          </>
        ) : (
          <div style={{ padding:'3rem', textAlign:'center', background:'var(--bg-panel)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-subtle)' }}>
            <p style={{ color:'var(--text-muted)' }}>No farm data found. Please set it up.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
