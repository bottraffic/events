'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FileText, Plus, X, Send, Trash2, Ban, RotateCcw, Search, DollarSign, Receipt, FileCheck,
  Check, Link2, Plug, MessageCircle, Phone, Mail,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { DOC_TYPES, VAT_RATE, BILLING_PROVIDERS } from '@/lib/mock';
import { PageHeader, Card, CardHeader, Badge, Avatar, StatCard, Segmented } from '@/components/ui';

interface Item { desc: string; qty: number; price: number; }
interface Doc { id: string; number: string; type: string; customerId?: string; customerName: string; date: string; items: Item[]; subtotal: number; vat: number; total: number; status: string; provider?: string; sentChannel?: string; }
interface Customer { id: string; name: string; partner: string; phone: string; email: string; }
const DST: Record<string, { label: string; tone: any }> = { ISSUED: { label: 'הונפק', tone: 'emerald' }, DRAFT: { label: 'טיוטה', tone: 'slate' }, CANCELLED: { label: 'מבוטל', tone: 'rose' } };
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '—');
const blankDoc = (type = 'INVOICE_RECEIPT'): Doc => ({ id: '', number: '', type, customerName: '', date: '', items: [{ desc: '', qty: 1, price: 0 }], subtotal: 0, vat: 0, total: 0, status: 'DRAFT' });

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [billing, setBilling] = useState<any>({ provider: 'manual', connected: false });
  const [tab, setTab] = useState('docs');
  const [filter, setFilter] = useState('ALL');
  const [editing, setEditing] = useState<Doc | null>(null);
  const [sendFor, setSendFor] = useState<Doc | null>(null);
  const [toast, setToast] = useState('');

  const load = () => api<Doc[]>('/documents').then(setDocs).catch(() => {});
  useEffect(() => { load(); api<Customer[]>('/customers').then(setCustomers).catch(() => {}); api('/billing-settings').then(setBilling).catch(() => {}); }, []);
  useSync(load);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const issue = async (d: Doc) => { const saved = await api<Doc>('/documents', { method: 'POST', body: JSON.stringify(d) }); setEditing(null); load(); flash(`${DOC_TYPES[d.type]?.label} ${saved.number} הונפק ✓`); setSendFor(saved); };
  const cancel = async (d: Doc) => { if (!confirm(`לבטל את ${d.number}?`)) return; await api(`/documents/${d.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }) }); load(); flash('המסמך בוטל'); };
  const credit = async (d: Doc) => { if (!confirm(`להנפיק חשבונית זיכוי עבור ${d.number}?`)) return; await api('/documents', { method: 'POST', body: JSON.stringify({ type: 'CREDIT', customerId: d.customerId, customerName: d.customerName, items: d.items.map((i) => ({ ...i, price: -Math.abs(i.price) })) }) }); load(); flash('חשבונית זיכוי הונפקה ✓'); };
  const send = async (channel: string) => { if (!sendFor) return; await api(`/documents/${sendFor.id}/send`, { method: 'POST', body: JSON.stringify({ channel }) }); setSendFor(null); load(); flash(`המסמך נשלח ב-${channel} ✓`); };
  const saveBilling = async (patch: any) => { const s = await api('/billing-settings', { method: 'POST', body: JSON.stringify(patch) }); setBilling(s); flash('הגדרות החיוב נשמרו ✓'); };

  const shown = useMemo(() => (filter === 'ALL' ? docs : docs.filter((d) => d.type === filter)), [docs, filter]);
  const issued = docs.filter((d) => d.status === 'ISSUED');
  const totalRev = issued.reduce((a, d) => a + d.total, 0);
  const totalVat = issued.reduce((a, d) => a + d.vat, 0);

  return (
    <div className="animate-fade-in">
      {toast && <Toast msg={toast} />}
      <PageHeader title="הנפקת מסמכים" subtitle="חשבוניות · קבלות · חשבונית עסקה · זיכוי · חיבור לחשבשבת / iCount"
        actions={<>
          <Segmented value={tab} onChange={setTab} options={[{ value: 'docs', label: 'מסמכים' }, { value: 'integrations', label: 'חיבור והנפקה' }]} />
          {tab === 'docs' && <button onClick={() => setEditing(blankDoc())} className="btn-primary"><Plus className="h-4 w-4" /> הנפק מסמך</button>}
        </>} />

      {tab === 'docs' ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="מסמכים שהונפקו" value={issued.length} icon={<FileCheck className="h-5 w-5" />} tone="brand" />
            <StatCard label="סך הכנסות (כולל מע״מ)" value={`₪${totalRev.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} tone="emerald" />
            <StatCard label="מע״מ שנגבה" value={`₪${totalVat.toLocaleString()}`} icon={<Receipt className="h-5 w-5" />} tone="amber" />
            <StatCard label="ספק פעיל" value={BILLING_PROVIDERS.find((p) => p.id === billing.provider)?.name?.split(' ')[0] ?? '—'} icon={<Plug className="h-5 w-5" />} tone="sky" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">סוג:</span>
            <button onClick={() => setFilter('ALL')} className={`chip ${filter === 'ALL' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>הכל</button>
            {Object.entries(DOC_TYPES).map(([k, v]) => <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>{v.label}</button>)}
          </div>

          <Card className="overflow-x-auto">
            <CardHeader title={`מסמכים (${shown.length})`} />
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-100 text-ink-faint"><tr>{['מספר', 'סוג', 'לקוח', 'תאריך', 'סכום', 'סטטוס', 'פעולות'].map((h) => <th key={h} className="whitespace-nowrap p-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="p-3 font-mono text-xs font-medium text-ink">{d.number}</td>
                    <td className="p-3"><Badge tone="violet">{DOC_TYPES[d.type]?.label ?? d.type}</Badge></td>
                    <td className="p-3"><div className="flex items-center gap-2"><Avatar name={d.customerName} size={26} /><span className="text-ink-soft">{d.customerName}</span></div></td>
                    <td className="p-3 whitespace-nowrap text-ink-muted">{fmt(d.date)}</td>
                    <td className="p-3 font-semibold text-ink">₪{d.total.toLocaleString()}</td>
                    <td className="p-3"><Badge tone={DST[d.status]?.tone} dot>{DST[d.status]?.label}</Badge></td>
                    <td className="p-3"><div className="flex gap-1">
                      <button onClick={() => setSendFor(d)} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100 hover:text-brand-600" title="שלח ללקוח"><Send className="h-4 w-4" /></button>
                      {d.status === 'ISSUED' && (d.type === 'INVOICE' || d.type === 'INVOICE_RECEIPT') && <button onClick={() => credit(d)} className="rounded-lg p-1.5 text-ink-faint hover:bg-amber-50 hover:text-amber-600" title="חשבונית זיכוי"><RotateCcw className="h-4 w-4" /></button>}
                      {d.status !== 'CANCELLED' && <button onClick={() => cancel(d)} className="rounded-lg p-1.5 text-ink-faint hover:bg-rose-50 hover:text-rose-600" title="בטל"><Ban className="h-4 w-4" /></button>}
                    </div></td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-ink-faint">אין מסמכים — לחץ "הנפק מסמך"</td></tr>}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        <Integrations billing={billing} onSave={saveBilling} />
      )}

      {editing && <DocEditor doc={editing} customers={customers} onClose={() => setEditing(null)} onIssue={issue} />}
      {sendFor && <SendModal doc={sendFor} onClose={() => setSendFor(null)} onSend={send} />}
    </div>
  );
}

function DocEditor({ doc, customers, onClose, onIssue }: { doc: Doc; customers: Customer[]; onClose: () => void; onIssue: (d: Doc) => void }) {
  const [d, setD] = useState<Doc>({ ...doc });
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const subtotal = d.items.reduce((a, it) => a + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const vat = d.type === 'RECEIPT' ? 0 : Math.round(subtotal * VAT_RATE);
  const setItem = (i: number, patch: Partial<Item>) => setD((p) => ({ ...p, items: p.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  const matches = q.trim() ? customers.filter((c) => c.name.includes(q) || (c.phone || '').replace(/-/g, '').includes(q.replace(/-/g, ''))).slice(0, 6) : customers.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-ink">הנפקת מסמך</h3><button onClick={onClose} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">סוג מסמך</span><select className="input" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })}>{Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          <div className="relative"><span className="mb-1 block text-xs font-medium text-ink-muted">לקוח</span>
            {d.customerId ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm"><b className="text-ink">{d.customerName}</b><button onClick={() => setD({ ...d, customerId: undefined, customerName: '' })} className="text-emerald-700"><X className="h-4 w-4" /></button></div>
            ) : (<>
              <div className="relative"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" /><input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="חפש שם/טלפון…" className="input pr-9" /></div>
              {open && <><div className="fixed inset-0 z-20" onClick={() => setOpen(false)} /><div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop">{matches.map((c) => <button key={c.id} onClick={() => { setD({ ...d, customerId: c.id, customerName: c.name }); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-right text-sm hover:bg-brand-50"><span className="font-medium text-ink">{c.name}</span><span className="text-[11px] text-ink-faint">{c.phone}</span></button>)}{matches.length === 0 && <div className="px-3 py-2 text-xs text-ink-faint">לא נמצא</div>}</div></>}
            </>)}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-semibold text-ink-faint">שורות</span><button onClick={() => setD({ ...d, items: [...d.items, { desc: '', qty: 1, price: 0 }] })} className="text-xs font-medium text-brand-600">+ הוסף שורה</button></div>
          <div className="space-y-2">
            {d.items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="input flex-1 !py-2" placeholder="תיאור" value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} />
                <input className="input !w-16 !py-2 text-center" type="number" placeholder="כמות" value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} />
                <input className="input !w-28 !py-2 text-center" type="number" placeholder="מחיר ₪" value={it.price} onChange={(e) => setItem(i, { price: +e.target.value })} />
                {d.items.length > 1 && <button onClick={() => setD({ ...d, items: d.items.filter((_, idx) => idx !== i) })} className="text-ink-faint hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 ms-auto w-56 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          <div className="flex justify-between text-ink-muted"><span>סכום ביניים</span><span>₪{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-ink-muted"><span>מע״מ ({Math.round(VAT_RATE * 100)}%)</span><span>₪{vat.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-bold text-ink"><span>סה״כ</span><span>₪{(subtotal + vat).toLocaleString()}</span></div>
        </div>

        <button onClick={() => onIssue(d)} disabled={!d.customerName.trim() || subtotal === 0} className="btn-primary mt-4 w-full disabled:opacity-50"><FileCheck className="h-4 w-4" /> הנפק {DOC_TYPES[d.type]?.label}</button>
      </div>
    </div>
  );
}

function Integrations({ billing, onSave }: { billing: any; onSave: (p: any) => void }) {
  const [key, setKey] = useState(billing.apiKey ?? '');
  const [companyId, setCompanyId] = useState(billing.companyId ?? '');
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="ספק הנפקה" subtitle="בחר מול מי לעבוד — המסמכים יונפקו דרך הספק" />
        <div className="space-y-2 p-4">
          {BILLING_PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => onSave({ provider: p.id, connected: !p.needsKey })} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${billing.provider === p.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className="text-2xl">{p.logo}</span>
              <div className="flex-1"><div className="font-semibold text-ink">{p.name}</div><div className="text-[11px] text-ink-faint">{p.needsKey ? 'דורש מפתח API' : 'ללא חיבור חיצוני'}</div></div>
              {billing.provider === p.id && (billing.connected ? <Badge tone="emerald" dot>מחובר</Badge> : <Badge tone="amber">נבחר</Badge>)}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="פרטי חיבור (API)" subtitle="הזן מפתח כדי להתחבר לספק" />
        <div className="space-y-3 p-4">
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">מפתח API / טוקן</span><input className="input font-mono" placeholder="••••••••••••" value={key} onChange={(e) => setKey(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">מזהה חברה / Company ID</span><input className="input" placeholder="לדוגמה: 123456" value={companyId} onChange={(e) => setCompanyId(e.target.value)} /></label>
          <button onClick={() => onSave({ apiKey: key, companyId, connected: true })} className="btn-primary w-full"><Link2 className="h-4 w-4" /> התחבר ושמור</button>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-ink-muted"><Check className="h-4 w-4 text-emerald-500" /> כשמחוברים, כל הנפקה נשלחת אוטומטית לספק (חשבונית חוקית עם מספר רשמי).</div>
        </div>
      </Card>
    </div>
  );
}

function Toast({ msg }: { msg: string }) { return <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-fade-in">{msg}</div>; }
function SendModal({ doc, onClose, onSend }: { doc: Doc; onClose: () => void; onSend: (c: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 font-semibold text-ink">שליחת מסמך ללקוח</h3>
        <p className="mb-3 text-sm text-ink-muted">{DOC_TYPES[doc.type]?.label} {doc.number} · {doc.customerName} · ₪{doc.total.toLocaleString()}</p>
        <div className="space-y-2">
          {[{ id: 'WhatsApp', Icon: MessageCircle, c: 'text-emerald-600' }, { id: 'SMS', Icon: Phone, c: 'text-violet-600' }, { id: 'Email', Icon: Mail, c: 'text-sky-600' }].map((ch) => (
            <button key={ch.id} onClick={() => onSend(ch.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-right transition hover:bg-slate-50">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${ch.c}`}><ch.Icon className="h-5 w-5" /></span>
              <div className="flex-1 font-semibold text-ink">שלח ב-{ch.id}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
