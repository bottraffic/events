'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, CardHeader, Badge, Avatar, Segmented } from '@/components/ui';

interface User { id: string; name: string; email: string; role: string; }
const ROLE_TONE: Record<string, any> = { 'מנהל מערכת': 'brand', 'מנהל מכירות': 'sky', 'נציג': 'emerald', 'שירות לקוחות': 'amber', 'צפייה בלבד': 'slate' };
const ROLES = Object.keys(ROLE_TONE);
const PLANS = [
  { name: 'Starter', price: '₪299', features: ['2 משתמשים', '10 אירועים/חודש', 'CRM + WhatsApp'] },
  { name: 'Pro', price: '₪699', features: ['5 משתמשים', '50 אירועים', 'הושבה + טלפוניה'] },
  { name: 'Business', price: '₪1,490', features: ['15 משתמשים', 'ללא הגבלה', 'AI מלא'] },
  { name: 'Enterprise', price: 'מותאם', features: ['ללא הגבלה', 'White-label', 'API'] },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [plan, setPlan] = useState('Pro');
  const [inviting, setInviting] = useState(false);
  const [f, setF] = useState({ name: '', email: '', role: 'נציג' });
  const [toast, setToast] = useState('');
  const load = () => api<User[]>('/users').then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const invite = async () => { if (!f.name.trim() || !f.email.trim()) return; await api('/users', { method: 'POST', body: JSON.stringify(f) }); setF({ name: '', email: '', role: 'נציג' }); setInviting(false); load(); flash('הזמנה נשלחה ✓'); };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop">{toast}</div>}
      <PageHeader title="הגדרות" subtitle="משתמשים · הרשאות · חבילה וחיוב"
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'users', label: 'משתמשים' }, { value: 'billing', label: 'חבילה' }]} />} />

      {tab === 'users' ? (
        <Card>
          <CardHeader title="צוות" subtitle="ניהול משתמשים והרשאות (RBAC)" action={<button onClick={() => setInviting(true)} className="btn-primary !py-2"><Plus className="h-4 w-4" /> הזמן משתמש</button>} />
          <div className="divide-y divide-slate-50">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={u.name} size={40} />
                <div className="flex-1"><div className="font-medium text-ink">{u.name}</div><div className="text-xs text-ink-faint">{u.email}</div></div>
                <Badge tone={ROLE_TONE[u.role] ?? 'slate'}>{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const cur = p.name === plan;
            return (
              <Card key={p.name} className={`p-5 ${cur ? 'ring-2 ring-brand-400' : ''}`}>
                {cur && <Badge tone="brand" dot>החבילה שלך</Badge>}
                <div className="mt-2 text-lg font-bold text-ink">{p.name}</div>
                <div className="mt-1 text-2xl font-extrabold text-brand-700">{p.price}<span className="text-sm font-normal text-ink-faint">/חודש</span></div>
                <ul className="mt-4 space-y-2 text-sm text-ink-soft">{p.features.map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{x}</li>)}</ul>
                <button onClick={() => { setPlan(p.name); flash(`עברת לחבילת ${p.name}`); }} className={`mt-5 w-full ${cur ? 'btn-outline' : 'btn-primary'}`}>{cur ? 'החבילה הנוכחית' : 'שדרג'}</button>
              </Card>
            );
          })}
        </div>
      )}

      {inviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setInviting(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">הזמנת משתמש</h3><button onClick={() => setInviting(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם מלא" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input className="input" type="email" placeholder="אימייל" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">הרשאה</span><select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
            </div>
            <button onClick={invite} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> שלח הזמנה</button>
          </div>
        </div>
      )}
    </div>
  );
}
