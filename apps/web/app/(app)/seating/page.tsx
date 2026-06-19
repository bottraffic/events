'use client';

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Download, Calendar, Users, MapPin, Save, Plus, Minus, Copy, Trash2, Circle, Square, RectangleHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Card, Badge, Avatar } from '@/components/ui';

interface Cust { id: string; name: string; partner: string; eventType: string; eventDate: string; guests: number; hall: string; }
type Shape = 'round' | 'square' | 'rect';
interface Tbl { id: string; shape: Shape; x: number; y: number; w: number; h: number; seats: number; label: string; }
interface Guest { id: string; name: string; group: string; size: number; status: string }
interface Asn { guestId: string; tableId: string; count: number }

const GROUP_COLOR: Record<string, string> = { 'משפחת חתן': '#6366f1', 'משפחת כלה': '#ec4899', 'חברים': '#10b981', 'עבודה': '#f59e0b' };
const DEFAULTS: Record<Shape, { w: number; h: number; seats: number }> = { round: { w: 150, h: 150, seats: 10 }, square: { w: 120, h: 120, seats: 8 }, rect: { w: 240, h: 100, seats: 10 } };

let counter = 0;
const mkTable = (shape: Shape, x: number, y: number): Tbl => { counter++; return { id: 'T' + Date.now() + counter, shape, x, y, ...DEFAULTS[shape], label: String(counter) }; };
const INIT: Tbl[] = [
  { id: 'T1', shape: 'round', x: 120, y: 120, w: 150, h: 150, seats: 10, label: '1' },
  { id: 'T2', shape: 'round', x: 400, y: 120, w: 150, h: 150, seats: 10, label: '2' },
  { id: 'T3', shape: 'rect', x: 680, y: 110, w: 240, h: 100, seats: 10, label: '3' },
  { id: 'T4', shape: 'round', x: 120, y: 420, w: 150, h: 150, seats: 10, label: '4' },
  { id: 'T5', shape: 'square', x: 420, y: 430, w: 120, h: 120, seats: 8, label: '5' },
];
const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(v, mx));

export default function SeatingPage() {
  return <Suspense fallback={null}><SeatingInner /></Suspense>;
}

function SeatingInner() {
  const params = useSearchParams();
  const customerId = params.get('customer');
  const [customer, setCustomer] = useState<Cust | null>(null);
  const [hall, setHall] = useState({ w: 1800, h: 1200 });
  const [tables, setTables] = useState<Tbl[]>(INIT);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [asn, setAsn] = useState<Asn[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [canvasW, setCanvasW] = useState(820);
  const [toast, setToast] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const action = useRef<any>(null);
  const planKey = customerId || 'default';
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    Promise.all([api<Guest[]>(`/guests${customerId ? `?customer=${customerId}` : ''}`), api<any>(`/seating-plans/${planKey}`)]).then(([gs, plan]) => {
      setGuests(gs);
      if (plan) {
        if (plan.hall) setHall(plan.hall);
        const tbls = plan.tables?.length ? plan.tables : INIT;
        setTables(tbls);
        const tableIds = new Set(tbls.map((t: Tbl) => t.id));
        const guestIds = new Set(gs.map((g) => g.id));
        // normalize: ensure count exists, drop assignments to missing tables/guests
        setAsn((plan.assignments || [])
          .map((a: any) => ({ guestId: a.guestId, tableId: a.tableId, count: a.count ?? 1 }))
          .filter((a: Asn) => tableIds.has(a.tableId) && guestIds.has(a.guestId)));
      }
    }).catch(() => {});
  }, [planKey]);
  useEffect(() => { if (customerId) api<Cust>(`/customers/${customerId}`).then(setCustomer).catch(() => {}); }, [customerId]);
  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setCanvasW(el.clientWidth)); ro.observe(el); setCanvasW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const scale = canvasW / hall.w;
  const px = (cm: number) => cm * scale;
  const tableUsed = (tid: string) => asn.filter((a) => a.tableId === tid).reduce((s, a) => s + a.count, 0);
  const guestSeated = (gid: string) => asn.filter((a) => a.guestId === gid).reduce((s, a) => s + a.count, 0);
  const guestRem = (g: Guest) => g.size - guestSeated(g.id);

  // canvas drag/resize
  const onPointerDown = (e: React.PointerEvent, t: Tbl, mode: 'move' | 'resize') => {
    e.stopPropagation(); (e.target as HTMLElement).setPointerCapture(e.pointerId);
    action.current = { mode, id: t.id, sx: e.clientX, sy: e.clientY, x: t.x, y: t.y, w: t.w, h: t.h }; setSelected(t.id);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const a = action.current; if (!a) return;
    const dx = (e.clientX - a.sx) / scale, dy = (e.clientY - a.sy) / scale;
    setTables((arr) => arr.map((t) => {
      if (t.id !== a.id) return t;
      if (a.mode === 'move') return { ...t, x: clamp(a.x + dx, 0, hall.w - t.w), y: clamp(a.y + dy, 0, hall.h - t.h) };
      let w = Math.max(50, a.w + dx); let h = t.shape === 'rect' ? Math.max(50, a.h + dy) : w;
      w = Math.min(w, hall.w - t.x); h = Math.min(h, hall.h - t.y);
      return { ...t, w: Math.round(w), h: Math.round(h) };
    }));
  };
  const onPointerUp = () => { action.current = null; };

  const addTable = (shape: Shape) => { const t = mkTable(shape, hall.w / 2 - DEFAULTS[shape].w / 2, hall.h / 2 - DEFAULTS[shape].h / 2); setTables((a) => [...a, t]); setSelected(t.id); };
  const removeTable = (id: string) => { setTables((a) => a.filter((t) => t.id !== id)); setAsn((a) => a.filter((x) => x.tableId !== id)); setSelected(null); };
  const duplicate = (id: string) => { const t = tables.find((x) => x.id === id); if (!t) return; counter++; const n = { ...t, id: 'T' + Date.now() + counter, x: Math.min(t.x + 40, hall.w - t.w), y: Math.min(t.y + 40, hall.h - t.h), label: String(counter) }; setTables((a) => [...a, n]); setSelected(n.id); };
  const updateTable = (id: string, patch: Partial<Tbl>) => setTables((a) => a.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const clickTable = (t: Tbl) => {
    if (!picked) { setSelected(t.id); return; }
    const g = guests.find((x) => x.id === picked); if (!g) return;
    const free = t.seats - tableUsed(t.id);
    const rem = guestRem(g);
    const place = Math.min(free, rem);
    if (place <= 0) { flash('השולחן מלא'); return; }
    setAsn((prev) => {
      const ex = prev.find((a) => a.guestId === picked && a.tableId === t.id);
      return ex ? prev.map((a) => (a === ex ? { ...a, count: a.count + place } : a)) : [...prev, { guestId: picked, tableId: t.id, count: place }];
    });
    const left = rem - place;
    if (left > 0) flash(`שובצו ${place} מקומות · נותרו ${left} — בחר שולחן נוסף`);
    else setPicked(null);
  };

  const aiSeat = () => {
    const sorted = [...guests].sort((a, b) => a.group.localeCompare(b.group));
    const cap = tables.map((t) => ({ id: t.id, free: t.seats }));
    const res: Asn[] = [];
    for (const g of sorted) { let need = g.size; for (const c of cap) { if (need <= 0) break; if (c.free <= 0) continue; const take = Math.min(c.free, need); res.push({ guestId: g.id, tableId: c.id, count: take }); c.free -= take; need -= take; } }
    setAsn(res); flash('שובצו אוטומטית לפי קבוצות וכמות מקומות');
  };

  const savePlan = async () => {
    await api('/seating-plans', { method: 'POST', body: JSON.stringify({ key: planKey, data: { hall, tables, assignments: asn, seated: asn.reduce((s, a) => s + a.count, 0) } }) });
    flash('סידור ההושבה נשמר ✓');
  };

  const totalSeats = tables.reduce((a, t) => a + t.seats, 0);
  const seatedTotal = asn.reduce((s, a) => s + a.count, 0);
  const totalGuests = guests.reduce((s, g) => s + g.size, 0);
  const unassigned = guests.filter((g) => guestRem(g) > 0);
  const sel = tables.find((t) => t.id === selected);

  // chair colors for a table
  const chairColors = (tid: string) => {
    const out: string[] = [];
    asn.filter((a) => a.tableId === tid).forEach((a) => { const g = guests.find((x) => x.id === a.guestId); for (let i = 0; i < a.count; i++) out.push(GROUP_COLOR[g?.group ?? ''] ?? '#64748b'); });
    return out;
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-fade-in">{toast}</div>}
      {customer && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-gradient-to-l from-brand-50 to-white p-4">
          <Avatar name={customer.name} size={48} />
          <div className="flex-1">
            <div className="font-bold text-ink">תכנון הושבה עבור: {customer.name}{customer.partner ? ` & ${customer.partner}` : ''}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
              <Badge tone="violet">{customer.eventType}</Badge>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {customer.eventDate ? new Date(customer.eventDate).toLocaleDateString('he-IL') : '—'}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {customer.guests} מוזמנים</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {customer.hall}</span>
            </div>
          </div>
          <Badge tone="emerald" dot>מקושר ללקוח</Badge>
        </div>
      )}
      <PageHeader
        title="מתכנן אולם והושבה"
        subtitle={`אולם ${(hall.w / 100).toFixed(0)}×${(hall.h / 100).toFixed(0)} מ׳ · ${tables.length} שולחנות · ${seatedTotal}/${totalSeats} מקומות תפוסים`}
        actions={<>
          <button onClick={savePlan} className="btn-primary"><Save className="h-4 w-4" /> שמור סידור</button>
          <button onClick={aiSeat} className="btn-outline"><Sparkles className="h-4 w-4" /> AI הושב הכל</button>
          <button className="btn-outline"><Download className="h-4 w-4" /> ייצוא PDF</button>
        </>}
      />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <span className="px-1 text-xs font-semibold text-ink-faint">הוסף שולחן:</span>
        <button onClick={() => addTable('round')} className="btn-outline !py-2"><Circle className="h-4 w-4" /> עגול</button>
        <button onClick={() => addTable('square')} className="btn-outline !py-2"><Square className="h-4 w-4" /> ריבוע</button>
        <button onClick={() => addTable('rect')} className="btn-outline !py-2"><RectangleHorizontal className="h-4 w-4" /> מלבן</button>
        <div className="mx-2 h-6 w-px bg-slate-200" />
        <span className="px-1 text-xs font-semibold text-ink-faint">גודל אולם (מ׳):</span>
        <NumIn value={hall.w / 100} onChange={(v) => setHall((h) => ({ ...h, w: Math.max(500, v * 100) }))} />
        <span className="text-ink-faint">×</span>
        <NumIn value={hall.h / 100} onChange={(v) => setHall((h) => ({ ...h, h: Math.max(500, v * 100) }))} />
        <div className="ms-auto flex items-center gap-3 px-2 text-xs">
          <span className="text-ink-muted">מוזמנים משובצים <b className="text-ink">{seatedTotal}</b>/{totalGuests}</span>
          {Object.entries(GROUP_COLOR).map(([g, c]) => <span key={g} className="flex items-center gap-1 text-ink-muted"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{g}</span>)}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden p-0">
          <div ref={wrapRef} className="overflow-auto bg-slate-50 p-6">
            <div dir="ltr" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} onClick={() => setSelected(null)}
              className="relative mx-auto rounded-xl border-2 border-slate-300 bg-white shadow-inner"
              style={{ width: px(hall.w), height: px(hall.h), backgroundImage: 'linear-gradient(#eef1f6 1px,transparent 1px),linear-gradient(90deg,#eef1f6 1px,transparent 1px)', backgroundSize: `${px(100)}px ${px(100)}px` }}>
              <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-md bg-slate-800/90 px-3 py-1 text-[10px] font-semibold text-white">במה / רחבת ריקודים</div>
              {tables.map((t) => {
                const W = px(t.w), H = px(t.h), isSel = selected === t.id, used = tableUsed(t.id), full = used >= t.seats, colors = chairColors(t.id);
                return (
                  <div key={t.id} className="absolute" style={{ left: px(t.x), top: px(t.y), width: W, height: H }}>
                    {chairPos(t, scale).map((c, i) => (
                      <div key={i} className="absolute rounded-[3px]" style={{ left: c.left, top: c.top, width: 11, height: 11, background: colors[i] ?? '#cbd5e1' }} />
                    ))}
                    <div onPointerDown={(e) => onPointerDown(e, t, 'move')} onClick={(e) => { e.stopPropagation(); clickTable(t); }}
                      className={`flex h-full w-full cursor-move select-none flex-col items-center justify-center border-2 text-center shadow-soft transition ${t.shape === 'round' ? 'rounded-full' : 'rounded-lg'} ${isSel ? 'border-brand-500 ring-4 ring-brand-200' : full ? 'border-emerald-400' : 'border-slate-300'} bg-white`}>
                      <span className="text-xs font-bold text-ink">{t.label}</span>
                      <span className={`text-[10px] font-medium ${full ? 'text-emerald-600' : 'text-ink-faint'}`}>{used}/{t.seats}</span>
                    </div>
                    {isSel && <div onPointerDown={(e) => onPointerDown(e, t, 'resize')} className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-brand-600 shadow" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {sel ? (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">שולחן {sel.label}</h3><Badge tone="brand">{sel.shape === 'round' ? 'עגול' : sel.shape === 'square' ? 'ריבוע' : 'מלבן'}</Badge></div>
              <div className="space-y-3 text-sm">
                <Prop label="כיסאות"><Stepper value={sel.seats} onChange={(v) => updateTable(sel.id, { seats: clamp(v, 1, 30) })} /></Prop>
                <Prop label={sel.shape === 'round' ? 'קוטר (ס״מ)' : 'רוחב (ס״מ)'}><NumIn value={sel.w} onChange={(v) => updateTable(sel.id, { w: clamp(v, 50, hall.w), h: sel.shape === 'rect' ? sel.h : clamp(v, 50, hall.h) })} /></Prop>
                {sel.shape === 'rect' && <Prop label="אורך (ס״מ)"><NumIn value={sel.h} onChange={(v) => updateTable(sel.id, { h: clamp(v, 50, hall.h) })} /></Prop>}
                <Prop label="תווית"><input className="input !w-20 !py-1.5 text-center" value={sel.label} onChange={(e) => updateTable(sel.id, { label: e.target.value })} /></Prop>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => duplicate(sel.id)} className="btn-outline flex-1 !py-2"><Copy className="h-4 w-4" /> שכפל</button>
                <button onClick={() => removeTable(sel.id)} className="btn !py-2 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="mb-2 text-xs font-semibold text-ink-faint">יושבים בשולחן ({tableUsed(sel.id)}/{sel.seats})</div>
                <div className="space-y-1.5">
                  {asn.filter((a) => a.tableId === sel.id).map((a) => {
                    const g = guests.find((x) => x.id === a.guestId);
                    return (
                      <div key={a.guestId} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLOR[g?.group ?? ''] }} />{g?.name} <span className="text-xs text-ink-faint">×{a.count}</span></span>
                        <button onClick={() => setAsn((p) => p.filter((x) => !(x.guestId === a.guestId && x.tableId === sel.id)))} className="text-ink-faint hover:text-rose-500">✕</button>
                      </div>
                    );
                  })}
                  {tableUsed(sel.id) === 0 && <div className="text-xs text-ink-faint">בחר אורח מהרשימה ולחץ על השולחן</div>}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-sm text-ink-muted">
              <div className="mb-1 font-semibold text-ink">איך זה עובד</div>
              <ul className="list-inside list-disc space-y-1 text-xs text-ink-faint">
                <li>כל אורח תופס מקומות לפי כמות שאישר</li>
                <li>בחר אורח → לחץ על שולחן; אם אין מספיק מקום, השאר ישובצו לשולחן אחר</li>
                <li>גרור שולחנות, שנה גודל בס״מ וכמות כיסאות</li>
              </ul>
            </Card>
          )}

          <Card className="flex max-h-[440px] flex-col p-0">
            <div className="border-b border-slate-100 p-3"><div className="font-semibold text-ink">אורחים לשיבוץ</div><div className="text-xs text-ink-faint">{unassigned.length} קבוצות · {totalGuests - seatedTotal} מקומות נותרו</div></div>
            <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
              {unassigned.map((g) => {
                const rem = guestRem(g);
                return (
                  <button key={g.id} onClick={() => setPicked(picked === g.id ? null : g.id)} className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-right transition ${picked === g.id ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLOR[g.group] ?? '#94a3b8' }} /><span><span className="text-sm font-medium text-ink">{g.name}</span><span className="block text-[10px] text-ink-faint">{g.group} · {rem}/{g.size} לשיבוץ</span></span></span>
                    <Badge tone={g.status === 'YES' ? 'emerald' : g.status === 'MAYBE' ? 'amber' : g.status === 'NO' ? 'rose' : 'slate'}>{g.status === 'YES' ? 'אישר' : g.status === 'MAYBE' ? 'אולי' : g.status === 'NO' ? 'לא' : 'ממתין'}</Badge>
                  </button>
                );
              })}
              {unassigned.length === 0 && <div className="py-8 text-center text-sm text-ink-faint">כל המוזמנים שובצו 🎉</div>}
            </div>
            {picked && <div className="border-t border-slate-100 bg-brand-50 p-2 text-center text-xs font-medium text-brand-700">לחץ על שולחן לשיבוץ {guestRem(guests.find((g) => g.id === picked)!)} מקומות</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function chairPos(t: Tbl, scale: number) {
  const W = t.w * scale, H = t.h * scale, cs = 11, gap = 6;
  const pts: { left: number; top: number }[] = [];
  if (t.shape === 'round') {
    const r = W / 2 + gap;
    for (let i = 0; i < t.seats; i++) { const a = (i / t.seats) * 2 * Math.PI - Math.PI / 2; pts.push({ left: W / 2 + r * Math.cos(a) - cs / 2, top: H / 2 + r * Math.sin(a) - cs / 2 }); }
  } else {
    const top = Math.ceil(t.seats / 2), bottom = t.seats - top;
    for (let i = 0; i < top; i++) pts.push({ left: ((i + 1) / (top + 1)) * W - cs / 2, top: -cs - 2 });
    for (let i = 0; i < bottom; i++) pts.push({ left: ((i + 1) / (bottom + 1)) * W - cs / 2, top: H + 2 });
  }
  return pts;
}
function NumIn({ value, onChange }: { value: number; onChange: (v: number) => void }) { return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="input !w-20 !py-1.5 text-center" />; }
function Prop({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex items-center justify-between"><span className="text-ink-muted">{label}</span>{children}</div>; }
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <div className="flex items-center gap-2"><button onClick={() => onChange(value - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-ink-soft hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button><span className="w-6 text-center font-semibold text-ink">{value}</span><button onClick={() => onChange(value + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-ink-soft hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button></div>;
}
