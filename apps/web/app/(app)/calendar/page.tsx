'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Plus, X, Clock, MessageCircle, Phone, Trash2, MapPin, Send, Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, CardHeader, Badge, Avatar } from '@/components/ui';

interface Appt { id: string; customerId?: string; customerName?: string; customerPhone?: string; title: string; type: string; date: string; time: string; durationMin: number; notes?: string; channelSent?: string; }
interface Customer { id: string; name: string; partner: string; phone: string; eventType: string; }

const TYPE_TONE: Record<string, { tone: any; color: string }> = {
  'פגישה': { tone: 'brand', color: '#6366f1' }, 'סיור': { tone: 'emerald', color: '#10b981' },
  'טעימות': { tone: 'amber', color: '#f59e0b' }, 'שיחה': { tone: 'sky', color: '#0ea5e9' }, 'חתימה': { tone: 'violet', color: '#8b5cf6' },
};
const TYPES = Object.keys(TYPE_TONE);
const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function CalendarPage() {
  return <Suspense fallback={null}><CalendarInner /></Suspense>;
}

function CalendarInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [editing, setEditing] = useState<Appt | null>(null);
  const [sendFor, setSendFor] = useState<Appt | null>(null);
  const [toast, setToast] = useState('');

  const load = () => { api<Appt[]>('/appointments').then(setAppts).catch(() => {}); };
  useEffect(() => {
    load();
    api<Customer[]>('/customers').then((cs) => {
      setCustomers(cs);
      const cid = params.get('customer');
      if (cid) { const c = cs.find((x) => x.id === cid); setEditing({ id: '', customerId: cid, customerName: c?.name, title: c ? `פגישה — ${c.name}` : '', type: 'פגישה', date: iso(new Date()), time: '12:00', durationMin: 60 }); router.replace('/calendar'); }
    }).catch(() => {});
  }, []);
  useSync(load);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const byDate = useMemo(() => {
    const m: Record<string, Appt[]> = {};
    appts.forEach((a) => { (m[a.date] ??= []).push(a); });
    return m;
  }, [appts]);

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const todayIso = iso(new Date());
  const upcoming = [...appts].filter((a) => a.date >= todayIso).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);

  const save = async (a: Appt) => {
    const cust = customers.find((c) => c.id === a.customerId);
    const payload = { ...a, customerName: cust?.name ?? a.customerName, customerPhone: cust?.phone ?? a.customerPhone };
    if (a.id) await api(`/appointments/${a.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    else await api('/appointments', { method: 'POST', body: JSON.stringify(payload) });
    setEditing(null); load(); flash('הפגישה נשמרה ✓');
  };
  const remove = async (id: string) => { await api(`/appointments/${id}`, { method: 'DELETE' }); load(); flash('הפגישה נמחקה'); };
  const send = async (channel: string) => { if (!sendFor) return; await api(`/appointments/${sendFor.id}/send`, { method: 'POST', body: JSON.stringify({ channel }) }); setSendFor(null); load(); flash(`ההזמנה נשלחה ב-${channel} ✓`); };

  return (
    <div className="animate-fade-in">
      {toast && <Toast msg={toast} />}
      <PageHeader title="יומן פגישות" subtitle="קביעת פגישות בסגנון Google · שליחה ללקוח · מסונכרן ל-CRM" actions={<button onClick={() => setEditing({ id: '', title: '', type: 'פגישה', date: todayIso, time: '12:00', durationMin: 60 })} className="btn-primary"><Plus className="h-4 w-4" /> פגישה חדשה</button>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-1">
              <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 hover:bg-slate-100"><ChevronRight className="h-5 w-5" /></button>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 hover:bg-slate-100"><ChevronLeft className="h-5 w-5" /></button>
            </div>
            <div className="text-lg font-bold text-ink">{MONTHS[month]} {year}</div>
            <button onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }} className="btn-outline !py-1.5 !text-xs">היום</button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold text-ink-faint">
            {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const key = d ? iso(d) : `b${i}`;
              const list = d ? byDate[iso(d)] ?? [] : [];
              const isToday = d && iso(d) === todayIso;
              return (
                <div key={key} onClick={() => d && setEditing({ id: '', title: '', type: 'פגישה', date: iso(d), time: '12:00', durationMin: 60 })}
                  className={`min-h-[92px] cursor-pointer border-b border-l border-slate-100 p-1.5 transition hover:bg-brand-50/40 ${!d ? 'bg-slate-50/40' : ''}`}>
                  {d && <div className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday ? 'bg-brand-600 font-bold text-white' : 'text-ink-soft'}`}>{d.getDate()}</div>}
                  <div className="space-y-1">
                    {list.slice(0, 3).map((a) => (
                      <div key={a.id} onClick={(e) => { e.stopPropagation(); setEditing(a); }} className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: TYPE_TONE[a.type]?.color ?? '#6366f1' }}>
                        {a.time} {a.title}
                      </div>
                    ))}
                    {list.length > 3 && <div className="px-1 text-[10px] text-ink-faint">+{list.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="פגישות קרובות" />
          <div className="divide-y divide-slate-50">
            {upcoming.map((a) => (
              <div key={a.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2"><span className="mt-0.5 h-2.5 w-2.5 rounded-full" style={{ background: TYPE_TONE[a.type]?.color }} /><div><div className="text-sm font-medium text-ink">{a.title || a.type}</div><div className="text-[11px] text-ink-faint">{new Date(a.date).toLocaleDateString('he-IL')} · {a.time} · {a.customerName ?? ''}</div></div></div>
                  <Badge tone={TYPE_TONE[a.type]?.tone}>{a.type}</Badge>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setSendFor(a)} className="btn-outline flex-1 !py-1.5 !text-xs">{a.channelSent ? <><Check className="h-3.5 w-3.5" /> נשלח</> : <><Send className="h-3.5 w-3.5" /> שלח ללקוח</>}</button>
                  <button onClick={() => remove(a.id)} className="rounded-lg p-1.5 text-ink-faint hover:bg-rose-50 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && <div className="p-6 text-center text-sm text-ink-faint">אין פגישות קרובות</div>}
          </div>
        </Card>
      </div>

      {editing && <ApptModal appt={editing} customers={customers} onClose={() => setEditing(null)} onSave={save} onDelete={editing.id ? () => { remove(editing.id); setEditing(null); } : undefined} />}
      {sendFor && <SendModal appt={sendFor} onClose={() => setSendFor(null)} onSend={send} />}
    </div>
  );
}

function ApptModal({ appt, customers, onClose, onSave, onDelete }: { appt: Appt; customers: Customer[]; onClose: () => void; onSave: (a: Appt) => void; onDelete?: () => void }) {
  const [a, setA] = useState<Appt>({ ...appt });
  const set = (k: keyof Appt, v: any) => setA((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={appt.id ? 'עריכת פגישה' : 'פגישה חדשה'} onClose={onClose}>
      <div className="space-y-3">
        <L label="כותרת"><input className="input !py-2" value={a.title} onChange={(e) => set('title', e.target.value)} placeholder="לדוגמה: סיור באולם" /></L>
        <L label="לקוח (חיפוש לפי שם או טלפון)"><CustCombo customers={customers} value={a} onPick={(c) => setA((p) => ({ ...p, customerId: c.id, customerName: c.name, customerPhone: c.phone }))} onClear={() => setA((p) => ({ ...p, customerId: undefined, customerName: undefined, customerPhone: undefined }))} /></L>
        <div className="grid grid-cols-2 gap-3">
          <L label="סוג"><select className="input !py-2" value={a.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></L>
          <L label="טלפון לקוח"><input className="input !py-2" value={a.customerPhone ?? ''} onChange={(e) => set('customerPhone', e.target.value)} placeholder="050-…" /></L>
          <L label="תאריך"><input type="date" className="input !py-2" value={a.date} onChange={(e) => set('date', e.target.value)} /></L>
          <L label="שעה"><input type="time" className="input !py-2" value={a.time} onChange={(e) => set('time', e.target.value)} /></L>
          <L label="משך (דק׳)"><input type="number" className="input !py-2" value={a.durationMin} onChange={(e) => set('durationMin', +e.target.value)} /></L>
        </div>
        <L label="הערות / סיכום"><textarea rows={2} className="input" value={a.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></L>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onSave(a)} disabled={!a.title} className="btn-primary flex-1">שמור פגישה</button>
        {onDelete && <button onClick={onDelete} className="btn !py-2 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>}
      </div>
    </Modal>
  );
}

function CustCombo({ customers, value, onPick, onClear }: { customers: Customer[]; value: Appt; onPick: (c: Customer) => void; onClear: () => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  if (value.customerId) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <span className="text-ink"><b>{value.customerName}</b> · {value.customerPhone}</span>
        <button onClick={onClear} className="text-emerald-700 hover:text-rose-500"><X className="h-4 w-4" /></button>
      </div>
    );
  }
  const matches = q.trim() ? customers.filter((c) => c.name.includes(q) || (c.phone || '').replace(/-/g, '').includes(q.replace(/-/g, ''))).slice(0, 6) : customers.slice(0, 6);
  return (
    <div className="relative">
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="הקלד שם או טלפון…" className="input !py-2" />
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
            {matches.map((c) => (
              <button key={c.id} onClick={() => { onPick(c); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-right text-sm hover:bg-brand-50">
                <span className="font-medium text-ink">{c.name}{c.partner ? ` & ${c.partner}` : ''}</span>
                <span className="text-[11px] text-ink-faint">{c.phone}</span>
              </button>
            ))}
            {matches.length === 0 && <div className="px-3 py-2 text-xs text-ink-faint">לא נמצא לקוח</div>}
          </div>
        </>
      )}
    </div>
  );
}

function SendModal({ appt, onClose, onSend }: { appt: Appt; onClose: () => void; onSend: (c: string) => void }) {
  return (
    <Modal title="שליחת הזמנה לפגישה" onClose={onClose}>
      <p className="mb-3 text-sm text-ink-muted">שלח ל{appt.customerName ?? 'לקוח'} הזמנה ל"{appt.title}" ({new Date(appt.date).toLocaleDateString('he-IL')} {appt.time}):</p>
      <div className="space-y-2">
        {[{ id: 'WhatsApp', Icon: MessageCircle, c: 'text-emerald-600' }, { id: 'SMS', Icon: Phone, c: 'text-violet-600' }].map((ch) => (
          <button key={ch.id} onClick={() => onSend(ch.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-right transition hover:bg-slate-50">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${ch.c}`}><ch.Icon className="h-5 w-5" /></span>
            <div className="flex-1 font-semibold text-ink">{ch.id}</div><Send className="h-4 w-4 text-ink-faint" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>{children}</label>; }
function Toast({ msg }: { msg: string }) { return <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-fade-in">{msg}</div>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">{title}</h3><button onClick={onClose} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>{children}</div></div>;
}
