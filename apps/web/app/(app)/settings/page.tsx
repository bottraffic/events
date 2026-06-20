'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, X, Check, ImagePlus, Trash2 } from 'lucide-react';
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
  const [tenant, setTenant] = useState<{ name: string; logoUrl?: string | null }>({ name: '' });
  const [savingLogo, setSavingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const load = () => api<User[]>('/users').then(setUsers).catch(() => {});
  const loadTenant = () => api<any>('/tenant').then((t) => setTenant({ name: t.name, logoUrl: t.logoUrl })).catch(() => {});
  useEffect(() => { load(); loadTenant(); }, []);
  useSync(load);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const invite = async () => { if (!f.name.trim() || !f.email.trim()) return; await api('/users', { method: 'POST', body: JSON.stringify(f) }); setF({ name: '', email: '', role: 'נציג' }); setInviting(false); load(); flash('הזמנה נשלחה ✓'); };

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { flash('הקובץ גדול מדי (עד 1.5MB)'); return; }
    const r = new FileReader();
    r.onload = async () => {
      const dataUrl = String(r.result);
      setSavingLogo(true);
      try { await api('/tenant/logo', { method: 'PATCH', body: JSON.stringify({ logo: dataUrl }) }); setTenant((t) => ({ ...t, logoUrl: dataUrl })); flash('הלוגו נשמר ✓'); }
      catch { flash('שגיאה בשמירת הלוגו'); } finally { setSavingLogo(false); }
    };
    r.readAsDataURL(file);
  };
  const removeLogo = async () => { await api('/tenant/logo/remove', { method: 'PATCH' }).catch(() => api('/tenant/logo/remove', { method: 'POST' })); setTenant((t) => ({ ...t, logoUrl: null })); flash('הלוגו הוסר'); };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop">{toast}</div>}
      <PageHeader title="הגדרות" subtitle="משתמשים · הרשאות · חבילה וחיוב"
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'users', label: 'משתמשים' }, { value: 'branding', label: 'מיתוג' }, { value: 'billing', label: 'חבילה' }]} />} />

      {tab === 'branding' ? (
        <Card>
          <CardHeader title="מיתוג האולם" subtitle="הלוגו יוצג באפליקציה, באתר, בהזמנות ובמסמכים" />
          <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              {tenant.logoUrl ? <img src={tenant.logoUrl} alt="logo" className="h-full w-full object-contain" /> : <span className="text-3xl font-extrabold text-slate-300">{(tenant.name || 'A').charAt(0)}</span>}
            </div>
            <div className="flex-1">
              <div className="mb-1 font-semibold text-ink">לוגו האולם</div>
              <p className="mb-3 text-sm text-ink-muted">PNG / JPG עד 1.5MB. מומלץ ריבועי או שקוף.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => fileRef.current?.click()} disabled={savingLogo} className="btn-primary !py-2"><ImagePlus className="h-4 w-4" /> {savingLogo ? 'שומר…' : tenant.logoUrl ? 'החלף לוגו' : 'העלה לוגו'}</button>
                {tenant.logoUrl && <button onClick={removeLogo} className="btn !py-2 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /> הסר</button>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
              </div>
            </div>
          </div>
        </Card>
      ) : tab === 'users' ? (
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
