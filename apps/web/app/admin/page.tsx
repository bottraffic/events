'use client';

import { useEffect, useState } from 'react';

interface Account {
  slug: string;
  name: string;
  plan: string;
  status: string;
  licenseUntil: string | null;
  unlimited: boolean;
  expired: boolean;
  adminName?: string;
  adminEmail?: string;
  adminStatus?: string;
  createdAt: string;
}

const API = '/v1';
const KEY_LS = 'simcha_platform_key';
const DURATIONS = [
  { label: '30 יום', days: 30 },
  { label: '90 יום', days: 90 },
  { label: '180 יום', days: 180 },
  { label: 'שנה', days: 365 },
  { label: 'ללא הגבלה', days: 0 },
];

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Account[]>([]);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [dur, setDur] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { const s = localStorage.getItem(KEY_LS); if (s) { setKey(s); setAuthed(true); } }, []);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const call = (path: string, body?: any) =>
    fetch(`${API}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'x-platform-key': key },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  const load = async (k = key) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/accounts`, { headers: { 'x-platform-key': k } });
      if (res.status === 403) { setError('מפתח שגוי'); setAuthed(false); localStorage.removeItem(KEY_LS); return; }
      if (!res.ok) throw new Error('שגיאה בטעינה');
      setRows(await res.json()); setAuthed(true); localStorage.setItem(KEY_LS, k);
    } catch (e: any) { setError(e.message ?? 'שגיאה'); } finally { setLoading(false); }
  };
  useEffect(() => { if (authed) load(); /* eslint-disable-next-line */ }, [authed]);

  const approve = async (a: Account) => { const r = await call('/auth/approve', { tenantSlug: a.slug, email: a.adminEmail, days: dur[a.slug] ?? 0 }); if (r.ok) { flash(`אושר: ${a.name} ✓`); load(); } };
  const extend = async (a: Account) => { const r = await call('/auth/license', { tenantSlug: a.slug, days: dur[a.slug] ?? 0 }); if (r.ok) { flash(`הרישיון עודכן: ${a.name}`); load(); } };
  const access = async (a: Account, open: boolean) => { const r = await call('/auth/access', { tenantSlug: a.slug, open }); if (r.ok) { flash(open ? `נפתחה גישה: ${a.name}` : `נסגרה גישה: ${a.name}`); load(); } };
  const edit = async (a: Account) => { const name = prompt('שם האולם:', a.name); if (!name) return; const r = await call('/auth/edit-tenant', { tenantSlug: a.slug, name }); if (r.ok) { flash('עודכן ✓'); load(); } };
  const del = async (a: Account) => { if (!confirm(`למחוק לצמיתות את "${a.name}"? פעולה זו תסגור את הגישה ותמחק את החשבון.`)) return; const r = await call('/auth/delete-tenant', { tenantSlug: a.slug }); if (r.ok) { flash('נמחק'); load(); } };

  const logout = () => { localStorage.removeItem(KEY_LS); setKey(''); setAuthed(false); setRows([]); };
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('he-IL') : '∞');

  const list = rows.filter((r) => (tab === 'pending' ? r.adminStatus === 'pending' : true));
  const pendingCount = rows.filter((r) => r.adminStatus === 'pending').length;

  if (!authed) {
    return (
      <main dir="rtl" style={wrap}><div style={card}>
        <div style={hdr}><img src="/logo.png" alt="events360" style={logo} /><h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>קונסולת מפעיל — events360</h1></div>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>ניהול חשבונות ורישיונות. נדרש מפתח פלטפורמה.</p>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="מפתח פלטפורמה" style={input} onKeyDown={(e) => e.key === 'Enter' && load()} />
        {error && <div style={errBox}>{error}</div>}
        <button onClick={() => load()} disabled={loading || !key} style={btn}>{loading ? '...' : 'כניסה'}</button>
      </div></main>
    );
  }

  return (
    <main dir="rtl" style={wrap}>
      {toast && <div style={toastBox}>{toast}</div>}
      <div style={{ ...card, maxWidth: 920 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={hdr}><img src="/logo.png" alt="events360" style={logo} /><h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>ניהול חשבונות ורישיונות</h1></div>
          <div style={{ display: 'flex', gap: 8 }}><button onClick={() => load()} style={ghost}>רענן</button><button onClick={logout} style={ghost}>יציאה</button></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTab('pending')} style={tab === 'pending' ? tabOn : tabOff}>ממתינים לאישור ({pendingCount})</button>
          <button onClick={() => setTab('all')} style={tab === 'all' ? tabOn : tabOff}>כל החשבונות ({rows.length})</button>
        </div>

        {error && <div style={errBox}>{error}</div>}
        {loading && <p style={{ color: '#64748b' }}>טוען…</p>}
        {!loading && list.length === 0 && <div style={empty}>{tab === 'pending' ? 'אין חשבונות הממתינים לאישור 🎉' : 'אין חשבונות'}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((a) => {
            const isPending = a.adminStatus === 'pending';
            const suspended = a.status === 'SUSPENDED';
            return (
              <div key={a.slug} style={row}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{a.name} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 13 }}>({a.slug})</span></div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{a.adminName} · {a.adminEmail}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    {isPending ? <span style={badge('#f59e0b')}>ממתין לאישור</span>
                      : suspended ? <span style={badge('#dc2626')}>גישה סגורה</span>
                      : a.expired ? <span style={badge('#dc2626')}>רישיון פג</span>
                      : <span style={badge('#10b981')}>פעיל</span>}
                    {!isPending && <span style={{ color: '#64748b', marginInlineStart: 8 }}>רישיון: {a.unlimited ? 'ללא הגבלה ∞' : `עד ${fmt(a.licenseUntil)}`}</span>}
                  </div>
                </div>

                <select value={dur[a.slug] ?? 0} onChange={(e) => setDur({ ...dur, [a.slug]: +e.target.value })} style={sel}>
                  {DURATIONS.map((d) => <option key={d.days} value={d.days}>{d.label}</option>)}
                </select>

                {isPending
                  ? <button onClick={() => approve(a)} style={btnGreen}>אישור</button>
                  : <button onClick={() => extend(a)} style={btnBlue}>עדכון רישיון</button>}
                {!isPending && (suspended
                  ? <button onClick={() => access(a, true)} style={btnGreen}>פתח גישה</button>
                  : <button onClick={() => access(a, false)} style={btnAmber}>סגור גישה</button>)}
                <button onClick={() => edit(a)} style={ghost}>ערוך</button>
                <button onClick={() => del(a)} style={btnRed}>מחק</button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,.08)' };
const hdr: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
const logo: React.CSSProperties = { width: 36, height: 36, borderRadius: 10, objectFit: 'cover' };
const input: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 10, padding: '11px 12px', fontSize: 15, boxSizing: 'border-box' };
const btn: React.CSSProperties = { width: '100%', marginTop: 14, background: 'linear-gradient(135deg,#6366f1,#4338ca)', color: '#fff', border: 0, borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const ghost: React.CSSProperties = { background: '#f1f5f9', color: '#475569', border: 0, borderRadius: 9, padding: '8px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 13 };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, flexWrap: 'wrap' };
const sel: React.CSSProperties = { border: '1px solid #cbd5e1', borderRadius: 9, padding: '8px 10px', fontSize: 13 };
const btnGreen: React.CSSProperties = { background: '#10b981', color: '#fff', border: 0, borderRadius: 9, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' };
const btnBlue: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 0, borderRadius: 9, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' };
const btnAmber: React.CSSProperties = { background: '#fef3c7', color: '#b45309', border: 0, borderRadius: 9, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' };
const btnRed: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', border: 0, borderRadius: 9, padding: '9px 12px', fontWeight: 700, cursor: 'pointer' };
const tabOn: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 0, borderRadius: 9, padding: '9px 16px', fontWeight: 700, cursor: 'pointer' };
const tabOff: React.CSSProperties = { background: '#f1f5f9', color: '#475569', border: 0, borderRadius: 9, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' };
const badge = (c: string): React.CSSProperties => ({ background: c + '22', color: c, padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: 11 });
const errBox: React.CSSProperties = { background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: 10, fontSize: 14, margin: '10px 0' };
const empty: React.CSSProperties = { textAlign: 'center', color: '#64748b', padding: '30px 0' };
const toastBox: React.CSSProperties = { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 600, zIndex: 50 };
