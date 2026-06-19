'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Target, TrendingUp, Trophy, Percent, Phone, Search, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, StatCard, Card, Segmented, Badge } from '@/components/ui';

interface Stage { id: string; name: string; color: string; type: string; leadsCount: number; totalValue: number; }
interface Lead { id: string; name: string; phone?: string; source: string; eventType?: string; score?: number; estimatedValue?: number; stageId?: string; owner?: string; createdAt?: string; }

const SRC: Record<string, { label: string; color: string }> = {
  FACEBOOK: { label: 'פייסבוק', color: '#1877f2' }, INSTAGRAM: { label: 'אינסטגרם', color: '#e1306c' },
  GOOGLE_ADS: { label: 'גוגל', color: '#ea4335' }, TIKTOK: { label: 'טיקטוק', color: '#111827' },
  WHATSAPP: { label: 'וואטסאפ', color: '#25d366' }, WEBSITE: { label: 'אתר', color: '#6366f1' },
  PHONE: { label: 'טלפון', color: '#0ea5e9' }, REFERRAL: { label: 'המלצה', color: '#f59e0b' }, OTHER: { label: 'אחר', color: '#94a3b8' },
};
const scoreTone = (s: number) => (s >= 70 ? { c: '#10b981', bg: '#ecfdf5' } : s >= 50 ? { c: '#f59e0b', bg: '#fffbeb' } : { c: '#94a3b8', bg: '#f8fafc' });
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '—');
const toggle = (set: Set<string>, v: string) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState('table');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', source: 'FACEBOOK', eventType: 'חתונה', estimatedValue: 0 });
  // filters
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fSrc, setFSrc] = useState<Set<string>>(new Set());
  const [fType, setFType] = useState<Set<string>>(new Set());
  const [fStage, setFStage] = useState<Set<string>>(new Set());

  const load = async () => { const [s, l] = await Promise.all([api<Stage[]>('/pipeline'), api<Lead[]>('/leads')]); setStages(s); setLeads(l); };
  useEffect(() => { load().catch(() => {}); }, []);

  const onDrop = async (stageId: string) => {
    setOverStage(null); if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (!lead || lead.stageId === stageId) return;
    setLeads((prev) => prev.map((l) => (l.id === dragId ? { ...l, stageId } : l)));
    setDragId(null);
    await api(`/leads/${dragId}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId }) }).then(load).catch(load);
  };
  const addLead = async () => { if (!form.name.trim()) return; await api('/leads', { method: 'POST', body: JSON.stringify(form) }); setForm({ name: '', phone: '', source: 'FACEBOOK', eventType: 'חתונה', estimatedValue: 0 }); setAdding(false); load().catch(() => {}); };

  const types = useMemo(() => Array.from(new Set(leads.map((l) => l.eventType).filter(Boolean))) as string[], [leads]);
  const filtered = useMemo(() => leads.filter((l) => {
    const s = q.trim();
    const mq = !s || l.name.includes(s) || (l.phone || '').replace(/-/g, '').includes(s.replace(/-/g, ''));
    const mFrom = !from || (l.createdAt && l.createdAt >= from);
    const mTo = !to || (l.createdAt && l.createdAt <= to);
    const mSrc = !fSrc.size || fSrc.has(l.source);
    const mType = !fType.size || (l.eventType && fType.has(l.eventType));
    const mStage = !fStage.size || (l.stageId && fStage.has(l.stageId));
    return mq && mFrom && mTo && mSrc && mType && mStage;
  }), [leads, q, from, to, fSrc, fType, fStage]);

  const stageById = (id?: string) => stages.find((s) => s.id === id);
  const openValue = stages.filter((s) => s.type === 'OPEN').reduce((a, s) => a + Number(s.totalValue || 0), 0);
  const won = stages.find((s) => s.type === 'WON')?.leadsCount ?? 0;
  const conv = leads.length ? Math.round((won / leads.length) * 100) : 0;
  const sumVal = filtered.reduce((a, l) => a + (l.estimatedValue ?? 0), 0);
  const avgScore = filtered.length ? Math.round(filtered.reduce((a, l) => a + (l.score ?? 0), 0) / filtered.length) : 0;
  const activeFilters = fSrc.size + fType.size + fStage.size + (from ? 1 : 0) + (to ? 1 : 0) + (q ? 1 : 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="ניהול לידים" subtitle="כל הפניות במקום אחד · סינון מתקדם · תחזית הכנסות"
        actions={<><Segmented value={view} onChange={setView} options={[{ value: 'table', label: 'רשימה' }, { value: 'kanban', label: 'צינור' }]} /><button onClick={() => setAdding(true)} className="btn-primary"><Plus className="h-4 w-4" /> ליד חדש</button></>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סה״כ לידים" value={leads.length} icon={<Target className="h-5 w-5" />} tone="brand" />
        <StatCard label="שווי פתוח בצנרת" value={`₪${openValue.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} tone="amber" />
        <StatCard label="נסגרו" value={won} icon={<Trophy className="h-5 w-5" />} tone="emerald" />
        <StatCard label="אחוז המרה" value={`${conv}%`} icon={<Percent className="h-5 w-5" />} tone="sky" />
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setAdding(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">ליד חדש</h3><button onClick={() => setAdding(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם הליד" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="טלפון" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{Object.entries(SRC).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                <input className="input" placeholder="סוג אירוע" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} />
                <input className="input" type="number" placeholder="שווי ₪" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: +e.target.value })} />
              </div>
            </div>
            <button onClick={addLead} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> צור ליד</button>
          </div>
        </div>
      )}

      {view === 'table' ? (
        <>
          {/* filter bar */}
          <Card className="mb-4 space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או טלפון…" className="input pr-9 !py-2" />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-ink-muted"><Calendar className="h-4 w-4" /><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input !w-auto !py-2" /><span>—</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input !w-auto !py-2" /></div>
              {activeFilters > 0 && <button onClick={() => { setQ(''); setFrom(''); setTo(''); setFSrc(new Set()); setFType(new Set()); setFStage(new Set()); }} className="btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> נקה ({activeFilters})</button>}
            </div>
            <FilterRow label="מקור" items={Object.keys(SRC).map((k) => ({ id: k, label: SRC[k].label, color: SRC[k].color }))} sel={fSrc} onToggle={(v) => setFSrc((s) => toggle(s, v))} />
            <FilterRow label="סוג אירוע" items={types.map((t) => ({ id: t, label: t }))} sel={fType} onToggle={(v) => setFType((s) => toggle(s, v))} />
            <FilterRow label="שלב" items={stages.map((s) => ({ id: s.id, label: s.name, color: s.color }))} sel={fStage} onToggle={(v) => setFStage((s) => toggle(s, v))} />
          </Card>

          {/* summary */}
          <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-sm">
            <span className="text-ink-muted">מציג <b className="text-ink">{filtered.length}</b> מתוך {leads.length} לידים</span>
            <span className="text-ink-muted">שווי כולל <b className="text-ink">₪{sumVal.toLocaleString()}</b></span>
            <span className="text-ink-muted">ניקוד ממוצע <b className="text-ink">{avgScore}</b></span>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-100 text-ink-faint"><tr>{['ליד', 'מקור', 'סוג', 'שלב', 'שווי', 'ניקוד', 'נציג', 'תאריך'].map((h) => <th key={h} className="whitespace-nowrap p-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((l) => {
                  const src = SRC[l.source] ?? SRC.OTHER; const st = scoreTone(l.score ?? 0); const stg = stageById(l.stageId);
                  return (
                    <tr key={l.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                      <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={l.name} size={32} /><div><div className="font-medium text-ink">{l.name}</div>{l.phone && <div className="flex items-center gap-1 text-[11px] text-ink-faint"><Phone className="h-3 w-3" />{l.phone}</div>}</div></div></td>
                      <td className="p-3"><span className="flex items-center gap-1.5 text-ink-muted"><span className="h-2 w-2 rounded-full" style={{ background: src.color }} />{src.label}</span></td>
                      <td className="p-3 text-ink-muted">{l.eventType ?? '—'}</td>
                      <td className="p-3">{stg && <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${stg.color}15`, color: stg.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: stg.color }} />{stg.name}</span>}</td>
                      <td className="p-3 font-semibold text-ink">{l.estimatedValue ? `₪${l.estimatedValue.toLocaleString()}` : '—'}</td>
                      <td className="p-3"><span className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs font-bold" style={{ background: st.bg, color: st.c }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: st.c }} />{l.score ?? '—'}</span></td>
                      <td className="p-3"><div className="flex items-center gap-1.5"><Avatar name={l.owner ?? '?'} size={22} /><span className="text-[11px] text-ink-muted">{l.owner}</span></div></td>
                      <td className="p-3 whitespace-nowrap text-ink-muted">{fmt(l.createdAt)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-ink-faint">לא נמצאו לידים בסינון הנוכחי</td></tr>}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stageId === stage.id); const isOver = overStage === stage.id;
            const colTotal = stageLeads.reduce((a, l) => a + (l.estimatedValue ?? 0), 0);
            return (
              <div key={stage.id} onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }} onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))} onDrop={() => onDrop(stage.id)}
                className={`flex w-[290px] flex-shrink-0 flex-col rounded-2xl border bg-surface-subtle/60 transition ${isOver ? 'border-brand-300 bg-brand-50/60 ring-2 ring-brand-200' : 'border-slate-200/70'}`}>
                <div className="rounded-t-2xl border-b border-slate-200/70 bg-white px-3.5 pb-2.5 pt-3" style={{ boxShadow: `inset 0 3px 0 ${stage.color}` }}>
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-ink">{stage.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-ink-muted">{stageLeads.length}</span></div>
                  <div className="mt-0.5 text-[11px] font-medium text-ink-faint">₪{colTotal.toLocaleString()}</div>
                </div>
                <div className="flex-1 space-y-2.5 p-2.5">
                  {stageLeads.map((lead) => {
                    const src = SRC[lead.source] ?? SRC.OTHER; const st = scoreTone(lead.score ?? 0);
                    return (
                      <div key={lead.id} draggable onDragStart={() => setDragId(lead.id)} className="group cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft active:cursor-grabbing">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0"><div className="truncate font-semibold text-ink">{lead.name}</div>{lead.phone && <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-faint"><Phone className="h-3 w-3" />{lead.phone}</div>}</div>
                          {lead.score != null && <span className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold" style={{ background: st.bg, color: st.c }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: st.c }} />{lead.score}</span>}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted"><span className="h-2 w-2 rounded-full" style={{ background: src.color }} />{src.label}</span>{lead.estimatedValue ? <span className="text-sm font-bold text-ink">₪{lead.estimatedValue.toLocaleString()}</span> : null}</div>
                        {lead.owner && <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2"><Avatar name={lead.owner} size={22} /><span className="text-[11px] font-medium text-ink-muted">{lead.owner}</span></div>}
                      </div>
                    );
                  })}
                  {stageLeads.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-300">גרור לכאן</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, items, sel, onToggle }: { label: string; items: { id: string; label: string; color?: string }[]; sel: Set<string>; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 text-xs font-semibold text-ink-faint">{label}:</span>
      {items.map((it) => {
        const on = sel.has(it.id);
        return (
          <button key={it.id} onClick={() => onToggle(it.id)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'}`}>
            {it.color && <span className="h-2 w-2 rounded-full" style={{ background: on ? '#fff' : it.color }} />}{it.label}
          </button>
        );
      })}
    </div>
  );
}
