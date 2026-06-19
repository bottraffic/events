'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, CardHeader, Badge, StatCard, Bar } from '@/components/ui';

interface Campaign { id: string; name: string; channel: string; number: string; budget: number; leads: number; deals: number; revenue: number; color: string; active: boolean; }
const CH_COLOR: Record<string, string> = { 'פייסבוק': '#1877f2', 'אינסטגרם': '#e1306c', 'גוגל': '#ea4335', 'טיקטוק': '#000000', 'אתר': '#6366f1' };

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: '', channel: 'פייסבוק', number: '', budget: 0 });
  const load = () => api<Campaign[]>('/campaigns').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);
  const toggle = async (id: string) => {
    const c = items.find((x) => x.id === id); if (!c) return;
    setItems((a) => a.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    await api(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) });
  };
  const create = async () => { if (!f.name.trim()) return; await api('/campaigns', { method: 'POST', body: JSON.stringify({ ...f, color: CH_COLOR[f.channel] ?? '#6366f1' }) }); setF({ name: '', channel: 'פייסבוק', number: '', budget: 0 }); setCreating(false); load(); };

  const totSpend = items.reduce((a, c) => a + c.budget, 0);
  const totRev = items.reduce((a, c) => a + c.revenue, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="ניהול קמפיינים · Call Tracking" subtitle="מספר וירטואלי לכל קמפיין · זיהוי מקור · ROI" actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> קמפיין</button>} />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">קמפיין חדש</h3><button onClick={() => setCreating(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם הקמפיין" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}>{Object.keys(CH_COLOR).map((c) => <option key={c}>{c}</option>)}</select>
                <input className="input" placeholder="מספר וירטואלי" value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} />
              </div>
              <input className="input" type="number" placeholder="תקציב חודשי ₪" value={f.budget} onChange={(e) => setF({ ...f, budget: +e.target.value })} />
            </div>
            <button onClick={create} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> צור קמפיין</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="קמפיינים פעילים" value={items.filter((c) => c.active).length} icon="📣" tone="brand" />
        <StatCard label="סה״כ לידים" value={items.reduce((a, c) => a + c.leads, 0)} icon="🎯" tone="sky" />
        <StatCard label="הוצאת מדיה" value={`₪${totSpend.toLocaleString()}`} icon="💸" tone="amber" />
        <StatCard label="ROI כולל" value={`${Math.round((totRev / (totSpend || 1)) * 100)}%`} icon="🚀" tone="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((c) => {
          const roi = Math.round((c.revenue / (c.budget || 1)) * 100);
          const cpl = Math.round(c.budget / (c.leads || 1));
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: c.color }}>📞</span>
                  <div>
                    <div className="font-semibold text-ink">{c.name}</div>
                    <div className="flex items-center gap-2 text-xs text-ink-faint"><span>{c.channel}</span>·<span className="font-mono font-medium text-brand-600">{c.number}</span></div>
                  </div>
                </div>
                <button onClick={() => toggle(c.id)} className={`relative h-6 w-11 rounded-full transition ${c.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.active ? 'left-0.5' : 'left-[22px]'}`} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Metric label="לידים" value={c.leads} />
                <Metric label="עסקאות" value={c.deals} />
                <Metric label="עלות/ליד" value={`₪${cpl}`} />
                <Metric label="הכנסה" value={`₪${(c.revenue / 1000).toFixed(0)}K`} />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs"><span className="text-ink-muted">ROI</span><span className="font-semibold text-emerald-600">{roi}%</span></div>
                <Bar value={roi} max={3000} color={c.color} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-slate-50 py-2.5"><div className="text-base font-bold text-ink">{value}</div><div className="text-[10px] text-ink-faint">{label}</div></div>;
}
