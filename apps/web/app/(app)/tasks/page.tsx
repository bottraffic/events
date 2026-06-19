'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Clock, AlarmClock, CalendarCheck, CheckCircle2, Circle, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, Badge, Avatar, StatCard } from '@/components/ui';

interface Task { id: string; title: string; dueAt?: string; priority: string; done: boolean; who: string; remindAt?: string; }
const PRI: Record<string, { label: string; tone: any; bar: string }> = {
  URGENT: { label: 'דחוף', tone: 'rose', bar: '#ef4444' }, HIGH: { label: 'גבוה', tone: 'amber', bar: '#f59e0b' },
  MEDIUM: { label: 'בינוני', tone: 'sky', bar: '#0ea5e9' }, LOW: { label: 'נמוך', tone: 'slate', bar: '#94a3b8' },
};
const SNOOZE = ['בעוד שעה', 'מחר 09:00', 'בעוד שבוע'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
function bucketOf(t: Task): 'overdue' | 'today' | 'upcoming' {
  if (!t.dueAt) return 'upcoming';
  const due = startOfDay(new Date(t.dueAt)).getTime();
  const today = startOfDay(new Date()).getTime();
  if (due < today) return 'overdue';
  if (due === today) return 'today';
  return 'upcoming';
}
const fmtDue = (iso?: string) => {
  if (!iso) return 'ללא תאריך';
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }) + ' · ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

const COLS = [
  { key: 'overdue', label: 'באיחור', icon: AlarmClock, color: '#ef4444' },
  { key: 'today', label: 'להיום', icon: Clock, color: '#6366f1' },
  { key: 'upcoming', label: 'בקרוב', icon: CalendarCheck, color: '#0ea5e9' },
  { key: 'done', label: 'הושלם', icon: CheckCircle2, color: '#10b981' },
] as const;

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', dueAt: '', priority: 'MEDIUM', who: 'דני' });
  const load = () => api<Task[]>('/tasks').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);

  const toggle = async (id: string) => { const t = items.find((x) => x.id === id); if (!t) return; setItems((a) => a.map((x) => (x.id === id ? { ...x, done: !x.done } : x))); await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done: !t.done }) }); };
  const remind = async (id: string, val: string) => { setItems((a) => a.map((t) => (t.id === id ? { ...t, remindAt: val } : t))); setMenu(null); await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ remindAt: val }) }); };
  const create = async () => { if (!form.title.trim()) return; await api('/tasks', { method: 'POST', body: JSON.stringify(form) }); setForm({ title: '', dueAt: '', priority: 'MEDIUM', who: 'דני' }); setCreating(false); load(); };

  const open = items.filter((t) => !t.done);
  const cols = useMemo(() => ({
    overdue: open.filter((t) => bucketOf(t) === 'overdue'),
    today: open.filter((t) => bucketOf(t) === 'today'),
    upcoming: open.filter((t) => bucketOf(t) === 'upcoming'),
    done: items.filter((t) => t.done),
  }), [items]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="לוח משימות" subtitle="ניהול משימות לפי דחיפות · תזכורות · סנכרון אתר ואפליקציה"
        actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> משימה</button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="באיחור" value={cols.overdue.length} icon={<AlarmClock className="h-5 w-5" />} tone="rose" />
        <StatCard label="להיום" value={cols.today.length} icon={<Clock className="h-5 w-5" />} tone="brand" />
        <StatCard label="בקרוב" value={cols.upcoming.length} icon={<CalendarCheck className="h-5 w-5" />} tone="sky" />
        <StatCard label="הושלמו" value={cols.done.length} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLS.map((col) => (
          <div key={col.key} className="flex flex-col rounded-2xl border border-slate-200/70 bg-surface-subtle/60">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200/70 bg-white px-3.5 py-2.5" style={{ boxShadow: `inset 0 3px 0 ${col.color}` }}>
              <span className="flex items-center gap-2 text-sm font-bold text-ink"><col.icon className="h-4 w-4" style={{ color: col.color }} /> {col.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-ink-muted">{(cols as any)[col.key].length}</span>
            </div>
            <div className="flex-1 space-y-2.5 p-2.5">
              {(cols as any)[col.key].map((t: Task) => {
                const pri = PRI[t.priority] ?? PRI.MEDIUM;
                return (
                  <div key={t.id} className="group relative rounded-xl border border-slate-200 bg-white p-3 shadow-card transition hover:shadow-soft">
                    <div className="flex items-start gap-2.5">
                      <button onClick={() => toggle(t.id)} className="mt-0.5 shrink-0 text-ink-faint transition hover:text-emerald-500">{t.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}</button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium ${t.done ? 'text-ink-faint line-through' : 'text-ink'}`}>{t.title}</div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted"><Clock className="h-3 w-3" />{fmtDue(t.dueAt)}</span>
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: `${pri.bar}18`, color: pri.bar }}>{pri.label}</span>
                          {t.remindAt && <Badge tone="violet">🔔 {t.remindAt}</Badge>}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 border-t border-slate-50 pt-2"><Avatar name={t.who} size={20} /><span className="text-[11px] text-ink-faint">{t.who}</span></div>
                      </div>
                      {!t.done && (
                        <div className="relative">
                          <button onClick={() => setMenu(menu === t.id ? null : t.id)} className="rounded-lg p-1 text-ink-faint opacity-0 transition hover:bg-slate-100 group-hover:opacity-100" title="הקפץ תזכורת"><Bell className="h-4 w-4" /></button>
                          {menu === t.id && (
                            <><div className="fixed inset-0 z-20" onClick={() => setMenu(null)} />
                              <div className="absolute left-0 z-30 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
                                <div className="px-3 py-1.5 text-[11px] font-semibold text-ink-faint">הקפץ תזכורת</div>
                                {SNOOZE.map((s) => <button key={s} onClick={() => remind(t.id, s)} className="block w-full px-3 py-1.5 text-right text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700">{s}</button>)}
                              </div></>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {(cols as any)[col.key].length === 0 && <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-300">אין משימות</div>}
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">משימה חדשה</h3><button onClick={() => setCreating(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="כותרת המשימה…" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">תאריך ושעה</span><input type="datetime-local" className="input" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">עדיפות</span><select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{Object.entries(PRI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
                <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">אחראי</span><input className="input" value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} /></label>
              </div>
            </div>
            <button onClick={create} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> צור משימה</button>
          </div>
        </div>
      )}
    </div>
  );
}
