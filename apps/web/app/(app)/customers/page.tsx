'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, DollarSign, Star, Mail, Phone, MessageCircle, Calendar,
  FileText, Armchair, MapPin, Plus, FileCheck, Clock, Search, X, Pencil, Save,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, CardHeader, Badge, Avatar, StatCard, Bar } from '@/components/ui';

interface Customer { id: string; name: string; partner: string; phone: string; email: string; city: string; eventType: string; eventDate: string; guests: number; hall: string; events: number; value: number; deposit: number; status: string; tags: string[]; }
interface Contract { id: string; customerId?: string; title: string; amount: number; status: string; eventDate: string; }

const ST: Record<string, { label: string; tone: any }> = { DRAFT: { label: 'טיוטה', tone: 'slate' }, SENT: { label: 'נשלח לחתימה', tone: 'amber' }, SIGNED: { label: 'נחתם', tone: 'emerald' } };
const ACT_COLOR: Record<string, string> = { contract: '#10b981', call: '#0ea5e9', quote: '#f59e0b', lead: '#6366f1', meeting: '#8b5cf6', edit: '#64748b', note: '#0ea5e9', seating: '#ec4899' };
const ACT_ICON: Record<string, string> = { contract: '✓', call: '☎', quote: '₪', lead: '✦', meeting: '◷', edit: '✎', note: '✐', seating: '◫' };
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '—');

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [active, setActive] = useState<Customer | null>(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('date');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);

  const reload = () => {
    api<Customer[]>('/customers').then((c) => { setItems(c); setActive((a) => a ? (c.find((x) => x.id === a.id) ?? c[0]) : c[0]); }).catch(() => {});
    api<Contract[]>('/contracts').then(setContracts).catch(() => {});
  };
  useEffect(() => { reload(); }, []);

  const saveCustomer = async (c: Customer) => {
    if (c.id) await api(`/customers/${c.id}`, { method: 'PATCH', body: JSON.stringify(c) });
    else { const created = await api<Customer>('/customers', { method: 'POST', body: JSON.stringify(c) }); setActive(created); }
    setEditing(null); reload();
  };
  const blankCustomer = (): Customer => ({ id: '', name: '', partner: '', phone: '', email: '', city: '', eventType: 'חתונה', eventDate: '', guests: 0, hall: '', events: 0, value: 0, deposit: 0, status: 'ליד חדש', tags: [] });

  const [plan, setPlan] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const loadActive = (cid: string) => {
    api<any>(`/seating-plans/${cid}`).then(setPlan).catch(() => {});
    api<any[]>(`/activities?customer=${cid}`).then(setActivities).catch(() => {});
    api<any[]>('/appointments').then((all) => setAppts(all.filter((a) => a.customerId === cid))).catch(() => {});
    api<any[]>(`/guests?customer=${cid}`).then(setGuests).catch(() => {});
  };
  useEffect(() => { if (active) loadActive(active.id); }, [active?.id]);
  useSync(() => { reload(); if (active) loadActive(active.id); });
  const addNote = async () => {
    if (!note.trim() || !active) return;
    await api('/activities', { method: 'POST', body: JSON.stringify({ customerId: active.id, type: 'note', text: note }) });
    setNote(''); loadActive(active.id);
  };

  const contractFor = (id: string) => contracts.find((k) => k.customerId === id);
  const types = useMemo(() => Array.from(new Set(items.map((c) => c.eventType))), [items]);

  const filtered = useMemo(() => {
    let list = items.filter((c) => {
      const s = q.trim();
      const matchQ = !s || c.name.includes(s) || (c.partner || '').includes(s) || (c.phone || '').replace(/-/g, '').includes(s.replace(/-/g, ''));
      const matchT = !type || c.eventType === type;
      const matchFrom = !from || (c.eventDate && c.eventDate >= from);
      const matchTo = !to || (c.eventDate && c.eventDate <= to);
      return matchQ && matchT && matchFrom && matchTo;
    });
    list = [...list].sort((a, b) => sort === 'date' ? new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime() : sort === 'value' ? b.value - a.value : a.name.localeCompare(b.name));
    return list;
  }, [items, q, type, sort, from, to]);

  const rsvpTotal = guests.reduce((s, g) => s + (g.size || 1), 0);
  const confirmed = guests.filter((g) => g.status === 'YES').reduce((s, g) => s + (g.size || 1), 0);
  const seated = plan?.assignments?.reduce((s: number, a: any) => s + (a.count ?? 1), 0) ?? plan?.seated ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader title="לקוחות" subtitle="כרטיס לקוח 360° · אירוע · הסכם · אורחים · הושבה" actions={<button onClick={() => setEditing(blankCustomer())} className="btn-primary"><Plus className="h-4 w-4" /> לקוח חדש</button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סה״כ לקוחות" value={items.length} icon={<Users className="h-5 w-5" />} tone="brand" />
        <StatCard label="פעילים" value={items.filter((c) => c.status.includes('פעיל') || c.status.includes('VIP')).length} icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="שווי כולל" value={`₪${items.reduce((a, c) => a + c.value, 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} tone="amber" />
        <StatCard label="לקוחות VIP" value={items.filter((c) => c.status.includes('VIP') || c.tags.includes('VIP')).length} icon={<Star className="h-5 w-5" />} tone="sky" />
      </div>

      {/* filter bar */}
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או טלפון…" className="input pr-9 !py-2" />
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setType('')} className={`chip ${!type ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>הכל</button>
          {types.map((t) => <button key={t} onClick={() => setType(t)} className={`chip ${type === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{t}</button>)}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Calendar className="h-4 w-4" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input !w-auto !py-2" title="מתאריך" />
          <span>—</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input !w-auto !py-2" title="עד תאריך" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !py-2 text-sm">
          <option value="date">מיון: תאריך אירוע</option>
          <option value="value">מיון: שווי</option>
          <option value="name">מיון: שם</option>
        </select>
        {(q || type || from || to) && <button onClick={() => { setQ(''); setType(''); setFrom(''); setTo(''); }} className="btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> נקה</button>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title={`לקוחות (${filtered.length})`} />
          <div className="max-h-[640px] divide-y divide-slate-50 overflow-y-auto">
            {filtered.map((c) => {
              const k = contractFor(c.id);
              return (
                <button key={c.id} onClick={() => setActive(c)} className={`flex w-full items-center gap-3 p-3 text-right transition hover:bg-slate-50 ${active?.id === c.id ? 'bg-brand-50/60' : ''}`}>
                  <Avatar name={c.name} size={40} />
                  <div className="min-w-0 flex-1"><div className="truncate font-medium text-ink">{c.name}{c.partner ? ` & ${c.partner}` : ''}</div><div className="text-[11px] text-ink-faint">{c.eventType} · {fmt(c.eventDate)}</div></div>
                  {k && <Badge tone={ST[k.status].tone}>{ST[k.status].label}</Badge>}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-ink-faint">לא נמצאו לקוחות</div>}
          </div>
        </Card>

        {active && (
          <div className="space-y-4 lg:col-span-2">
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <Avatar name={active.name} size={64} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-ink">{active.name}{active.partner ? ` & ${active.partner}` : ''}</h2>{active.tags.map((t) => <Badge key={t} tone="violet">{t}</Badge>)}</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {active.city || '—'}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {active.phone}</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {active.email || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setEditing(active)} className="btn-primary !py-2"><Pencil className="h-4 w-4" /> ערוך פרטים</button>
                  <Link href={`/invitations?customer=${active.id}`} className="btn-outline !py-2"><Mail className="h-4 w-4" /> הזמנה דיגיטלית</Link>
                  <a href={`https://wa.me/972${(active.phone || '').replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="btn-outline !py-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                  <a href={`tel:${active.phone}`} className="btn-outline !py-2"><Phone className="h-4 w-4" /> חייג</a>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><Calendar className="h-4 w-4 text-brand-600" /> האירוע</div>
                <div className="space-y-1.5 text-sm"><Row l="סוג" v={active.eventType} /><Row l="תאריך" v={fmt(active.eventDate)} /><Row l="אולם" v={active.hall || '—'} /><Row l="מוזמנים" v={`${active.guests}`} /></div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="mb-1 flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-ink-muted"><UserCheck className="h-3.5 w-3.5" /> אישרו הגעה</span><span className="font-semibold text-ink">{confirmed}/{rsvpTotal}</span></div>
                  <Bar value={confirmed} max={rsvpTotal || 1} color="#10b981" />
                  <Link href={`/rsvp?customer=${active.id}`} className="btn-outline mt-3 w-full !py-2"><UserCheck className="h-4 w-4" /> נהל אישורי הגעה</Link>
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><FileText className="h-4 w-4 text-brand-600" /> הסכם</div>
                {(() => {
                  const k = contractFor(active.id);
                  if (!k) return (
                    <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-ink-faint">
                      אין הסכם עדיין
                      <Link href={`/contracts?new=1&customer=${active.id}`} className="btn-primary mt-3 w-full !py-2"><Plus className="h-4 w-4" /> צור הסכם ללקוח</Link>
                    </div>
                  );
                  return (
                    <div>
                      <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-ink">{k.title}</span><Badge tone={ST[k.status].tone} dot>{ST[k.status].label}</Badge></div>
                      <div className="space-y-1.5 text-sm"><Row l="סכום" v={`₪${k.amount.toLocaleString()}`} /><Row l="מקדמה" v={`₪${active.deposit.toLocaleString()}`} /><Row l="יתרה" v={`₪${(k.amount - active.deposit).toLocaleString()}`} /></div>
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700">{k.status === 'SIGNED' ? <><FileCheck className="h-4 w-4" /> נחתם ושמור בכרטיס</> : <><Clock className="h-4 w-4" /> ממתין לחתימת הלקוח</>}</div>
                      <Link href={`/contracts?edit=${k.id}`} className="btn-outline mt-3 w-full !py-2"><FileText className="h-4 w-4" /> צפה / ערוך הסכם</Link>
                    </div>
                  );
                })()}
              </Card>

              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><Armchair className="h-4 w-4 text-brand-600" /> סידורי הושבה</div>
                <div className="space-y-1.5 text-sm">
                  <Row l="שולחנות" v={`${plan?.tables?.length ?? 0}`} />
                  <Row l="משובצים" v={`${seated} מקומות`} />
                  <Row l="סטטוס" v={plan ? 'נשמר ✓' : 'טרם נשמר'} />
                </div>
                <Link href={`/seating?customer=${active.id}`} className="btn-outline mt-3 w-full !py-2"><Armchair className="h-4 w-4" /> פתח מתכנן הושבה</Link>
              </Card>

              {/* upcoming meetings */}
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 font-semibold text-ink"><Calendar className="h-4 w-4 text-brand-600" /> פגישות</div><Link href={`/calendar?customer=${active.id}`} className="text-xs font-medium text-brand-600">+ קבע פגישה</Link></div>
                <div className="space-y-2">
                  {appts.length === 0 && <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-ink-faint">אין פגישות מתוזמנות</div>}
                  {appts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <div><div className="font-medium text-ink">{a.title}</div><div className="text-[11px] text-ink-faint">{fmt(a.date)} · {a.time}</div></div>
                      <Badge tone="brand">{a.type}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* CRM activity log */}
            <Card>
              <CardHeader title="יומן פעילות (CRM)" subtitle="כל פעולה מתועדת לפי משתמש וזמן" />
              <div className="flex gap-2 border-b border-slate-100 p-3">
                <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="הוסף הערה / סיכום שיחה…" className="input !py-2" />
                <button onClick={addNote} className="btn-primary shrink-0"><Plus className="h-4 w-4" /> הוסף</button>
              </div>
              <div className="max-h-80 space-y-0 overflow-y-auto p-2">
                {activities.map((a) => {
                  const c = ACT_COLOR[a.type] ?? '#6366f1';
                  return (
                    <div key={a.id} className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: c }}>{ACT_ICON[a.type] ?? '•'}</span>
                      <div className="flex-1">
                        <div className="text-sm text-ink-soft">{a.text}</div>
                        <div className="text-[11px] text-ink-faint">{a.user} · {a.at}</div>
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && <div className="p-6 text-center text-sm text-ink-faint">אין פעילות עדיין</div>}
              </div>
            </Card>
          </div>
        )}
      </div>

      {editing && <EditCustomerModal customer={editing} onClose={() => setEditing(null)} onSave={saveCustomer} />}
    </div>
  );
}

function EditCustomerModal({ customer, onClose, onSave }: { customer: Customer; onClose: () => void; onSave: (c: Customer) => void }) {
  const [c, setC] = useState<Customer>({ ...customer });
  const set = (k: keyof Customer, v: any) => setC((p) => ({ ...p, [k]: v }));
  const fields: [keyof Customer, string, string?][] = [
    ['name', 'שם מלא'], ['partner', 'בן/בת זוג'], ['phone', 'טלפון'], ['email', 'אימייל'],
    ['city', 'עיר'], ['eventType', 'סוג אירוע'], ['eventDate', 'תאריך אירוע', 'date'],
    ['hall', 'אולם'], ['guests', 'מס׳ מוזמנים', 'number'], ['value', 'שווי ₪', 'number'],
    ['deposit', 'מקדמה ₪', 'number'], ['status', 'סטטוס'],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-ink">{customer.id ? 'עריכת פרטי לקוח' : 'לקוח חדש'}</h3><button onClick={onClose} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(([k, label, type]) => (
            <label key={String(k)} className="block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
              <input type={type ?? 'text'} value={String((c as any)[k] ?? '')} onChange={(e) => set(k, type === 'number' ? +e.target.value : e.target.value)} className="input !py-2" />
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onSave(c)} className="btn-primary flex-1"><Save className="h-4 w-4" /> שמור שינויים</button>
          <button onClick={onClose} className="btn-ghost">ביטול</button>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex items-center justify-between"><span className="text-ink-muted">{l}</span><span className="font-medium text-ink">{v}</span></div>;
}
