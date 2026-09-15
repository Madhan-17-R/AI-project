'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MarudamLogo from '@/components/brand/MarudamLogo';
import { type Language, getTranslations } from '@/lib/i18n/translations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MarudamChatProps {
  language: Language;
  /** Structured field context passed to GPT-4o */
  fieldContext: Record<string, unknown>;
}

export default function MarudamChat({ language, fieldContext }: MarudamChatProps) {
  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, language, context: fieldContext }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setError(t.chat.errorGeneral);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, language, fieldContext, t.chat.errorGeneral]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const suggested = [
    t.chat.suggested1, t.chat.suggested2, t.chat.suggested3,
    t.chat.suggested4, t.chat.suggested5, t.chat.suggested6,
  ];

  /* ── colours ─────────────────────────────────────────────────────── */
  const green  = 'var(--brand-primary)';
  const accent = 'var(--brand-primary)';

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────── */}
      <button
        id="chat-open-btn"
        aria-label={t.chat.askButton}
        onClick={() => setOpen(true)}
        style={{
          position:'fixed', bottom:'2rem', right:'2rem', zIndex:50,
          display:'flex', alignItems:'center', gap:'0.5rem',
          background: open ? 'rgba(60,100,40,0.9)' : 'linear-gradient(135deg,#3a6e28 0%,#62a830 100%)',
          color:'var(--text-primary)', border:'none', borderRadius:'9999px',
          padding:'0.7rem 1.4rem 0.7rem 1rem', fontSize:'0.9rem', fontWeight:700,
          cursor:'pointer', boxShadow:'0 6px 28px rgba(0,0,0,0.45)',
          backdropFilter:'blur(8px)',
          transition:'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 34px rgba(0,0,0,0.55)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 28px rgba(0,0,0,0.45)'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        {t.chat.askButton}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog" aria-modal aria-label="Marudam AI"
          style={{
            position:'fixed', inset:0, zIndex:60,
            display:'flex', alignItems:'flex-end', justifyContent:'flex-end',
            pointerEvents:'none',
          }}
        >
          {/* Backdrop (click to close) */}
          <div
            onClick={()=>setOpen(false)}
            style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(2px)',pointerEvents:'all'}}
          />

          {/* Panel */}
          <div
            style={{
              position:'relative', zIndex:1, pointerEvents:'all',
              width:'min(420px,100vw)', height:'min(600px,100svh)',
              background:'linear-gradient(160deg,#0c1f0c 0%,#0e2a18 60%,#091a20 100%)',
              border:'1px solid var(--border-brand-subtle)',
              borderRadius:'1.5rem 1.5rem 0 0',
              display:'flex', flexDirection:'column',
              boxShadow:'-8px -8px 40px rgba(0,0,0,0.55)',
              overflow:'hidden',
            }}
          >
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <MarudamLogo size={24} />
                <span style={{color:'var(--text-primary)',fontWeight:700,fontSize:'1rem'}}>{t.chat.title}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <span style={{fontSize:'0.7rem',color:'rgba(160,224,80,0.7)',background:'rgba(160,224,80,0.08)',border:'1px solid rgba(160,224,80,0.18)',borderRadius:'9999px',padding:'0.25rem 0.6rem'}}>
                  {t.chat.usingFieldData}
                </span>
                <button onClick={()=>setOpen(false)} aria-label={t.chat.close} style={{background:'var(--border-very-subtle)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.65)',borderRadius:'9999px',width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem'}}>
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {messages.length === 0 && (
                <div>
                  <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.83rem',marginBottom:'1rem',textAlign:'center'}}>
                    {t.chat.emptyState}
                  </p>
                  <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem',marginBottom:'0.5rem'}}>{t.chat.suggestedTitle}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                    {suggested.slice(0, 4).map((q, i) => (
                      <button key={i} onClick={()=>sendMessage(q)}
                        style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'0.75rem',padding:'0.5rem 0.75rem',color:'rgba(255,255,255,0.65)',fontSize:'0.8rem',cursor:'pointer',textAlign:'left',transition:'background 0.15s'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(160,224,80,0.08)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start'}}>
                  <div style={{
                    maxWidth:'85%', padding:'0.65rem 0.9rem', borderRadius: msg.role==='user'?'1rem 1rem 0 1rem':'1rem 1rem 1rem 0',
                    background: msg.role==='user' ? 'linear-gradient(135deg,#3a6e28,#62a830)' : 'var(--border-very-subtle)',
                    color: 'var(--text-primary)', fontSize:'0.85rem', lineHeight:1.55,
                    border: msg.role==='assistant'?'1px solid var(--border-very-subtle)':'none',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem',color:accent,fontSize:'0.82rem'}}>
                  <span style={{animation:'pulse 1.4s ease-in-out infinite'}}>●</span>
                  {t.chat.thinking}
                </div>
              )}

              {error && (
                <div style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'0.75rem',padding:'0.55rem 0.8rem',color:'#f87171',fontSize:'0.8rem'}}>
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{padding:'0.75rem 1rem',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:'0.5rem'}}>
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                disabled={loading}
                style={{flex:1,background:'var(--border-very-subtle)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'9999px',padding:'0.6rem 1rem',color:'var(--text-primary)',fontSize:'0.88rem',outline:'none'}}
                onFocus={e=>(e.currentTarget.style.borderColor='rgba(160,224,80,0.45)')}
                onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')}
              />
              <button type="submit" disabled={loading||!input.trim()} id="chat-send-btn"
                style={{background:'linear-gradient(135deg,#3a6e28,#62a830)',color:'var(--text-primary)',border:'none',borderRadius:'9999px',padding:'0.6rem 1.1rem',fontSize:'0.88rem',fontWeight:600,cursor:loading||!input.trim()?'not-allowed':'pointer',opacity:loading||!input.trim()?0.5:1}}>
                {t.chat.send}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
