'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MarudamHeader from '@/components/layout/MarudamHeader';
import { type Language, getTranslations } from '@/lib/i18n/translations';
import { getCropName } from '@/lib/data/db';

export default function SettingsClient({ hasAi }: { hasAi: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'success'|'error'>('idle');
  const [language, setLanguage] = useState<Language>('English');
  const [farmerName, setFarmerName] = useState('');
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  
  const [farmData, setFarmData] = useState<{
    state: string; district: string; crop_id: string; sowing_date: string; device_id: string;
  } | null>(null);
  const [sensorAge, setSensorAge] = useState<number | null>(null);

  const t = useMemo(() => getTranslations(language), [language]);

  const checkSensorAge = useCallback(async (deviceId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/sensors/latest/${deviceId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.timestamp) {
        const diff = Math.floor((Date.now() - new Date(data.timestamp).getTime()) / 1000);
        setSensorAge(diff);
      }
    } catch {
      // API unreachable or device offline
    }
  }, []);

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
      checkSensorAge(farm.device_id ?? 'FIELD_001');
    }
    setLoading(false);
  }, [router, checkSensorAge]);

  useEffect(() => {
    const init = async () => {
      await loadProfile();
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('marudam-theme');
        if (storedTheme === 'light' || document.documentElement.getAttribute('data-theme') === 'light') {
          setTheme('light');
        }
      }
    };
    init();
  }, [loadProfile]);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ language: newLang }).eq('user_id', user.id);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveStatus('idle');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update({ name: farmerName }).eq('user_id', user.id);
      if (error) setSaveStatus('error');
      else setSaveStatus('success');
    }
    setSaving(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div style={{minHeight:'100svh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}>Loading...</div>;
  }

  const isEspConnected = sensorAge !== null && sensorAge < 600;

  return (
    <div style={{ minHeight:'100svh', background:'var(--bg-base)', color:'var(--text-primary)', display:'flex', flexDirection:'column', fontFamily:'system-ui, -apple-system, sans-serif' }}>
      <MarudamHeader activeRoute="settings" language={language} onLanguageChange={handleLanguageChange} onLogout={handleLogout} />

      <main style={{ flex:1, padding:'clamp(1.5rem, 5vw, 3rem)', maxWidth:'800px', margin:'0 auto', width:'100%', display:'flex', flexDirection:'column', gap:'2rem' }}>
        
        <h1 style={{ fontSize:'2rem', fontWeight:800, margin:0, color:'var(--text-primary)' }}>{t.settings.title}</h1>

        {/* APPEARANCE */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>Appearance</h2>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', background:'var(--bg-input)', borderRadius:'0.5rem' }}>
            <span style={{ color:'var(--text-secondary)' }}>Light Theme</span>
            <label style={{ position:'relative', display:'inline-block', width:'44px', height:'24px' }}>
              <input 
                type="checkbox" 
                style={{ opacity:0, width:0, height:0 }} 
                checked={theme === 'light'}
                onChange={(e) => {
                  const newTheme = e.target.checked ? 'light' : 'dark';
                  setTheme(newTheme);
                  if (newTheme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('marudam-theme', 'light');
                  } else {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('marudam-theme', 'dark');
                  }
                }}
              />
              <span style={{
                position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, 
                backgroundColor: theme === 'light' ? 'var(--brand-primary)' : 'var(--bg-glass-heavy)', 
                transition:'.3s', borderRadius:'24px'
              }}>
                <span style={{
                  position:'absolute', content:'""', height:'16px', width:'16px', left:'4px', bottom:'4px', 
                  backgroundColor:'white', transition:'.3s', borderRadius:'50%',
                  transform: theme === 'light' ? 'translateX(20px)' : 'translateX(0)'
                }}/>
              </span>
            </label>
          </div>
        </section>

        {/* PROFILE */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.profile}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>{t.settings.farmerName}</label>
              <input 
                type="text" value={farmerName} onChange={e => setFarmerName(e.target.value)}
                style={{ width:'100%', background:'var(--bg-input)', border:'1px solid var(--border-subtle)', padding:'0.75rem', borderRadius:'0.5rem', color:'var(--text-primary)', fontSize:'1rem' }} 
              />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <button onClick={handleSaveProfile} disabled={saving} style={{ background:'var(--brand-primary)', color:'var(--bg-base)', border:'none', padding:'0.6rem 1.25rem', borderRadius:'0.5rem', fontWeight:600, cursor:'pointer' }}>
                {saving ? t.settings.saving : t.settings.save}
              </button>
              {saveStatus === 'success' && <span style={{ color:'#4ade80', fontSize:'0.9rem' }}>{t.settings.savedSuccessfully}</span>}
              {saveStatus === 'error' && <span style={{ color:'#f87171', fontSize:'0.9rem' }}>{t.settings.saveFailed}</span>}
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS (Local browser prefs for now as schema does not support it) */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.notifications}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width:18, height:18, accentColor:'var(--brand-primary)' }} />
              <span style={{ fontSize:'0.95rem' }}>{t.settings.fieldEvents}</span>
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width:18, height:18, accentColor:'var(--brand-primary)' }} />
              <span style={{ fontSize:'0.95rem' }}>{t.settings.recommendations}</span>
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width:18, height:18, accentColor:'var(--brand-primary)' }} />
              <span style={{ fontSize:'0.95rem' }}>{t.settings.deviceAlerts}</span>
            </label>
            <p style={{ margin:0, fontSize:'0.8rem', color:'var(--text-muted)' }}>(These are local browser preferences)</p>
          </div>
        </section>

        {/* CROP & FIELD */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.cropAndField}</h2>
          {farmData ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)' }}>Crop</span>
                <span style={{ fontWeight:500 }}>{getCropName(farmData.crop_id, language)}</span>
              </div>
              <div>
                <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)' }}>{t.settings.sowingDate}</span>
                <span style={{ fontWeight:500 }}>{farmData.sowing_date || t.settings.notAvailable}</span>
              </div>
              <div>
                <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)' }}>State</span>
                <span style={{ fontWeight:500 }}>{farmData.state || t.settings.notAvailable}</span>
              </div>
              <div>
                <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)' }}>District</span>
                <span style={{ fontWeight:500 }}>{farmData.district || t.settings.notAvailable}</span>
              </div>
            </div>
          ) : (
            <span style={{ color:'var(--text-muted)' }}>{t.settings.notAvailable}</span>
          )}
        </section>

        {/* ADAPTIVE BASELINE */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.adaptiveBaseline}</h2>
          <p style={{ margin:'0 0 1rem 0', fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
            {t.settings.baselineExplanation}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{t.settings.learningStatus}</span>
              <span style={{ fontWeight:600, color:'#4ade80' }}>Active</span>
            </div>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <span style={{ display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{t.settings.reviewSchedule}</span>
              <span style={{ fontWeight:600 }}>Every 7 Days</span>
            </div>
          </div>
        </section>

        {/* DEVICE / ESP32 */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.device}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'var(--bg-input)', borderRadius:'0.5rem' }}>
              <span style={{ color:'var(--text-primary)' }}>{t.settings.esp32Status}</span>
              <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:600, color: isEspConnected ? '#4ade80' : '#f87171' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: isEspConnected ? '#4ade80' : '#f87171', boxShadow: isEspConnected ? '0 0 8px #4ade80' : 'none' }} />
                {isEspConnected ? 'Online' : t.settings.waitingForEsp}
              </span>
            </div>
          </div>
        </section>

        {/* AI ASSISTANT */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.aiAssistant}</h2>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'var(--bg-input)', borderRadius:'0.5rem' }}>
            <span style={{ color:'var(--text-primary)' }}>{t.settings.configStatus}</span>
            {hasAi ? (
              <span style={{ color:'#4ade80', fontWeight:600 }}>Ready</span>
            ) : (
              <span style={{ color:'#f87171', fontWeight:600 }}>{t.settings.aiNotConfigured}</span>
            )}
          </div>
        </section>

        {/* ABOUT MARUDAM */}
        <section style={{ background:'var(--bg-panel)', border:'1px solid var(--border-very-subtle)', borderRadius:'1rem', padding:'1.5rem', marginBottom:'4rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--brand-primary)', margin:'0 0 1rem 0' }}>{t.settings.aboutMarudam}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <span style={{ color:'var(--text-primary)' }}><strong>Marudam</strong></span>
            <span style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>{t.settings.version}: 1.0.0</span>
            <span style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginTop:'0.5rem' }}>A premium, farmer-first agricultural intelligence platform powered by adaptive AI and live field sensors.</span>
          </div>
        </section>

      </main>
    </div>
  );
}
