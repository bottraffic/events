'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, Badge } from '@/components/ui';

interface Automation { id: string; name: string; trigger: string; actions: string[]; active: boolean; runs: number; }
const TRIGGERS = ['ליד חדש נכנס', 'שינוי שלב', 'הצעת מחיר ללא מענה 3 ימים', 'חוזה נחתם', '7 ימים לפני אירוע', 'שיחה הסתיימה'];
const ACTIONS = ['שלח WhatsApp', 'שלח SMS', 'שלח אימייל', 'צור משימה', 'התראת Push', 'עדכן CRM', 'התראה לנציג'];

export default function AutomationsPage() {
  const [items, setItems] = useState<Automation[]>([]);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState<{ name: string; trigger: string; actions: string[] }>({ name: '', trigger: TRIGGERS[0], actions: [] });
  const load = () => api<Automation[]>('/automations').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);

  const toggle = async (id: string) => {
    const a = items.find((x) => x.id === id); if (!a) return;
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    await api(`/automations/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !a.active }) });
  };
  const toggleAction = (act: string) => setF((p) => ({ ...p, actions: p.actions.includes(act) ? p.actions.filter((x) => x !== act) : [...p.actions, act] }));
  const create = async () => { if (!f.name.trim() || !f.actions.length) return; await api('/automations', { method: 'POST', body: JSON.stringify(f) }); setF({ name: '', trigger: TRIGGERS[0], actions: [] }); setCreating(false); load(); };

  return (
    <div className="animate-fade-in">
      <PageHeader title="אוטומציות" subtitle="בנאי IF / THEN — תהליכים אוטומטיים" actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> אוטומציה</button>} />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setCreating(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">אוטומציה חדשה</h3><button onClick={() => setCreating(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם האוטומציה" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">⚡ טריגר (אם...)</span><select className="input" value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })}>{TRIGGERS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">← פעולות (אז...)</span>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIONS.map((a) => <button key={a} onClick={() => toggleAction(a)} className={`chip ${f.actions.includes(a) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{a}</button>)}
                </div>
              </div>
            </div>
            <button onClick={create} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> צור אוטומציה</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-semibold text-ink">{a.name}</h3><Badge tone={a.active ? 'emerald' : 'slate'} dot>{a.active ? 'פעיל' : 'כבוי'}</Badge></div>
                <div className="mt-0.5 text-xs text-ink-faint">{a.runs} הרצות החודש</div>
              </div>
              <button onClick={() => toggle(a.id)} className={`relative h-6 w-11 rounded-full transition ${a.active ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${a.active ? 'left-0.5' : 'left-[22px]'}`} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Badge tone="amber"><Zap className="h-3 w-3" /> {a.trigger}</Badge>
              {a.actions.map((act, i) => (
                <span key={i} className="flex items-center gap-2"><span className="text-ink-faint">←</span><span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-ink-soft">{act}</span></span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
