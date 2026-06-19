'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText, FileCheck, Clock, DollarSign, Plus, Pencil, Send, Save, ArrowRight,
  Mail, MessageCircle, Phone, Link2, Check, Copy, Search, UserPlus, X, LayoutTemplate, BookmarkPlus,
  Printer, ShieldCheck, Trash2, Ban,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSync } from '@/lib/sync';
import { CONTRACT_VARS, CONTRACT_TEMPLATE_HTML } from '@/lib/mock';
import { PageHeader, Card, CardHeader, Badge, Avatar, StatCard, Segmented } from '@/components/ui';
import { RichEditor, renderMerged } from '@/components/rich-editor';

interface Customer { id: string; name: string; partner: string; phone: string; email: string; eventType: string; eventDate: string; guests: number; hall: string; value: number; deposit: number; }
interface Template { id: string; name: string; eventType: string; bodyHtml: string; }
interface Contract {
  id: string; title: string; customerId?: string; customerName: string; partnerName: string; eventType: string;
  eventDate: string; guests: number; hall: string; phone: string; email: string; amount: number; deposit: number;
  bodyHtml: string; status: 'DRAFT' | 'SENT' | 'SIGNED' | 'CANCELLED'; sentChannel?: string; signature?: string | null; signedAt?: string;
  ip?: string; device?: string; userAgent?: string;
}
const ST: Record<string, { label: string; tone: any }> = { DRAFT: { label: 'טיוטה', tone: 'slate' }, SENT: { label: 'נשלח לחתימה', tone: 'amber' }, SIGNED: { label: 'נחתם', tone: 'emerald' }, CANCELLED: { label: 'מבוטל', tone: 'rose' } };
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '—');
const blank = (): Contract => ({ id: '', title: 'הסכם אירוע', customerName: '', partnerName: '', eventType: 'חתונה', eventDate: '', guests: 0, hall: '', phone: '', email: '', amount: 0, deposit: 0, bodyHtml: CONTRACT_TEMPLATE_HTML, status: 'DRAFT', signature: null });

export default function ContractsPage() {
  return <Suspense fallback={null}><ContractsInner /></Suspense>;
}

function ContractsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [draft, setDraft] = useState<Contract>(blank());
  const [picking, setPicking] = useState(false);
  const [sendFor, setSendFor] = useState<Contract | null>(null);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'contracts' | 'templates'>('contracts');
  const [tplDraft, setTplDraft] = useState<Template | null>(null);

  const load = () => api<Contract[]>('/contracts').then(setContracts).catch(() => {});
  useEffect(() => {
    load();
    Promise.all([api<Customer[]>('/customers'), api<Template[]>('/contract-templates')]).then(([cu, t]) => {
      setCustomers(cu); setTemplates(t);
      // deep-link handling from the customer card
      const edit = params.get('edit'); const isNew = params.get('new'); const cid = params.get('customer');
      if (edit) api<Contract>(`/contracts/${edit}`).then((c) => { if (c) { setDraft(c); setView('editor'); } });
      else if (isNew) { const d = blank(); setDraft(linkInto(d, cu.find((x) => x.id === cid))); setView('editor'); }
      if (edit || isNew) router.replace('/contracts');
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live sync — updates instantly when the client signs (no refresh needed).
  useSync(() => {
    load();
    if (view === 'editor' && draft.id) {
      api<Contract>(`/contracts/${draft.id}`).then((c) => {
        if (c && c.status === 'SIGNED' && draft.status !== 'SIGNED') {
          setDraft((d) => ({ ...d, status: 'SIGNED', signature: c.signature, signedAt: c.signedAt, ip: c.ip, device: c.device, userAgent: c.userAgent }));
          flash('הלקוח חתם על ההסכם! ✓');
        }
      });
    }
  });

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };
  const md = (d: Contract): Record<string, string> => ({
    'לקוח': d.customerName || '—', 'בן_זוג': d.partnerName || '', 'תאריך': fmt(d.eventDate), 'סוג': d.eventType || '—',
    'מוזמנים': String(d.guests || '—'), 'אולם': d.hall || '—', 'סכום': (d.amount || 0).toLocaleString(),
    'מקדמה': (d.deposit || 0).toLocaleString(), 'יתרה': ((d.amount || 0) - (d.deposit || 0)).toLocaleString(),
  });
  const linkInto = (d: Contract, c?: Customer): Contract => c
    ? { ...d, customerId: c.id, customerName: c.name, partnerName: c.partner, eventType: c.eventType, eventDate: c.eventDate, guests: c.guests, hall: c.hall, phone: c.phone, email: c.email, amount: c.value, deposit: c.deposit, title: d.title.includes('—') ? d.title : `${d.title} — ${c.name}${c.partner ? ` & ${c.partner}` : ''}` }
    : { ...d, customerId: undefined };

  const startFromTemplate = (t?: Template) => {
    const d = blank();
    if (t) { d.bodyHtml = t.bodyHtml; d.eventType = t.eventType; d.title = `הסכם ${t.name}`; }
    setDraft(d); setPicking(false); setView('editor');
  };
  const save = async () => { const s = await api<Contract>('/contracts', { method: 'POST', body: JSON.stringify(draft) }); setDraft(s); load(); flash('ההסכם נשמר ✓'); return s; };
  const reloadTpls = () => api<Template[]>('/contract-templates').then(setTemplates);
  const saveAsTemplate = async () => { const name = prompt('שם התבנית:', draft.eventType || 'תבנית'); if (!name) return; await api('/contract-templates', { method: 'POST', body: JSON.stringify({ name, eventType: draft.eventType, bodyHtml: draft.bodyHtml }) }); reloadTpls(); flash('נשמר כתבנית ✓'); };
  const deleteTemplate = async (id: string) => { await api(`/contract-templates/${id}`, { method: 'DELETE' }); reloadTpls(); flash('התבנית נמחקה'); };
  const newTpl = () => setTplDraft({ id: '', name: '', eventType: 'חתונה', bodyHtml: CONTRACT_TEMPLATE_HTML });
  const saveTpl = async () => { if (!tplDraft?.name.trim()) { flash('יש להזין שם לתבנית'); return; } if (tplDraft.id) await api(`/contract-templates/${tplDraft.id}`, { method: 'PATCH', body: JSON.stringify(tplDraft) }); else await api('/contract-templates', { method: 'POST', body: JSON.stringify(tplDraft) }); setTplDraft(null); reloadTpls(); flash('התבנית נשמרה ✓'); };
  const send = async (channel: string) => { if (!sendFor) return; await api(`/contracts/${sendFor.id}/send`, { method: 'POST', body: JSON.stringify({ channel }) }); setSendFor(null); load(); flash(`ההסכם נשלח ל${sendFor.customerName} ב-${channel} ✓`); };
  const deleteContract = async (c: Contract) => { if (!confirm(`למחוק את הטיוטה "${c.title}"?`)) return; await api(`/contracts/${c.id}`, { method: 'DELETE' }); load(); flash('הטיוטה נמחקה'); };
  const cancelContract = async (c: Contract) => { if (!confirm(`לבטל את ההסכם "${c.title}"?`)) return; await api(`/contracts/${c.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED' }) }); load(); flash('ההסכם בוטל'); };
  const createCustomer = async (data: Partial<Customer>) => { const c = await api<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }); setCustomers((p) => [c, ...p]); setDraft((d) => linkInto(d, c)); flash('לקוח חדש נוצר וקושר ✓'); };

  /* ---------- TEMPLATE EDITOR ---------- */
  if (tplDraft) {
    return (
      <div className="flex flex-col animate-fade-in lg:h-[calc(100vh-3rem)]">
        {toast && <Toast msg={toast} />}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-ink">{tplDraft.id ? 'עריכת תבנית' : 'תבנית חדשה'}</h1><p className="text-sm text-ink-muted">תבנית קבועה לשימוש חוזר ביצירת הסכמים</p></div>
          <div className="flex items-center gap-2"><button onClick={() => setTplDraft(null)} className="btn-ghost"><ArrowRight className="h-4 w-4" /> חזרה</button><button onClick={saveTpl} className="btn-primary"><Save className="h-4 w-4" /> שמור תבנית</button></div>
        </div>
        <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
          <div className="space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pl-1">
            <Card><CardHeader title="פרטי התבנית" /><div className="grid grid-cols-2 gap-3 p-4">
              <F label="שם התבנית" v={tplDraft.name} on={(v) => setTplDraft({ ...tplDraft, name: v })} />
              <F label="סוג אירוע" v={tplDraft.eventType} on={(v) => setTplDraft({ ...tplDraft, eventType: v })} />
            </div></Card>
            <Card><CardHeader title="גוף התבנית — עורך מסמכים" subtitle="עיצוב מלא + משתנים דינמיים" /><div className="p-4">
              <RichEditor initialHtml={tplDraft.bodyHtml} variables={CONTRACT_VARS} onChange={(html) => setTplDraft((d) => (d ? { ...d, bodyHtml: html } : d))} />
            </div></Card>
          </div>
          <div className="lg:min-h-0"><Card className="flex flex-col overflow-hidden lg:h-full">
            <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-ink-soft">תצוגה מקדימה של התבנית</div>
            <div className="min-h-[55vh] flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6"><div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-5 shadow-soft sm:p-10"><div className="rt-content !min-h-0 break-words text-[14px]" dangerouslySetInnerHTML={{ __html: tplDraft.bodyHtml }} /></div></div>
          </Card></div>
        </div>
      </div>
    );
  }

  /* ---------- LIST (tabs: contracts / templates) ---------- */
  if (view === 'list') {
    const signed = contracts.filter((c) => c.status === 'SIGNED');
    const tabs = <Segmented value={tab} onChange={(v) => setTab(v as any)} options={[{ value: 'contracts', label: 'הסכמים' }, { value: 'templates', label: 'תבניות' }]} />;
    return (
      <div className="animate-fade-in">
        {toast && <Toast msg={toast} />}
        {tab === 'contracts' ? (
          <>
            <PageHeader title="הסכמים וחוזים" subtitle="ההסכמים של הלקוחות · חתימה דיגיטלית" actions={<>{tabs}<button onClick={() => setPicking(true)} className="btn-primary"><Plus className="h-4 w-4" /> הסכם חדש</button></>} />
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="סה״כ הסכמים" value={contracts.length} icon={<FileText className="h-5 w-5" />} tone="brand" />
              <StatCard label="נחתמו" value={signed.length} icon={<FileCheck className="h-5 w-5" />} tone="emerald" />
              <StatCard label="ממתינים לחתימה" value={contracts.filter((c) => c.status === 'SENT').length} icon={<Clock className="h-5 w-5" />} tone="amber" />
              <StatCard label="שווי חתום" value={`₪${signed.reduce((a, c) => a + c.amount, 0).toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} tone="sky" />
            </div>
            <Card>
              <CardHeader title="כל ההסכמים" />
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-right text-sm">
                <thead className="border-b border-slate-100 text-ink-faint"><tr>{['הסכם', 'לקוח', 'תאריך אירוע', 'סכום', 'סטטוס', 'פעולות'].map((h) => <th key={h} className="whitespace-nowrap p-3 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="p-3 font-medium text-ink">{c.title}</td>
                      <td className="p-3"><div className="flex items-center gap-2"><Avatar name={c.customerName} size={28} /><span className="whitespace-nowrap text-ink-soft">{c.customerName}</span></div></td>
                      <td className="whitespace-nowrap p-3 text-ink-muted">{fmt(c.eventDate)}</td>
                      <td className="whitespace-nowrap p-3 font-medium text-ink-soft">₪{c.amount.toLocaleString()}</td>
                      <td className="p-3"><Badge tone={ST[c.status].tone} dot>{ST[c.status].label}</Badge></td>
                      <td className="p-3"><div className="flex gap-1">
                        <button onClick={() => { setDraft(c); setView('editor'); }} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100 hover:text-brand-600" title="ערוך"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setSendFor(c)} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100 hover:text-brand-600" title="שלח"><Send className="h-4 w-4" /></button>
                        {c.status !== 'CANCELLED' && c.status !== 'SIGNED' && <button onClick={() => cancelContract(c)} className="rounded-lg p-1.5 text-ink-faint hover:bg-amber-50 hover:text-amber-600" title="בטל הסכם"><Ban className="h-4 w-4" /></button>}
                        {c.status === 'DRAFT' && <button onClick={() => deleteContract(c)} className="rounded-lg p-1.5 text-ink-faint hover:bg-rose-50 hover:text-rose-600" title="מחק טיוטה"><Trash2 className="h-4 w-4" /></button>}
                      </div></td>
                    </tr>
                  ))}
                  {contracts.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-ink-faint">אין הסכמים עדיין — לחץ "הסכם חדש" ובחר תבנית</td></tr>}
                </tbody>
              </table>
              </div>
            </Card>
          </>
        ) : (
          <>
            <PageHeader title="תבניות הסכם" subtitle="תבניות קבועות לשימוש חוזר — יצירה · עריכה · מחיקה" actions={<>{tabs}<button onClick={newTpl} className="btn-primary"><Plus className="h-4 w-4" /> תבנית חדשה</button></>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Card key={t.id} className="flex flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><LayoutTemplate className="h-5 w-5" /></span><div><div className="font-semibold text-ink">{t.name}</div><Badge tone="violet">{t.eventType}</Badge></div></div>
                  </div>
                  <div className="mb-4 max-h-24 flex-1 overflow-hidden rounded-lg bg-slate-50 p-2 text-[10px] leading-relaxed text-ink-faint" dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />
                  <div className="flex gap-2">
                    <button onClick={() => setTplDraft(t)} className="btn-outline flex-1 !py-2"><Pencil className="h-4 w-4" /> ערוך</button>
                    <button onClick={() => { if (confirm(`למחוק את התבנית "${t.name}"?`)) deleteTemplate(t.id); }} className="btn !py-2 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Card>
              ))}
              <button onClick={newTpl} className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-ink-faint transition hover:border-brand-300 hover:bg-brand-50/40"><Plus className="h-7 w-7" /><span className="text-sm font-medium">תבנית חדשה</span></button>
            </div>
          </>
        )}
        {picking && <TemplatePicker templates={templates} onPick={startFromTemplate} onClose={() => setPicking(false)} />}
        {sendFor && <SendModal contract={sendFor} onClose={() => setSendFor(null)} onSend={send} />}
      </div>
    );
  }

  /* ---------- EDITOR (50/50 full height) ---------- */
  return (
    <div className="flex flex-col animate-fade-in lg:h-[calc(100vh-3rem)]">
      {toast && <Toast msg={toast} />}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">{draft.id ? 'עריכת הסכם' : 'הסכם חדש'}</h1>
          <p className="text-sm text-ink-muted">{draft.customerName ? `לקוח: ${draft.customerName}` : 'שייך ללקוח לסנכרון אוטומטי'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { load(); setView('list'); }} className="btn-ghost"><ArrowRight className="h-4 w-4" /> חזרה</button>
          <button onClick={saveAsTemplate} className="btn-outline"><BookmarkPlus className="h-4 w-4" /> שמור כתבנית</button>
          <button onClick={save} className="btn-outline"><Save className="h-4 w-4" /> שמור</button>
          <button onClick={async () => { const s = await save(); setSendFor(s); }} className="btn-primary"><Send className="h-4 w-4" /> שלח ללקוח לחתימה</button>
        </div>
      </div>

      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        {/* edit side */}
        <div className="space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pl-1">
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><Link2 className="h-4 w-4 text-brand-600" /> שיוך ללקוח</div>
            <CustomerCombo customers={customers} draft={draft} onLink={(c) => setDraft((d) => linkInto(d, c))} onClear={() => setDraft((d) => ({ ...d, customerId: undefined }))} onCreate={createCustomer} />
          </Card>

          <Card>
            <CardHeader title="פרטי ההסכם" />
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="col-span-2"><F label="כותרת" v={draft.title} on={(v) => setDraft({ ...draft, title: v })} /></div>
              <F label="שם לקוח" v={draft.customerName} on={(v) => setDraft({ ...draft, customerName: v })} />
              <F label="בן/בת זוג" v={draft.partnerName} on={(v) => setDraft({ ...draft, partnerName: v })} />
              <F label="סוג אירוע" v={draft.eventType} on={(v) => setDraft({ ...draft, eventType: v })} />
              <F label="תאריך אירוע" type="date" v={draft.eventDate} on={(v) => setDraft({ ...draft, eventDate: v })} />
              <F label="מס׳ מוזמנים" type="number" v={String(draft.guests)} on={(v) => setDraft({ ...draft, guests: +v })} />
              <F label="אולם" v={draft.hall} on={(v) => setDraft({ ...draft, hall: v })} />
              <F label="סכום כולל ₪" type="number" v={String(draft.amount)} on={(v) => setDraft({ ...draft, amount: +v })} />
              <F label="מקדמה ₪" type="number" v={String(draft.deposit)} on={(v) => setDraft({ ...draft, deposit: +v })} />
            </div>
          </Card>

          <Card>
            <CardHeader title="גוף ההסכם — עורך מסמכים" subtitle="עיצוב מלא + משתנים דינמיים" />
            <div className="p-4"><RichEditor initialHtml={draft.bodyHtml} variables={CONTRACT_VARS} onChange={(html) => setDraft((d) => ({ ...d, bodyHtml: html }))} /></div>
          </Card>
        </div>

        {/* preview side — full height, full width */}
        <div className="lg:min-h-0">
          <Card className="flex flex-col overflow-hidden lg:h-full">
            <div className="no-print flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm">
              <span className="font-semibold text-ink-soft">תצוגה כפי שהלקוח יראה</span>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="btn-outline !py-1.5 !text-xs"><Printer className="h-3.5 w-3.5" /> הדפס</button>
                <Badge tone={ST[draft.status].tone} dot>{ST[draft.status].label}</Badge>
              </div>
            </div>
            <div className="min-h-[55vh] flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
              <div className="print-doc mx-auto w-full max-w-2xl rounded-lg bg-white p-5 shadow-soft sm:p-10">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div><div className="text-xl font-extrabold text-brand-700">SIMCHA OS</div><div className="text-[11px] text-ink-faint">אולמי דמו בע"מ · ח.פ 51-XXXXXXX</div></div>
                  <div className="text-left text-[11px] text-ink-faint">מס׳ הסכם<br />{draft.id || 'טיוטה'}</div>
                </div>
                <div className="rt-content !min-h-0 break-words text-[14px]" dangerouslySetInnerHTML={{ __html: renderMerged(draft.bodyHtml, md(draft)) }} />
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div className="text-center"><div className="mb-1 text-[11px] text-ink-faint">חתימת האולם</div><div className="h-16 border-b border-slate-300 pb-1 text-base text-ink-soft">אולמי דמו</div></div>
                  <div className="text-center"><div className="mb-1 text-[11px] text-ink-faint">חתימת הלקוח</div><div className="flex h-16 items-end justify-center border-b border-slate-300 pb-1">{draft.signature ? <img src={draft.signature} alt="חתימה" className="max-h-14" /> : <span className="text-[11px] text-slate-300">תיחתם ע"י הלקוח</span>}</div></div>
                </div>
                {draft.status === 'SIGNED' && (
                  <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
                    <div className="mb-1.5 flex items-center gap-1.5 font-semibold"><ShieldCheck className="h-3.5 w-3.5" /> תיעוד חתימה דיגיטלית (Audit Trail)</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <span>חתם/ה: <b>{draft.customerName}</b></span>
                      <span>תאריך ושעה: <b>{draft.signedAt}</b></span>
                      <span>כתובת IP: <b>{draft.ip || '—'}</b></span>
                      <span>מכשיר: <b>{draft.device || '—'}</b></span>
                      <span className="col-span-2 truncate">דפדפן: {draft.userAgent || '—'}</span>
                    </div>
                    <div className="mt-1.5 text-[10px] opacity-80">חתימה קבילה משפטית · מאומתת ומוצפנת</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {sendFor && <SendModal contract={sendFor} onClose={() => setSendFor(null)} onSend={send} />}
    </div>
  );
}

/* ---------- customer search/autocomplete with create ---------- */
function CustomerCombo({ customers, draft, onLink, onClear, onCreate }: { customers: Customer[]; draft: any; onLink: (c: Customer) => void; onClear: () => void; onCreate: (d: any) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState<null | { name: string; phone: string }>(null);
  const matches = useMemo(() => {
    const s = q.trim();
    if (!s) return customers.slice(0, 6);
    return customers.filter((c) => c.name.includes(s) || (c.partner || '').includes(s) || (c.phone || '').replace(/-/g, '').includes(s.replace(/-/g, ''))).slice(0, 8);
  }, [q, customers]);

  if (draft.customerId) {
    const c = customers.find((x) => x.id === draft.customerId);
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2.5"><Avatar name={draft.customerName} size={36} /><div><div className="text-sm font-semibold text-ink">{draft.customerName}{draft.partnerName ? ` & ${draft.partnerName}` : ''}</div><div className="text-xs text-emerald-700">{c?.phone || draft.phone} · {draft.eventType}</div></div></div>
        <button onClick={onClear} className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100" title="שנה לקוח"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="חפש לפי שם או טלפון…" className="input pr-9" />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
            {matches.map((c) => (
              <button key={c.id} onClick={() => { onLink(c); setOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-right hover:bg-brand-50">
                <Avatar name={c.name} size={30} />
                <div className="flex-1"><div className="text-sm font-medium text-ink">{c.name}{c.partner ? ` & ${c.partner}` : ''}</div><div className="text-[11px] text-ink-faint">{c.phone} · {c.eventType} · {fmt(c.eventDate)}</div></div>
              </button>
            ))}
            {matches.length === 0 && <div className="px-3 py-2 text-xs text-ink-faint">לא נמצא לקוח</div>}
            <button onClick={() => { setCreating({ name: q.replace(/\d/g, '').trim(), phone: /\d/.test(q) ? q : '' }); setOpen(false); }} className="mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-right text-sm font-medium text-brand-600 hover:bg-brand-50">
              <UserPlus className="h-4 w-4" /> צור לקוח חדש{q ? `: "${q}"` : ''}
            </button>
          </div>
        </>
      )}
      {creating && (
        <Modal title="לקוח חדש" onClose={() => setCreating(null)}>
          <div className="grid grid-cols-2 gap-3">
            <F label="שם מלא" v={creating.name} on={(v) => setCreating({ ...creating, name: v })} />
            <F label="טלפון" v={creating.phone} on={(v) => setCreating({ ...creating, phone: v })} />
          </div>
          <button onClick={() => { onCreate(creating); setCreating(null); }} disabled={!creating.name} className="btn-primary mt-4 w-full"><UserPlus className="h-4 w-4" /> צור וקשר</button>
        </Modal>
      )}
    </div>
  );
}

/* ---------- template picker ---------- */
function TemplatePicker({ templates, onPick, onClose }: { templates: Template[]; onPick: (t?: Template) => void; onClose: () => void }) {
  return (
    <Modal title="בחר תבנית להסכם" onClose={onClose}>
      <p className="mb-3 text-sm text-ink-muted">בחר תבנית קבועה (מנוהלת בלשונית "תבניות") או התחל ממסמך ריק.</p>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => onPick(undefined)} className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 p-4 text-ink-faint transition hover:border-brand-300 hover:bg-brand-50"><FileText className="h-6 w-6" /><span className="text-sm font-medium">מסמך ריק</span></button>
        {templates.map((t) => (
          <button key={t.id} onClick={() => onPick(t)} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50"><LayoutTemplate className="h-6 w-6 text-brand-600" /><span className="text-sm font-medium text-ink">{t.name}</span></button>
        ))}
      </div>
    </Modal>
  );
}

/* ---------- bits ---------- */
function F({ label, v, on, type = 'text' }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span><input type={type} className="input !py-2" value={v} onChange={(e) => on(e.target.value)} /></label>;
}
function Toast({ msg }: { msg: string }) { return <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop animate-fade-in">{msg}</div>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={onClose}><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-ink">{title}</h3><button onClick={onClose} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>{children}</div></div>;
}
function SendModal({ contract, onClose, onSend }: { contract: Contract; onClose: () => void; onSend: (c: string) => void }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/sign/${contract.id}` : '';
  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(link);
      else { const ta = document.createElement('textarea'); ta.value = link; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const channels = [
    { id: 'WhatsApp', Icon: MessageCircle, detail: contract.phone, color: 'hover:border-emerald-300 hover:bg-emerald-50', ic: 'text-emerald-600' },
    { id: 'SMS', Icon: Phone, detail: contract.phone, color: 'hover:border-violet-300 hover:bg-violet-50', ic: 'text-violet-600' },
    { id: 'Email', Icon: Mail, detail: contract.email, color: 'hover:border-sky-300 hover:bg-sky-50', ic: 'text-sky-600' },
  ];
  return (
    <Modal title="שליחת ההסכם ללקוח לחתימה" onClose={onClose}>
      <p className="mb-3 text-sm text-ink-muted">בחר ערוץ לשליחת "{contract.title}" אל {contract.customerName}. הלקוח יחתום אונליין:</p>
      <div className="space-y-2">
        {channels.map((ch) => (
          <button key={ch.id} onClick={() => onSend(ch.id)} className={`flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-right transition ${ch.color}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${ch.ic}`}><ch.Icon className="h-5 w-5" /></span>
            <div className="flex-1"><div className="font-semibold text-ink">{ch.id}</div><div className="text-xs text-ink-faint">{ch.detail || 'אין פרטי קשר'}</div></div>
            <Send className="h-4 w-4 text-ink-faint" />
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <div className="mb-1.5 text-xs font-medium text-ink-muted">קישור חתימה ללקוח:</div>
        <div className="flex items-center gap-2"><input readOnly value={link} className="input !py-1.5 font-mono text-[11px] text-ink-faint" /><button onClick={copyLink} className="btn-outline shrink-0 !py-1.5">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>
      </div>
    </Modal>
  );
}
