'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Phone, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, Avatar, Badge } from '@/components/ui';

interface Vendor { id: string; name: string; category: string; phone: string; rating: number; events: number; }

export default function VendorsPage() {
  const [items, setItems] = useState<Vendor[]>([]);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: '', category: 'תקליטן', phone: '', rating: 5 });
  const load = () => api<Vendor[]>('/vendors').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);

  const create = async () => { if (!f.name.trim()) return; await api('/vendors', { method: 'POST', body: JSON.stringify(f) }); setF({ name: '', category: 'תקליטן', phone: '', rating: 5 }); setCreating(false); load(); };

  return (
    <div className="animate-fade-in">
      <PageHeader title="ספקים" subtitle="ספר ספקים · דירוגים · היסטוריית עבודה" actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> ספק</button>} />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">ספק חדש</h3><button onClick={() => setCreating(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם הספק" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['תקליטן', 'צלם', 'קייטרינג', 'עיצוב', 'אבטחה', 'הסעות', 'אטרקציות'].map((c) => <option key={c}>{c}</option>)}</select>
                <input className="input" placeholder="טלפון" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </div>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">דירוג</span><select className="input" value={f.rating} onChange={(e) => setF({ ...f, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}</select></label>
            </div>
            <button onClick={create} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> הוסף ספק</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <Card key={v.id} className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={v.name} size={48} />
              <div className="flex-1"><div className="font-semibold text-ink">{v.name}</div><Badge tone="violet">{v.category}</Badge></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-amber-500">{'★'.repeat(v.rating)}<span className="text-slate-200">{'★'.repeat(5 - v.rating)}</span></span>
              <span className="text-ink-faint">{v.events} אירועים</span>
            </div>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${v.phone}`} className="btn-outline flex-1 !py-2"><Phone className="h-4 w-4" /> {v.phone}</a>
              <button className="btn-ghost !py-2"><MessageCircle className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
