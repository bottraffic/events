'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  UserCheck, HelpCircle, UserX, Clock, Upload, Send, Check, CheckCheck, Eye,
  MessageCircle, Phone, RefreshCw, Plus, Minus, CalendarDays, UserPlus, X, Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, CardHeader, Badge, Avatar, StatCard, Bar } from '@/components/ui';

interface Guest { id: string; name: string; group: string; size: number; status: string; phone: string; sent: boolean; delivered: boolean; read: boolean; attempts: number; lastSentAt: string; }
interface Cust { id: string; name: string; partner: string; phone: string; eventType: string; eventDate: string; }
const ST: Record<string, { label: string; tone: any }> = { YES: { label: 'מגיע', tone: 'emerald' }, MAYBE: { label: 'אולי', tone: 'amber' }, NO: { label: 'לא מגיע', tone: 'rose' }, PENDING: { label: 'ממתין', tone: 'slate' } };
const STATUSES = ['YES', 'MAYBE', 'NO', 'PENDING'];
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '');

export default function RsvpPage() {
  return <Suspense fallback={null}><RsvpInner /></Suspense>;
}

function RsvpInner() {
  const params = useSearchParams();
  const [customers, setCustomers] = useState<Cust[]>([]);
  const [customerId, setCustomerId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [sendFor, setSendFor] = useState<string[] | null>(null);
  const [toast, setToast] = useState('');
  const [manual, setManual] = useState<null | { name: string; phone: string; group: string; size: number; status: string }>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => { if (customerId) api<Guest[]>(`/guests?customer=${customerId}`).then(setGuests).catch(() => {}); };
  useEffect(() => { api<Cust[]>('/customers').then(setCustomers).catch(() => {}); setCustomerId(params.get('customer') ?? ''); }, []);
  useEffect(() => { load(); }, [customerId]);
  useSync(load);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const customer = customers.find((c) => c.id === customerId);

  const addManual = async () => {
    if (!manual?.name.trim()) return;
    await api('/guests', { method: 'POST', body: JSON.stringify({ ...manual, customerId }) });
    setManual(null); load(); flash('אורח נוסף ✓');
  };
  const importCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = async () => {
      const rows = String(r.result).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      let count = 0;
      for (const row of rows) {
        const [name, phone, size] = row.split(',').map((x) => x.trim());
        if (!name || /שם|name/i.test(name)) continue; // skip header
        await api('/guests', { method: 'POST', body: JSON.stringify({ name, phone: phone || '', size: Number(size) || 1, group: 'יבוא', status: 'PENDING', customerId }) });
        count++;
      }
      load(); flash(`יובאו ${count} מוזמנים מהקובץ ✓`);
    };
    r.readAsText(file, 'utf-8'); e.target.value = '';
  };

  const sum = (arr: Guest[]) => arr.reduce((s, g) => s + (g.size || 1), 0);
  const byStatus = (s: string) => guests.filter((g) => g.status === s);
  const notConfirmed = guests.filter((g) => g.status !== 'YES');
  const delivered = guests.filter((g) => g.delivered);
  const readCount = guests.filter((g) => g.read);
  const sentCount = guests.filter((g) => g.sent);

  const shown = useMemo(() => {
    if (filter === 'ALL') return guests;
    if (filter === 'NOTYES') return notConfirmed;
    return guests.filter((g) => g.status === filter);
  }, [guests, filter]);

  const setStatus = async (id: string, status: string) => {
    setGuests((p) => p.map((g) => (g.id === id ? { ...g, status } : g)));
    await api(`/guests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  };
  const setSize = async (id: string, size: number) => {
    if (size < 1) return;
    setGuests((p) => p.map((g) => (g.id === id ? { ...g, size } : g)));
    await api(`/guests/${id}`, { method: 'PATCH', body: JSON.stringify({ size }) });
  };
  const toggle = (id: string) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSel(new Set(shown.map((g) => g.id)));
  const selectNotConfirmed = () => { setFilter('NOTYES'); setSel(new Set(notConfirmed.map((g) => g.id))); };
  const doSend = async (channel: string) => {
    const ids = sendFor ?? [];
    await api('/guests/remind', { method: 'POST', body: JSON.stringify({ ids, channel }) });
    setSendFor(null); setSel(new Set()); load(); flash(`תזכורת נשלחה ל-${ids.length} אורחים ב-${channel} ✓`);
  };

  const eventPicker = <EventCombo customers={customers} value={customerId} onChange={setCustomerId} />;

  return (
    <div className="animate-fade-in">
      {toast && <Toast msg={toast} />}
      <PageHeader title="אישורי הגעה (RSVP)" subtitle={customer ? `${customer.name}${customer.partner ? ` & ${customer.partner}` : ''} · ${customer.eventType} · ${fmt(customer.eventDate)}` : 'בחר אירוע כדי לנהל את רשימת המוזמנים'}
        actions={<>
          {eventPicker}
          {customerId && <>
            <button onClick={() => fileRef.current?.click()} className="btn-outline"><Upload className="h-4 w-4" /> ייבוא Excel</button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
            <button onClick={() => setManual({ name: '', phone: '', group: 'משפחה', size: 2, status: 'PENDING' })} className="btn-outline"><UserPlus className="h-4 w-4" /> הוסף ידנית</button>
            <button onClick={selectNotConfirmed} className="btn-primary"><Send className="h-4 w-4" /> שלח למי שלא אישר</button>
          </>}
        </>} />

      {manual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setManual(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">הוספת אורח</h3><button onClick={() => setManual(null)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input autoFocus className="input" placeholder="שם האורח" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="טלפון" value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} />
                <input className="input" placeholder="קבוצה" value={manual.group} onChange={(e) => setManual({ ...manual, group: e.target.value })} />
                <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="text-ink-muted">מקומות</span><span className="flex items-center gap-2"><button onClick={() => setManual({ ...manual, size: Math.max(1, manual.size - 1) })} className="flex h-6 w-6 items-center justify-center rounded border">−</button><b>{manual.size}</b><button onClick={() => setManual({ ...manual, size: manual.size + 1 })} className="flex h-6 w-6 items-center justify-center rounded border">+</button></span></label>
                <select className="input" value={manual.status} onChange={(e) => setManual({ ...manual, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{ST[s].label}</option>)}</select>
              </div>
            </div>
            <button onClick={addManual} className="btn-primary mt-4 w-full"><UserPlus className="h-4 w-4" /> הוסף אורח</button>
          </div>
        </div>
      )}

      {!customerId ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CalendarDays className="h-7 w-7" /></div>
          <div className="font-semibold text-ink">בחר אירוע לניהול אישורי הגעה</div>
          <p className="max-w-sm text-sm text-ink-muted">רשימת המוזמנים מנוהלת לכל אירוע בנפרד. בחר אירוע מהרשימה למעלה, או היכנס דרך כרטיס הלקוח.</p>
          <div className="mt-2">{eventPicker}</div>
        </Card>
      ) : (
      <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="אישרו הגעה" value={sum(byStatus('YES'))} icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="אולי" value={sum(byStatus('MAYBE'))} icon={<HelpCircle className="h-5 w-5" />} tone="amber" />
        <StatCard label="לא מגיעים" value={sum(byStatus('NO'))} icon={<UserX className="h-5 w-5" />} tone="rose" />
        <StatCard label="ממתינים" value={sum(byStatus('PENDING'))} icon={<Clock className="h-5 w-5" />} tone="slate" />
      </div>

      {/* delivery tracking */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <DeliveryStat icon={<Check className="h-4 w-4" />} label="נשלחו" value={sentCount.length} total={guests.length} color="#64748b" />
        <DeliveryStat icon={<CheckCheck className="h-4 w-4" />} label="נמסרו" value={delivered.length} total={guests.length} color="#0ea5e9" />
        <DeliveryStat icon={<Eye className="h-4 w-4" />} label="נצפו" value={readCount.length} total={guests.length} color="#10b981" />
      </div>

      <Card>
        <CardHeader title={`רשימת מוזמנים (${shown.length})`} action={
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[['ALL', 'הכל'], ['YES', 'מגיעים'], ['MAYBE', 'אולי'], ['NO', 'לא'], ['PENDING', 'ממתינים'], ['NOTYES', 'לא אישרו']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`rounded-lg px-2.5 py-1 font-medium transition ${filter === v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{l}</button>
            ))}
          </div>
        } />

        {/* bulk action bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-sm">
          <label className="flex items-center gap-2 text-ink-muted"><input type="checkbox" checked={shown.length > 0 && shown.every((g) => sel.has(g.id))} onChange={(e) => (e.target.checked ? selectAll() : setSel(new Set()))} /> בחר הכל</label>
          <span className="text-ink-faint">{sel.size} נבחרו</span>
          <button disabled={!sel.size} onClick={() => setSendFor([...sel])} className="btn-primary !py-1.5 !text-xs disabled:opacity-40"><Send className="h-3.5 w-3.5" /> שלח תזכורת לנבחרים</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-slate-100 text-ink-faint"><tr>{['', 'אורח', 'קבוצה', 'מקומות', 'סטטוס', 'מסירה', 'נסיונות', ''].map((h, i) => <th key={i} className="p-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.id} className={`border-b border-slate-50 transition hover:bg-slate-50/60 ${sel.has(g.id) ? 'bg-brand-50/40' : ''}`}>
                  <td className="p-3"><input type="checkbox" checked={sel.has(g.id)} onChange={() => toggle(g.id)} /></td>
                  <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={g.name} size={30} /><div><div className="font-medium text-ink">{g.name}</div><div className="text-[11px] text-ink-faint">{g.phone}</div></div></div></td>
                  <td className="p-3 text-ink-muted">{g.group}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSize(g.id, g.size - 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-ink-muted hover:bg-slate-100"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center font-semibold text-ink">{g.size}</span>
                      <button onClick={() => setSize(g.id, g.size + 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-ink-muted hover:bg-slate-100"><Plus className="h-3 w-3" /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <select value={g.status} onChange={(e) => setStatus(g.id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium outline-none focus:border-brand-400">
                      {STATUSES.map((s) => <option key={s} value={s}>{ST[s].label}</option>)}
                    </select>
                  </td>
                  <td className="p-3"><DeliveryDots g={g} /></td>
                  <td className="p-3"><span className="text-ink-muted">{g.attempts}</span>{g.lastSentAt && <div className="text-[10px] text-ink-faint">{g.lastSentAt}</div>}</td>
                  <td className="p-3"><button onClick={() => setSendFor([g.id])} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100 hover:text-brand-600" title="שלח שוב"><RefreshCw className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>
      )}

      {sendFor && <SendModal count={sendFor.length} onClose={() => setSendFor(null)} onSend={doSend} />}
    </div>
  );
}

function DeliveryDots({ g }: { g: Guest }) {
  if (!g.sent) return <span className="text-[11px] text-ink-faint">טרם נשלח</span>;
  return (
    <div className="flex items-center gap-1.5" title={`נשלח${g.delivered ? ' · נמסר' : ''}${g.read ? ' · נצפה' : ''}`}>
      {g.read ? <Eye className="h-4 w-4 text-emerald-500" /> : g.delivered ? <CheckCheck className="h-4 w-4 text-sky-500" /> : <Check className="h-4 w-4 text-ink-faint" />}
      <span className="text-[11px] text-ink-muted">{g.read ? 'נצפה' : g.delivered ? 'נמסר' : 'נשלח'}</span>
    </div>
  );
}
function DeliveryStat({ icon, label, value, total, color }: { icon: React.ReactNode; label: string; value: number; total: number; color: string }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-ink-muted" style={{ color }}>{icon} {label}</span><span className="font-bold text-ink">{value}/{total}</span></div>
      <Bar value={value} max={total || 1} color={color} />
    </Card>
  );
}
function EventCombo({ customers, value, onChange }: { customers: Cust[]; value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const cur = customers.find((c) => c.id === value);
  if (cur) {
    return (
      <button onClick={() => onChange('')} className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
        <b>{cur.name}{cur.partner ? ` & ${cur.partner}` : ''}</b> · {cur.eventType} <X className="h-3.5 w-3.5" />
      </button>
    );
  }
  const matches = q.trim() ? customers.filter((c) => c.name.includes(q) || (c.partner || '').includes(q) || (c.phone || '').replace(/-/g, '').includes(q.replace(/-/g, ''))).slice(0, 6) : customers.slice(0, 6);
  return (
    <div className="relative">
      <div className="relative"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" /><input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="חפש אירוע לפי שם או טלפון…" className="input !w-64 pr-9 !py-2" /></div>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
            {matches.map((c) => (
              <button key={c.id} onClick={() => { onChange(c.id); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-right text-sm hover:bg-brand-50">
                <span className="font-medium text-ink">{c.name}{c.partner ? ` & ${c.partner}` : ''}</span>
                <span className="text-[11px] text-ink-faint">{c.eventType} · {c.phone}</span>
              </button>
            ))}
            {matches.length === 0 && <div className="px-3 py-2 text-xs text-ink-faint">לא נמצא אירוע</div>}
          </div>
        </>
      )}
    </div>
  );
}
function Toast({ msg }: { msg: string }) { return <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-fade-in">{msg}</div>; }
function SendModal({ count, onClose, onSend }: { count: number; onClose: () => void; onSend: (c: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 font-semibold text-ink">שליחת תזכורת</h3>
        <p className="mb-3 text-sm text-ink-muted">תזכורת אישור הגעה ל-{count} אורחים. בחר ערוץ:</p>
        <div className="space-y-2">
          {[{ id: 'WhatsApp', Icon: MessageCircle, c: 'text-emerald-600' }, { id: 'SMS', Icon: Phone, c: 'text-violet-600' }].map((ch) => (
            <button key={ch.id} onClick={() => onSend(ch.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-right transition hover:bg-slate-50">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${ch.c}`}><ch.Icon className="h-5 w-5" /></span>
              <div className="flex-1 font-semibold text-ink">{ch.id}</div><Send className="h-4 w-4 text-ink-faint" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
