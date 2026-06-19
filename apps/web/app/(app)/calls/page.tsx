'use client';

import { useEffect, useMemo, useState } from 'react';
import { Phone, Clock, Smile, Target, Plus, X, Play, Pause, Sparkles, PhoneMissed, PhoneOff, PhoneCall, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Card, CardHeader, Badge, Avatar, StatCard, Bar } from '@/components/ui';

interface Call { id: string; name: string; number: string; campaign: string; dir: string; dur: string; status: string; date: string; sentiment: string; prob: number; summary: string; }
const SENT: Record<string, any> = { 'חיובי': 'emerald', 'נייטרלי': 'slate', 'שלילי': 'rose', '—': 'slate' };
const CALL_ST: Record<string, { label: string; tone: any }> = { ANSWERED: { label: 'נענתה', tone: 'emerald' }, MISSED: { label: 'לא נענתה', tone: 'rose' }, DISCONNECTED: { label: 'נותקה', tone: 'amber' } };
const SOURCES = ['פייסבוק', 'אינסטגרם', 'גוגל', 'טיקטוק', 'אתר'];
const toggleSet = (s: Set<string>, v: string) => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; };
const fmtD = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '');

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [active, setActive] = useState<Call | null>(null);
  const [playing, setPlaying] = useState(false);
  const [adding, setAdding] = useState(false);
  const [num, setNum] = useState({ number: '', source: 'פייסבוק' });
  const [toast, setToast] = useState('');
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [fStatus, setFStatus] = useState<Set<string>>(new Set());
  const [fCamp, setFCamp] = useState<Set<string>>(new Set());
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { api<Call[]>('/calls').then((c) => { setCalls(c); setActive(c[0]); }).catch(() => {}); }, []);

  const campaigns = useMemo(() => Array.from(new Set(calls.map((c) => c.campaign))), [calls]);
  const filtered = useMemo(() => calls.filter((c) => {
    const mF = !from || c.date >= from; const mT = !to || c.date <= to;
    const mS = !fStatus.size || fStatus.has(c.status); const mC = !fCamp.size || fCamp.has(c.campaign);
    return mF && mT && mS && mC;
  }), [calls, from, to, fStatus, fCamp]);
  const activeF = (from ? 1 : 0) + (to ? 1 : 0) + fStatus.size + fCamp.size;

  const addNumber = async () => { if (!num.number.trim()) return; await api('/tracking-numbers', { method: 'POST', body: JSON.stringify(num) }); setNum({ number: '', source: 'פייסבוק' }); setAdding(false); flash(`מספר וירטואלי ${num.number} נוסף לקמפיין ${num.source} ✓`); };
  const createTask = async () => { if (!active) return; await api('/tasks', { method: 'POST', body: JSON.stringify({ title: `מעקב אחרי שיחה עם ${active.name}`, due: 'מחר 10:00', priority: 'HIGH', who: 'דני' }) }); flash('משימת מעקב נוצרה ✓'); };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop">{toast}</div>}
      <PageHeader title="מרכז שיחות AI" subtitle="Call Tracking · הקלטות · תמלול וניתוח AI" actions={<button onClick={() => setAdding(true)} className="btn-primary"><Plus className="h-4 w-4" /> מספר וירטואלי</button>} />

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setAdding(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">מספר וירטואלי חדש</h3><button onClick={() => setAdding(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="050-000-0000" value={num.number} onChange={(e) => setNum({ ...num, number: e.target.value })} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">שייך לקמפיין/מקור</span><select className="input" value={num.source} onChange={(e) => setNum({ ...num, source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
            </div>
            <button onClick={addNumber} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> הוסף מספר</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סה״כ שיחות" value={filtered.length} icon={<Phone className="h-5 w-5" />} tone="brand" />
        <StatCard label="נענו" value={filtered.filter((c) => c.status === 'ANSWERED').length} icon={<PhoneCall className="h-5 w-5" />} tone="emerald" />
        <StatCard label="לא נענו" value={filtered.filter((c) => c.status === 'MISSED').length} icon={<PhoneMissed className="h-5 w-5" />} tone="rose" />
        <StatCard label="נותקו" value={filtered.filter((c) => c.status === 'DISCONNECTED').length} icon={<PhoneOff className="h-5 w-5" />} tone="amber" />
      </div>

      {/* filter bar */}
      <Card className="mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-ink-faint">סינון:</span>
          <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Calendar className="h-4 w-4" /><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input !w-auto !py-2" /><span>—</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input !w-auto !py-2" /></div>
          {activeF > 0 && <button onClick={() => { setFrom(''); setTo(''); setFStatus(new Set()); setFCamp(new Set()); }} className="btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> נקה ({activeF})</button>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5"><span className="w-16 shrink-0 text-xs font-semibold text-ink-faint">סטטוס:</span>
          {Object.entries(CALL_ST).map(([k, v]) => <button key={k} onClick={() => setFStatus((s) => toggleSet(s, k))} className={`chip ${fStatus.has(k) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{v.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5"><span className="w-16 shrink-0 text-xs font-semibold text-ink-faint">קמפיין:</span>
          {campaigns.map((c) => <button key={c} onClick={() => setFCamp((s) => toggleSet(s, c))} className={`chip ${fCamp.has(c) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{c}</button>)}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-x-auto">
          <CardHeader title={`שיחות (${filtered.length})`} />
          <table className="w-full text-right text-sm">
            <thead className="border-b border-slate-100 text-ink-faint"><tr>{['מתקשר', 'קמפיין', 'תאריך', 'סטטוס', 'משך', 'סיכוי'].map((h) => <th key={h} className="whitespace-nowrap p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => { setActive(c); setPlaying(false); }} className={`cursor-pointer border-b border-slate-50 transition hover:bg-slate-50/60 ${active?.id === c.id ? 'bg-brand-50/50' : ''}`}>
                  <td className="p-3"><div className="flex items-center gap-2"><Avatar name={c.name} size={30} /><div><div className="font-medium text-ink">{c.name}</div><div className="text-[11px] text-ink-faint">{c.number}</div></div></div></td>
                  <td className="p-3 text-ink-muted">{c.campaign}</td>
                  <td className="p-3 whitespace-nowrap text-ink-muted">{fmtD(c.date)}</td>
                  <td className="p-3"><Badge tone={CALL_ST[c.status]?.tone} dot>{CALL_ST[c.status]?.label ?? c.status}</Badge></td>
                  <td className="p-3 text-ink-muted">{c.dur}</td>
                  <td className="p-3">{c.status === 'ANSWERED' ? <span className={`font-semibold ${c.prob >= 70 ? 'text-emerald-600' : c.prob >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>{c.prob}%</span> : <span className="text-ink-faint">—</span>}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-faint">לא נמצאו שיחות בסינון</td></tr>}
            </tbody>
          </table>
        </Card>

        {active && (
          <Card>
            <CardHeader title="ניתוח AI" subtitle={active.name} action={<Badge tone="violet" dot>AI</Badge>} />
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <button onClick={() => setPlaying((p) => !p)} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                <div className="flex-1"><div className="h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: playing ? '66%' : '33%' }} /></div></div>
                <span className="text-xs text-ink-faint">{active.dur}</span>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-ink-faint">📝 סיכום שיחה</div>
                <p className="rounded-xl bg-violet-50 p-3 text-sm text-ink-soft">{active.summary}</p>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold text-ink-faint">🎯 סיכוי סגירה</span><span className="font-bold text-ink">{active.prob}%</span></div>
                <Bar value={active.prob} color={active.prob >= 70 ? '#10b981' : '#f59e0b'} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-ink-faint">תקציב משוער</div><div className="font-semibold text-ink">₪85-95K</div></div>
                <div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-ink-faint">תאריך אירוע</div><div className="font-semibold text-ink">יולי 2026</div></div>
              </div>
              <button onClick={createTask} className="btn-primary w-full"><Sparkles className="h-4 w-4" /> צור משימת מעקב</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
