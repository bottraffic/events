'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { PageHeader, Card, Badge, Avatar, Segmented, StatCard } from '@/components/ui';

interface EventRow {
  id: string; type: string; eventDate: string; guestsCount: number; status: string; totalPrice?: number; hall?: string;
  customer?: { name: string; partnerName?: string };
}

const STATUS: Record<string, { label: string; tone: any }> = {
  INQUIRY: { label: 'פנייה', tone: 'slate' },
  OPTION: { label: 'אופציה', tone: 'amber' },
  BOOKED: { label: 'סגור', tone: 'emerald' },
  COMPLETED: { label: 'הסתיים', tone: 'sky' },
  CANCELLED: { label: 'בוטל', tone: 'rose' },
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [view, setView] = useState('table');
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: '', partnerName: '', type: 'חתונה', eventDate: '', guestsCount: 0, hall: 'אולם הדר', status: 'INQUIRY', totalPrice: 0 });
  const load = () => api<EventRow[]>('/events').then(setEvents).catch(() => {});
  useEffect(() => { load(); }, []);
  useSync(load);

  const create = async () => {
    if (!f.name.trim() || !f.eventDate) return;
    await api('/events', { method: 'POST', body: JSON.stringify({ type: f.type, eventDate: f.eventDate, guestsCount: f.guestsCount, hall: f.hall, status: f.status, totalPrice: f.totalPrice, customer: { name: f.name, partnerName: f.partnerName } }) });
    setF({ name: '', partnerName: '', type: 'חתונה', eventDate: '', guestsCount: 0, hall: 'אולם הדר', status: 'INQUIRY', totalPrice: 0 }); setCreating(false); load();
  };

  const booked = events.filter((e) => e.status === 'BOOKED').length;
  const revenue = events.filter((e) => ['BOOKED', 'COMPLETED'].includes(e.status)).reduce((a, e) => a + (e.totalPrice ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="אירועים"
        subtitle={`${events.length} אירועים במערכת`}
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: 'table', label: 'טבלה' }, { value: 'calendar', label: 'לוח שנה' }]} />
            <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="h-4 w-4" /> אירוע חדש</button>
          </>
        }
      />

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setCreating(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">אירוע חדש</h3><button onClick={() => setCreating(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <In label="שם לקוח" v={f.name} on={(v) => setF({ ...f, name: v })} />
              <In label="בן/בת זוג" v={f.partnerName} on={(v) => setF({ ...f, partnerName: v })} />
              <In label="סוג אירוע" v={f.type} on={(v) => setF({ ...f, type: v })} />
              <In label="תאריך" type="date" v={f.eventDate} on={(v) => setF({ ...f, eventDate: v })} />
              <In label="מוזמנים" type="number" v={String(f.guestsCount)} on={(v) => setF({ ...f, guestsCount: +v })} />
              <In label="אולם" v={f.hall} on={(v) => setF({ ...f, hall: v })} />
              <In label="סכום ₪" type="number" v={String(f.totalPrice)} on={(v) => setF({ ...f, totalPrice: +v })} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">סטטוס</span><select className="input !py-2" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
            </div>
            <button onClick={create} className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> צור אירוע</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סה״כ אירועים" value={events.length} icon="📅" tone="brand" />
        <StatCard label="סגורים" value={booked} icon="✅" tone="emerald" />
        <StatCard label="הכנסה" value={`₪${revenue.toLocaleString()}`} icon="💰" tone="amber" />
        <StatCard label="קרובים" value={events.filter((e) => new Date(e.eventDate) >= new Date()).length} icon="⏰" tone="sky" />
      </div>

      {view === 'table' ? (
        <Card>
          <table className="w-full text-right text-sm">
            <thead className="border-b border-slate-100 text-ink-faint">
              <tr>{['לקוח', 'סוג', 'אולם', 'תאריך', 'מוזמנים', 'סכום', 'סטטוס'].map((h) => <th key={h} className="p-4 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const st = STATUS[ev.status] ?? STATUS.INQUIRY;
                return (
                  <tr key={ev.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={ev.customer?.name ?? '?'} size={32} />
                        <span className="font-semibold text-ink">{ev.customer?.name}{ev.customer?.partnerName ? ` & ${ev.customer.partnerName}` : ''}</span>
                      </div>
                    </td>
                    <td className="p-4 text-ink-muted">{ev.type}</td>
                    <td className="p-4 text-ink-muted">{ev.hall ?? '—'}</td>
                    <td className="p-4 text-ink-muted">{new Date(ev.eventDate).toLocaleDateString('he-IL')}</td>
                    <td className="p-4 text-ink-muted">{ev.guestsCount}</td>
                    <td className="p-4 font-medium text-ink-soft">{ev.totalPrice ? `₪${Number(ev.totalPrice).toLocaleString()}` : '—'}</td>
                    <td className="p-4"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}

function In({ label, v, on, type = 'text' }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span><input type={type} className="input !py-2" value={v} onChange={(e) => on(e.target.value)} /></label>;
}

function CalendarView({ events }: { events: EventRow[] }) {
  const byDate = new Map(events.map((e) => [new Date(e.eventDate).getDate(), e]));
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // offset start
  return (
    <Card className="p-5">
      <div className="mb-3 text-center font-semibold text-ink">יולי 2026</div>
      <div className="grid grid-cols-7 gap-2">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((d) => <div key={d} className="pb-1 text-center text-xs font-medium text-ink-faint">{d}</div>)}
        {days.map((d, i) => {
          const ev = d > 0 && d <= 31 ? byDate.get(d) : undefined;
          return (
            <div key={i} className={`min-h-[64px] rounded-xl border p-1.5 text-xs ${d > 0 && d <= 31 ? 'border-slate-200 bg-white' : 'border-transparent'}`}>
              {d > 0 && d <= 31 && <div className="text-ink-faint">{d}</div>}
              {ev && <div className="mt-1 rounded-lg bg-brand-50 px-1.5 py-1 font-medium text-brand-700">{ev.customer?.name} · {ev.guestsCount}</div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
