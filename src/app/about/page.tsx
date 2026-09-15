'use client';

import Link from 'next/link';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'MADHAN KUMARAN R',
      regNo: '24MIS0172',
      role: 'Lead Developer & AI Architect',
      initials: 'MK',
      badgeColor: '#a8e060',
    },
    {
      name: 'Abdullah khaleelur rahman A',
      regNo: '24MIS0337',
      role: 'Frontend & UI/UX Engineer',
      initials: 'AK',
      badgeColor: '#60d0e0',
    },
    {
      name: 'Naresh Y',
      regNo: '24MIS0317',
      role: 'Systems & Hardware Integration',
      initials: 'NY',
      badgeColor: '#e0a860',
    },
  ];

  return (
    <div
      role="main"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #09170a 0%, #0d220e 50%, #051006 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Background image overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/farm_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.22,
          filter: 'blur(3px)',
          pointerEvents: 'none',
        }}
      />

      {/* Radial lighting effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(168, 224, 96, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation Bar */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          backdropFilter: 'blur(12px)',
          background: 'rgba(5, 16, 6, 0.65)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
        >
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" />
            <path d="M 4 26 Q 20 20 36 26" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <line x1="20" y1="26" x2="20" y2="12" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 20 18 Q 12 13 12 7 Q 18 10 20 18" fill="rgba(168,224,96,0.4)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
            <path d="M 20 16 Q 28 11 28 5 Q 22 8 20 16" fill="rgba(168,224,96,0.6)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
          </svg>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.02em' }}>
            Marudam
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.82)',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
          >
            Home
          </Link>
          <Link
            href="/about"
            style={{
              color: '#a8e060',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
            }}
          >
            About
          </Link>
          <Link
            href="/dashboard"
            style={{
              background: 'linear-gradient(135deg, #4a8432 0%, #68a42a 100%)',
              color: 'white',
              padding: '0.5rem 1.2rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(58,115,28,0.4)',
            }}
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '3.5rem 1.5rem 5rem 1.5rem',
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(168,224,96,0.95)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              background: 'rgba(168, 224, 96, 0.1)',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(168, 224, 96, 0.25)',
            }}
          >
            <span>🌾</span> PROJECT CREDITS
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 1rem 0',
              color: '#ffffff',
            }}
          >
            Created By
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.72)',
              fontSize: '1.05rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            MARUDAM is an intelligent crop monitoring platform designed to bring adaptive AI baselines and real-time field insights to Indian agriculture.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
            marginBottom: '4rem',
          }}
        >
          {teamMembers.map((member, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(15, 32, 17, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '1.25rem',
                padding: '2rem 1.75rem',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(168, 224, 96, 0.4)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.35)';
              }}
            >
              {/* Avatar / Badge */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${member.badgeColor}33 0%, ${member.badgeColor}11 100%)`,
                  border: `2px solid ${member.badgeColor}`,
                  color: member.badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  marginBottom: '1.25rem',
                  boxShadow: `0 0 20px ${member.badgeColor}33`,
                }}
              >
                {member.initials}
              </div>

              {/* Name */}
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 0 0.4rem 0',
                  color: '#ffffff',
                  letterSpacing: '0.01em',
                }}
              >
                {member.name}
              </h2>

              {/* Register Number Badge */}
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(168, 224, 96, 0.15)',
                  color: '#a8e060',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  marginBottom: '0.85rem',
                  border: '1px solid rgba(168, 224, 96, 0.3)',
                }}
              >
                {member.regNo}
              </div>

              {/* Role */}
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontSize: '0.85rem',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {member.role}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              padding: '0.8rem 1.8rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'background 0.2s, border-color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← Back to Home
          </Link>

          <Link
            href="/register"
            style={{
              background: 'linear-gradient(135deg, #4a8432 0%, #68a42a 100%)',
              color: '#ffffff',
              padding: '0.8rem 1.8rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(58,115,28,0.5)',
              transition: 'transform 0.2s, boxShadow 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Create Account / Register
          </Link>

          <Link
            href="/dashboard"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#a8e060',
              padding: '0.8rem 1.8rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              border: '1px solid rgba(168, 224, 96, 0.4)',
              transition: 'background 0.2s, border-color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Go to Dashboard →
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '2rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.82rem',
        }}
      >
        © {new Date().getFullYear()} MARUDAM — Smart Farming for Indian Farmers
      </footer>
    </div>
  );
}
