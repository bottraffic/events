'use client';

import { useEffect, useState } from 'react';

interface Pending {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  tenant: { name: string; slug: string };
}

const API = '/v1'; // nginx proxies same-origin /v1 to the NestJS API
const KEY_LS = 'simcha_platform_key';

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(KEY_LS) : '';
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const load = async (k = key) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/pending`, { headers: { 'x-platform-key': k } });
      if (res.status === 403) { setError('מפתח שגוי'); setAuthed(false); localStorage.removeItem(KEY_LS); return; }
      if (!res.ok) throw new Error('שגיאה בטעינה');
      const data = await res.json();
      setPending(data); setAuthed(true); localStorage.setItem(KEY_LS, k);
    } catch (e: any) { setError(e.message ?? 'שגיאה'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authed) load(); /* eslint-disable-next-line */ }, [authed]);

  const act = async (p: Pending, approve: boolean) => {
    try {
      const res = await fetch(`${API}/auth/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-platform-key': key },
        body: JSON.stringify({ tenantSlug: p.tenant.slug, email: p.email, approve }),
      });
      if (!res.ok) throw new Error('פעולה נכשלה');
      setPending((cur) => cur.filter((x) => x.id !== p.id));
      flash(approve ? `אושר: ${p.tenant.name} ✓` : `נדחה: ${p.tenant.name}`);
    } catch (e: any) { flash(e.message ?? 'שגיאה'); }
  };

  const logout = () => { localStorage.removeItem(KEY_LS); setKey(''); setAuthed(false); setPending([]); };

  if (!authed) {
    return (
      <main dir="rtl" style={wrap}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={logo}>S</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>קונסולת מפעיל — events360</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>אישור חשבונות חדשים. נדרש מפתח פלטפורמה.</p>
          <input
            type="password" value={key} onChange={(e) => setKey(e.target.value)}
            placeholder="מפתח פלטפורמה (Platform key)" style={input}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          {error && <div style={errBox}>{error}</div>}
          <button onClick={() => load()} disabled={loading || !key} style={btn}>{loading ? '...' : 'כניסה'}</button>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" style={wrap}>
      {toast && <div style={toastBox}>{toast}</div>}
      <div style={{ ...card, maxWidth: 760 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={logo}>S</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>חשבונות ממתינים לאישור</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => load()} style={ghost}>רענן</button>
            <button onClick={logout} style={ghost}>יציאה</button>
          </div>
        </div>

        {error && <div style={errBox}>{error}</div>}
        {loading && <p style={{ color: '#64748b' }}>טוען…</p>}
        {!loading && pending.length === 0 && <div style={empty}>אין חשבונות הממתינים לאישור 🎉</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map((p) => (
            <div key={p.id} style={row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.tenant?.name} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>({p.tenant?.slug})</span></div>
                <div style={{ fontSize: 13, color: '#475569' }}>{p.name} · {p.email}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleString('he-IL')}</div>
              </div>
              <button onClick={() => act(p, true)} style={approveBtn}>אישור</button>
              <button onClick={() => act(p, false)} style={rejectBtn}>דחייה</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,.08)' };
const logo: React.CSSProperties = { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 };
const input: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 10, padding: '11px 12px', fontSize: 15, boxSizing: 'border-box' };
const btn: React.CSSProperties = { width: '100%', marginTop: 14, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', border: 0, borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const ghost: React.CSSProperties = { background: '#f1f5f9', color: '#475569', border: 0, borderRadius: 9, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 };
const approveBtn: React.CSSProperties = { background: '#10b981', color: '#fff', border: 0, borderRadius: 9, padding: '9px 16px', fontWeight: 700, cursor: 'pointer' };
const rejectBtn: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', border: 0, borderRadius: 9, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' };
const errBox: React.CSSProperties = { background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: 10, fontSize: 14, margin: '10px 0' };
const empty: React.CSSProperties = { textAlign: 'center', color: '#64748b', padding: '30px 0' };
const toastBox: React.CSSProperties = { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 600, zIndex: 50 };
