'use client';

import { useEffect, useState } from 'react';

interface Ev { id: string; type: string; platform?: string; message?: string; stack?: string; appVersion?: string; deviceId?: string; url?: string; createdAt: string; }

const API = '/v1';
const KEY_LS = 'simcha_platform_key';

export default function CrashesPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [events, setEvents] = useState<Ev[]>([]);
  const [stats, setStats] = useState({ crashes: 0, errors: 0, affectedDevices: 0 });
  const [type, setType] = useState<'all' | 'crash' | 'error' | 'event'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { const s = localStorage.getItem(KEY_LS); if (s) { setKey(s); setAuthed(true); } }, []);
  const load = async (k = key, t = type) => {
    setError('');
    try {
      const r = await fetch(`${API}/telemetry?type=${t}`, { headers: { 'x-platform-key': k } });
      if (r.status === 403) { setError('מפתח שגוי'); setAuthed(false); localStorage.removeItem(KEY_LS); return; }
      const d = await r.json(); setEvents(d.events); setStats(d.stats); setAuthed(true); localStorage.setItem(KEY_LS, k);
    } catch { setError('שגיאה בטעינה'); }
  };
  useEffect(() => { if (authed) load(key, type); /* eslint-disable-next-line */ }, [authed, type]);

  const color = (t: string) => (t === 'crash' ? '#dc2626' : t === 'error' ? '#f59e0b' : '#64748b');

  if (!authed) {
    return (
      <main dir="rtl" style={wrap}><div style={card}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>תקלות וקריסות — events360</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 14px' }}>נדרש מפתח פלטפורמה.</p>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="מפתח פלטפורמה" style={input} onKeyDown={(e) => e.key === 'Enter' && load()} />
        {error && <div style={errBox}>{error}</div>}
        <button onClick={() => load()} disabled={!key} style={btn}>כניסה</button>
      </div></main>
    );
  }

  return (
    <main dir="rtl" style={{ ...wrap, alignItems: 'flex-start' }}>
      <div style={{ ...card, maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>תקלות וקריסות</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/admin" style={ghost}>← חשבונות</a>
            <button onClick={() => load()} style={ghost}>רענן</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
          <Stat label="קריסות" value={stats.crashes} color="#dc2626" />
          <Stat label="שגיאות" value={stats.errors} color="#f59e0b" />
          <Stat label="מכשירים מושפעים" value={stats.affectedDevices} color="#6366f1" />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['all', 'crash', 'error', 'event'] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} style={t === type ? tabOn : tabOff}>{({ all: 'הכל', crash: 'קריסות', error: 'שגיאות', event: 'אירועים' } as any)[t]}</button>
          ))}
        </div>

        {error && <div style={errBox}>{error}</div>}
        {events.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: 30 }}>אין דיווחים 🎉</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((e) => (
            <div key={e.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: e.stack ? 'pointer' : 'default' }} onClick={() => setOpen(open === e.id ? null : e.id)}>
                <span style={{ background: color(e.type) + '22', color: color(e.type), padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: 11 }}>{e.type}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{e.platform} · {e.appVersion}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.message || '—'}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleString('he-IL')}</span>
              </div>
              {open === e.id && e.stack && <pre dir="ltr" style={{ marginTop: 8, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8, fontSize: 11, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{e.stack}</pre>}
              {open === e.id && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>device: {e.deviceId} {e.url ? '· ' + e.url : ''}</div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, textAlign: 'center' }}><div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div><div style={{ fontSize: 12, color: '#64748b' }}>{label}</div></div>;
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2ff', display: 'flex', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,.08)' };
const input: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 10, padding: '11px 12px', fontSize: 15, boxSizing: 'border-box' };
const btn: React.CSSProperties = { width: '100%', marginTop: 14, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', border: 0, borderRadius: 10, padding: 12, fontWeight: 700, cursor: 'pointer' };
const ghost: React.CSSProperties = { background: '#f1f5f9', color: '#475569', borderRadius: 9, padding: '8px 12px', fontWeight: 600, fontSize: 13, textDecoration: 'none' };
const tabOn: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 0, borderRadius: 9, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 };
const tabOff: React.CSSProperties = { background: '#f1f5f9', color: '#475569', border: 0, borderRadius: 9, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 };
const errBox: React.CSSProperties = { background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: 10, fontSize: 14, margin: '10px 0' };
