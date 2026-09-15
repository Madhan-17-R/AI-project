'use client';
import { getTranslations } from "@/lib/i18n/translations";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─────────────────────────────────────────────────────────────────────────
   FARMLANDING
   Architecture:
     1. Matte painting background image (parallax −0.3×)
     2. Cinematic vignette overlay
     3. Bottom gradient (text readability)
     4. Sun / light-ray radial overlay (parallax −0.15×, animated)
     5. Two cloud drift overlays (very slow, very translucent)
     6. Water / rice-field shimmer overlay
     7. Horizon mist band
     8. Foreground depth gradient (parallax +0.4×)
     9. Atmospheric particles (10 dots)
    10. Navigation
    11. Hero content (lower-left, integrated into dark landscape area)
    12. Login transition overlay
───────────────────────────────────────────────────────────────────────── */
export default function FarmLanding() {
  const [language, setLanguage] = useState<'English'|'Hindi'|'Bengali'|'Telugu'|'Marathi'|'Tamil'|'Gujarati'|'Urdu'|'Kannada'|'Odia'|'Malayalam'|'Punjabi'|'Assamese'|'Maithili'|'Sanskrit'|'Konkani'|'Manipuri'|'Kashmiri'|'Nepali'|'Sindhi'|'Dogri'|'Santali'>('English');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('marudam-lang');
      if (stored) setLanguage(stored as any);
    }
  }, []);

  useEffect(() => {
    const rtlLangs = ['Urdu', 'Kashmiri', 'Sindhi'];
    document.documentElement.dir = rtlLangs.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const t = getTranslations(language);
  const bgRef    = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const fgRef    = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number | null>(null);

  /* Current lerped parallax values */
  const cpx = useRef(0);
  const cpy = useRef(0);
  /* Target parallax (−0.5 … +0.5 relative to viewport center) */
  const tpx = useRef(0);
  const tpy = useRef(0);

  const isRM = useRef(false);

  const [scrolled,      setScrolled]      = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [overlayOn,     setOverlayOn]     = useState(false);

  const router = useRouter();

  /* Check prefers-reduced-motion once */
  useEffect(() => {
    isRM.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /* RAF loop — direct DOM mutation, zero React re-renders per frame */
  useEffect(() => {
    const animate = () => {
      if (!isRM.current) {
        cpx.current += (tpx.current - cpx.current) * 0.030;
        cpy.current += (tpy.current - cpy.current) * 0.030;

        /* Background: subtle opposite-direction shift for depth illusion */
        bgRef.current?.style.setProperty(
          'transform',
          `translate(${(cpx.current * -20).toFixed(2)}px, ${(cpy.current * -9).toFixed(2)}px)`
        );
        /* Light ray: very gentle opposing drift */
        lightRef.current?.style.setProperty(
          'transform',
          `translate(${(cpx.current * -7).toFixed(2)}px, ${(cpy.current * -3).toFixed(2)}px)`
        );
        /* Foreground gradient: moves the same direction as the mouse
           (simulates a close plane tracked by the camera) */
        fgRef.current?.style.setProperty(
          'transform',
          `translate(${(cpx.current * 12).toFixed(2)}px, ${(cpy.current * 5).toFixed(2)}px)`
        );
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      tpx.current = e.clientX / window.innerWidth  - 0.5;
      tpy.current = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => setScrolled(window.scrollY > 10);

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll',    onScroll,    { passive: true });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll',    onScroll);
    };
  }, []);

  /* Cinematic login & register transitions */
  const handleLogin = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => setOverlayOn(true), 60);
    setTimeout(() => router.push('/login'), 980);
  }, [transitioning, router]);

  const handleRegister = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => setOverlayOn(true), 60);
    setTimeout(() => router.push('/register'), 980);
  }, [transitioning, router]);

  /* ── Inline hover helpers ─────────────────────────────────────────── */
  const ghostBtnEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background  = 'rgba(255,255,255,0.15)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.52)';
  };
  const ghostBtnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background  = 'rgba(255,255,255,0.07)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
  };

  /* ── Particle data (generated once, no state needed) ──────────────── */
  const particles = Array.from({ length: 10 }, (_, i) => ({
    left:   `${12 + (i * 8.4) % 74}%`,
    top:    `${22 + (i * 6.9) % 52}%`,
    size:   1 + (i % 2),
    color:  i % 2 === 0 ? 'rgba(255,248,200,0.55)' : 'rgba(210,230,255,0.38)',
    dur:    `${5.5 + (i * 1.05) % 5.8}s`,
    delay:  `${((i * 0.85) % 6).toFixed(1)}s`,
  }));

  return (
    <div
      role="main"
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: '#081008', /* dark fallback while image loads */
      }}
    >

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 1 — MATTE PAINTING BACKGROUND
          Extra inset so parallax movement never exposes edges.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-4% -3%',
          backgroundImage: "url('/farm_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
          willChange: 'transform',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 2 — CINEMATIC VIGNETTE
          Darkens the four edges without hiding the centre.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              ellipse 115% 105% at 50% 50%,
              transparent 32%,
              rgba(0,0,0,0.50) 100%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 3 — BOTTOM GRADIENT (text readability)
          Fades the lower landscape to near-black so hero text
          reads clearly without needing a large opaque box.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '68%',
          background:
            'linear-gradient(to top, rgba(2,9,2,0.85) 0%, rgba(4,12,3,0.58) 32%, rgba(4,12,3,0.20) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 4 — CREPUSCULAR LIGHT RAY OVERLAY
          Enhances the warm golden break in the painted clouds.
          Parallaxes gently and pulses on an 8 s cycle.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        ref={lightRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-12%', right: '-6%',
          width: '72%', height: '88%',
          background: `
            radial-gradient(
              ellipse at 75% 18%,
              rgba(255,210,95,0.13)  0%,
              rgba(255,185,50,0.06) 38%,
              transparent           68%
            )
          `,
          animation: 'ray-pulse 8s ease-in-out infinite',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 5 — CLOUD DRIFT OVERLAYS
          Two very translucent gradient "blobs" oscillate slowly
          over the sky region, giving perceived cloud movement
          without obscuring the painted detail beneath.
      ═════════════════════════════════════════════════════════════════ */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="cloud-overlay cloud-overlay-a" />
        <div className="cloud-overlay cloud-overlay-b" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 6 — WATER / RICE FIELD SHIMMER
          A soft moving glint covers the flooded paddy area
          (lower-centre of the composition).
      ═════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '20%', left: '22%', right: '8%',
          height: '28%',
          background: `
            linear-gradient(
              140deg,
              transparent                   0%,
              rgba(195,225,245,0.07)       28%,
              rgba(215,240,255,0.11)       50%,
              rgba(195,225,245,0.07)       72%,
              transparent                 100%
            )
          `,
          animation: 'water-shimmer 6s ease-in-out infinite',
          pointerEvents: 'none',
          borderRadius: '40%',
          filter: 'blur(5px)',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 7 — HORIZON MIST BAND
          A thin translucent band at the mountain-field boundary
          breathes gently, suggesting atmospheric haze.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '33%', left: 0, right: 0,
          height: '16%',
          background: `
            linear-gradient(
              to bottom,
              transparent,
              rgba(185,210,230,0.07) 40%,
              rgba(200,220,238,0.11) 60%,
              transparent
            )
          `,
          animation: 'mist-drift 20s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(3px)',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 8 — FOREGROUND DEPTH GRADIENT (parallaxed)
          Moves slightly more than the background on mouse move,
          simulating a close near-ground dark plane.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        ref={fgRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-6%', left: '-4%', right: '-4%',
          height: '30%',
          background:
            'linear-gradient(to top, rgba(1,5,1,0.94) 0%, rgba(2,10,2,0.68) 42%, transparent 100%)',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 9 — ATMOSPHERIC PARTICLES (pollen / dust motes)
      ═════════════════════════════════════════════════════════════════ */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.left, top: p.top,
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              background: p.color,
              animation: `atm-float ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          NAVIGATION
      ═════════════════════════════════════════════════════════════════ */}
      <nav
        className={`farm-nav${scrolled ? ' farm-nav--scrolled' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <Link
          href="/"
          aria-label="Marudam – Home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.82)" strokeWidth="1.4" fill="none" strokeOpacity="0.75"/>
            <path d="M 4 26 Q 20 20 36 26" stroke="rgba(255,255,255,0.82)" strokeWidth="1.6" strokeLinecap="round" fill="none" strokeOpacity="0.65"/>
            <path d="M 8 29 Q 14 26 20 29 Q 26 32 32 29" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            <line x1="20" y1="26" x2="20" y2="12" stroke="rgba(255,255,255,0.82)" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.8"/>
            <path d="M 20 18 Q 12 13 12 7 Q 18 10 20 18" fill="rgba(160,224,80,0.35)" stroke="rgba(255,255,255,0.82)" strokeWidth="1.2" strokeLinejoin="round" strokeOpacity="0.8"/>
            <path d="M 20 16 Q 28 11 28 5 Q 22 8 20 16" fill="rgba(160,224,80,0.55)" stroke="rgba(255,255,255,0.82)" strokeWidth="1.2" strokeLinejoin="round" strokeOpacity="0.8"/>
          </svg>
          <span style={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1.15rem',
            letterSpacing: '0.02em',
            textShadow: '0 1px 10px rgba(0,0,0,0.65)',
          }}>
            Marudam
          </span>
        </Link>

        {/* Links */}
        <ul
          className="nav-links"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0 }}
        >
          <li key="Home">
            <Link
              href="/"
              style={{
                color: 'rgba(255,255,255,0.84)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                textShadow: '0 1px 8px rgba(0,0,0,0.55)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.84)')}
            >
              Home
            </Link>
          </li>
          <li key="About">
            <Link
              href="/about"
              style={{
                color: 'rgba(255,255,255,0.84)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                textShadow: '0 1px 8px rgba(0,0,0,0.55)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.84)')}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          HERO CONTENT
          Positioned in the lower-left where the landscape naturally
          darkens (foreground foliage / shadow area).
          No large glassmorphism card — text reads directly on the scene.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          paddingLeft:   'clamp(1.5rem, 7vw, 5.5rem)',
          paddingBottom: 'clamp(2.5rem, 7vh, 5.5rem)',
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity:   transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        <div style={{ maxWidth: 'min(560px, 90vw)', pointerEvents: 'auto' }}>

          {/* Overline */}
          <div style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '0.5rem',
            color:         'rgba(172,222,110,0.92)',
            fontSize:      '0.70rem',
            fontWeight:    700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom:  '0.9rem',
            textShadow:    '0 1px 10px rgba(0,0,0,0.9)',
          }}>
            <span style={{
              display:    'inline-block',
              width:      '20px',
              height:     '1.5px',
              background: 'rgba(172,222,110,0.75)',
              borderRadius: '2px',
            }} />
            Smart Farming for Indian Farmers
            <span style={{
              display:    'inline-block',
              width:      '20px',
              height:     '1.5px',
              background: 'rgba(172,222,110,0.75)',
              borderRadius: '2px',
            }} />
          </div>

          {/* Headline */}
          <h1 style={{
            color:         'white',
            fontSize:      'clamp(2rem, 4.2vw, 3.1rem)',
            fontWeight:    800,
            lineHeight:    1.09,
            margin:        '0 0 0.95rem 0',
            letterSpacing: '-0.025em',
            textShadow:    '0 2px 22px rgba(0,0,0,0.75), 0 0 55px rgba(0,0,0,0.40)',
          }}>
            {t.landing.titlePart1}<br />
            <span style={{ color: '#a8e060' }}>{t.landing.titlePart2}</span>
          </h1>

          {/* Subtext */}
          <p style={{
            color:      'rgba(255,255,255,0.76)',
            fontSize:   'clamp(0.88rem, 1.4vw, 1.02rem)',
            lineHeight: 1.68,
            margin:     '0 0 1.9rem 0',
            textShadow: '0 1px 14px rgba(0,0,0,0.80)',
            maxWidth:   '440px',
          }}>
            {t.landing.subtitle}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              id="cta-register"
              onClick={handleRegister}
              style={{
                background:     'linear-gradient(135deg, #4a8432 0%, #68a42a 100%)',
                color:          'white',
                padding:        '0.72rem 1.8rem',
                borderRadius:   '9999px',
                fontWeight:     700,
                fontSize:       '0.92rem',
                border:         'none',
                cursor:         'pointer',
                boxShadow:
                  '0 4px 26px rgba(58,115,28,0.48), 0 1px 0 rgba(255,255,255,0.10) inset',
                transition: 'transform 0.22s, box-shadow 0.22s',
                display:    'inline-flex',
                alignItems: 'center',
                gap:        '0.48rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform  = 'translateY(-2px)';
                e.currentTarget.style.boxShadow  = '0 8px 34px rgba(58,115,28,0.58)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform  = '';
                e.currentTarget.style.boxShadow  =
                  '0 4px 26px rgba(58,115,28,0.48), 0 1px 0 rgba(255,255,255,0.10) inset';
              }}
            >
              <svg
                width="14" height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Register
            </button>

            <button
              id="cta-login"
              onClick={handleLogin}
              onMouseEnter={ghostBtnEnter}
              onMouseLeave={ghostBtnLeave}
              style={{
                background:    'rgba(255,255,255,0.07)',
                color:         'white',
                padding:       '0.72rem 1.8rem',
                borderRadius:  '9999px',
                fontWeight:    700,
                fontSize:      '0.92rem',
                border:        '1.5px solid rgba(255,255,255,0.28)',
                cursor:        'pointer',
                transition:    'background 0.2s, border-color 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          >
            {t.login.signIn} →
          </button>
          </div>

          {/* Trust line */}
          <div style={{
            marginTop:  '1.5rem',
            display:    'flex',
            alignItems: 'center',
            gap:        '0.55rem',
            flexWrap:   'wrap',
            color:      'rgba(255,255,255,0.42)',
            fontSize:   '0.72rem',
            textShadow: '0 1px 8px rgba(0,0,0,0.8)',
          }}>
            <span>🌾 {t.landing.builtForIndianFarmers}</span>
            <span style={{ opacity: 0.38 }}>·</span>
            <span>🤖 {t.landing.realTimeAI}</span>
            <span style={{ opacity: 0.38 }}>·</span>
            <span>💧 {t.landing.smartIrrigation}</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          LOGIN TRANSITION OVERLAY
          Dark blur grows over the scene before route navigation.
      ═════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position:       'absolute',
          inset:          0,
          zIndex:         40,
          pointerEvents:  'none',
          transition:     'background 0.62s ease, backdrop-filter 0.62s ease',
          ...(overlayOn
            ? {
                background:            'rgba(1,6,1,0.82)',
                backdropFilter:        'blur(14px)',
                WebkitBackdropFilter:  'blur(14px)',
              }
            : {
                background:            'transparent',
                backdropFilter:        'blur(0px)',
                WebkitBackdropFilter:  'blur(0px)',
              }),
        }}
      />
    </div>
  );
}
