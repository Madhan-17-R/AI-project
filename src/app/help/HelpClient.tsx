'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MarudamHeader from '@/components/layout/MarudamHeader';
import { type Language, getTranslations } from '@/lib/i18n/translations';

export default function HelpClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('English');

  const t = useMemo(() => getTranslations(language), [language]);

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('language').eq('user_id', user.id).single();
    if (profile) {
      setLanguage((profile.language as Language) ?? 'English');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const init = async () => {
      await loadProfile();
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div style={{minHeight:'100svh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}>{t.common.loading}</div>;
  }

  // Common styles for the Help Center
  const sectionStyle = {
    background:'var(--bg-panel)', 
    border:'1px solid var(--border-very-subtle)', 
    borderRadius:'1rem', 
    padding:'2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  };

  const titleStyle = {
    fontSize:'1.3rem', 
    fontWeight:700, 
    color:'var(--brand-primary)', 
    margin: 0,
    borderBottom: '1px solid var(--border-brand-subtle)',
    paddingBottom: '1rem'
  };

  const subheadingStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0'
  };

  const pStyle = {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6
  };

  return (
    <div style={{ minHeight:'100svh', background:'var(--bg-base)', color:'var(--text-primary)', display:'flex', flexDirection:'column', fontFamily:'system-ui, -apple-system, sans-serif' }}>
      <MarudamHeader activeRoute="help" language={language} onLanguageChange={handleLanguageChange} onLogout={handleLogout} />

      <main style={{ flex:1, padding:'clamp(1.5rem, 5vw, 3rem)', maxWidth:'900px', margin:'0 auto', width:'100%', display:'flex', flexDirection:'column', gap:'2.5rem' }}>
        
        <div>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, margin:'0 0 0.5rem 0', color:'var(--text-primary)' }}>{t.helpCenter.title}</h1>
          <p style={{ color:'var(--text-muted)', margin:0 }}>Your comprehensive guide to using the Marudam system.</p>
        </div>

        {/* GETTING STARTED */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{t.helpCenter.gettingStarted}</h2>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.howItWorks}</h3>
            <p style={pStyle}>
              Marudam continuously collects data from your field using sensors. It combines this with your specific crop profile and local weather conditions to provide highly accurate insights.
            </p>
          </div>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.readFieldHealth}</h3>
            <p style={pStyle}>
              The main Field Health indicator gives you a quick glance at your farm. 
              <strong> {t.helpCenter.healthy}</strong> means everything is optimal. 
              <strong> {t.helpCenter.watch}</strong> means you should keep an eye on changing conditions. 
              <strong> {t.helpCenter.attention}</strong> means action is required soon.
            </p>
          </div>
        </section>

        {/* SENSORS */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{t.helpCenter.sensors}</h2>
          <p style={pStyle}>{t.helpCenter.howSensorsWork}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <h4 style={{ margin:'0 0 0.25rem 0', color:'#4ade80' }}>{t.helpCenter.soilMoisture}</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)' }}>Measures the volumetric water content in the soil.</p>
            </div>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <h4 style={{ margin:'0 0 0.25rem 0', color:'#4ade80' }}>{t.helpCenter.soilTemp}</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)' }}>Monitors root zone temperature for crop health.</p>
            </div>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <h4 style={{ margin:'0 0 0.25rem 0', color:'#4ade80' }}>{t.helpCenter.lightIntensity}</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)' }}>Measures sunlight available for photosynthesis.</p>
            </div>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <h4 style={{ margin:'0 0 0.25rem 0', color:'#4ade80' }}>{t.helpCenter.airHumidity}</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)' }}>Tracks moisture in the air to predict disease risk.</p>
            </div>
            <div style={{ background:'var(--bg-input)', padding:'1rem', borderRadius:'0.5rem' }}>
              <h4 style={{ margin:'0 0 0.25rem 0', color:'#4ade80' }}>{t.helpCenter.surroundingTemp}</h4>
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--text-secondary)' }}>Ambient temperature affecting crop growth and evaporation.</p>
            </div>
          </div>
        </section>

        {/* RECOMMENDATIONS */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{t.helpCenter.recommendations}</h2>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.whatRecommendationsMean}</h3>
            <p style={pStyle}>
              Marudam provides actionable advice based on all available data. For example, it might advise delaying irrigation if rain is highly probable, saving you water and effort.
            </p>
          </div>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.confidence} & {t.helpCenter.urgency}</h3>
            <p style={pStyle}>
              Each recommendation shows a confidence level (e.g. 95%), which represents how sure the AI is about the advice based on historical and sensor data. The urgency dictates if action is needed today or later.
            </p>
          </div>
        </section>

        {/* ADAPTIVE BASELINE */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{t.helpCenter.adaptiveBaseline}</h2>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.whatMarudamLearns}</h3>
            <p style={pStyle}>
              Every farm is unique. Marudam learns what is &quot;normal&quot; for your specific soil type and microclimate, rather than using generic textbook values.
            </p>
          </div>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.whyBaselineChanges}</h3>
            <p style={pStyle}>
              The baseline adapts as the season progresses. What is considered normal soil moisture in early growth stages may differ from the harvesting stage. {t.helpCenter.whyWeatherAffects}
            </p>
          </div>
        </section>

        {/* ESP32 */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{t.helpCenter.esp32}</h2>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.howToConnect}</h3>
            <p style={pStyle}>
              Power on the ESP32 device in your field. It will automatically connect to Marudam servers using the pre-configured credentials and begin transmitting the 5 sensor readings.
            </p>
          </div>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.deviceOffline}</h3>
            <p style={pStyle}>
              If the dashboard displays &quot;Waiting for ESP32&quot;, the device is currently not sending data. Marudam will not show fabricated or old data; it waits for a live connection to ensure safety.
            </p>
          </div>
        </section>

        {/* ASK MARUDAM */}
        <section style={{ ...sectionStyle, marginBottom: '4rem' }}>
          <h2 style={titleStyle}>{t.helpCenter.askMarudam}</h2>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.howToAsk}</h3>
            <p style={pStyle}>
              Click the floating button on the bottom right of the dashboard to open the AI Chatbot. You can ask anything about your field&apos;s current state, or for general agricultural advice.
            </p>
          </div>
          <div>
            <h3 style={subheadingStyle}>{t.helpCenter.supportedLanguages}</h3>
            <p style={pStyle}>
              You can ask questions in English, Hindi, Tamil, Telugu, or Kannada. Marudam will reply in the language you selected.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
