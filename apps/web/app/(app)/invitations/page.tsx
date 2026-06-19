'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, Rocket, X, MessageCircle, Phone, Mail, Copy, Check, ImagePlus, Trash2, BookmarkPlus, Save, Circle, RectangleHorizontal, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { INVITATION_TEMPLATES } from '@/lib/mock';
import { PageHeader, Card, CardHeader, Badge } from '@/components/ui';
import { THEMES, InvitationCard, type InviteData } from '@/components/invitation-card';

interface CustomTpl { id: string; name: string; data: InviteData; }

export default function InvitationsPage() {
  return <Suspense fallback={null}><InvitationsInner /></Suspense>;
}

function InvitationsInner() {
  const params = useSearchParams();
  const [f, setF] = useState<InviteData>({ groom: 'דניאל', bride: 'שירה', date: '21 בספטמבר 2026', day: 'יום שני', time: '19:30', venue: 'אולמי הדר', city: 'תל אביב', text: 'מתרגשים להזמין אתכם לחגוג איתנו את יום נישואינו', image: '', emoji: '💍', themeId: 'gold', topLabel: 'SAVE THE DATE', rsvpLabel: 'נא לאשר הגעה', imageStyle: 'round' });
  const [customTpls, setCustomTpls] = useState<CustomTpl[]>([]);
  const [editTplId, setEditTplId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [phone, setPhone] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof InviteData, v: string) => setF((p) => ({ ...p, [k]: v }));
  const slug = `${f.groom}-${f.bride}`.replace(/\s/g, '') || 'event';
  const link = typeof window !== 'undefined' ? `${window.location.origin}/i/${slug}` : '';
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  // invitation message shared across channels
  const shareText = `הזמנה לאירוע של ${f.groom}${f.bride ? ' ו' + f.bride : ''} ${f.emoji || '🎉'}\n${[f.date, f.day, f.time].filter(Boolean).join(' · ')}\n${[f.venue, f.city].filter(Boolean).join(', ')}\n\nלצפייה ואישור הגעה:\n${link}`;

  // HTTP-safe copy (navigator.clipboard is undefined on non-HTTPS origins)
  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement('textarea');
        ta.value = link; ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopied(true); setTimeout(() => setCopied(false), 1500); flash('הקישור הועתק ✓');
    } catch { flash('לא ניתן להעתיק אוטומטית — סמן והעתק ידנית'); }
  };

  const waNumber = phone.replace(/\D/g, '').replace(/^0/, '972');
  const openShare = (id: 'WhatsApp' | 'SMS' | 'Email') => {
    const enc = encodeURIComponent(shareText);
    const url = id === 'WhatsApp'
      ? `https://wa.me/${phone.trim() ? waNumber : ''}?text=${enc}`
      : id === 'SMS'
      ? `sms:${phone.trim() ? waNumber : ''}?&body=${enc}`
      : `mailto:?subject=${encodeURIComponent('הזמנה לאירוע 🎉')}&body=${enc}`;
    window.open(url, '_blank');
    flash(`נפתח ${id} — בחר/י נמען ושלח/י ✓`);
  };

  const loadTpls = () => api<CustomTpl[]>('/invitation-templates').then(setCustomTpls).catch(() => {});
  useEffect(() => {
    loadTpls();
    const cid = params.get('customer');
    if (cid) api<any>(`/customers/${cid}`).then((c) => { if (c) setF((p) => ({ ...p, groom: c.name, bride: c.partner || '', date: c.eventDate ? new Date(c.eventDate).toLocaleDateString('he-IL') : p.date, venue: c.hall || p.venue, city: c.city || p.city, customerId: c.id })); });
  }, []);

  const applyTemplate = (t: typeof INVITATION_TEMPLATES[number]) => { setF((p) => ({ ...p, themeId: t.theme, text: t.text, emoji: t.emoji })); setEditTplId(null); };
  const applyCustom = (t: CustomTpl) => { setF((p) => ({ ...t.data, customerId: p.customerId, groom: p.groom, bride: p.bride })); setEditTplId(t.id); flash(`נטענה תבנית "${t.name}" — ניתן לעדכן`); };
  const saveAsTemplate = async () => { const name = prompt('שם התבנית הקבועה:', f.emoji + ' תבנית'); if (!name) return; await api('/invitation-templates', { method: 'POST', body: JSON.stringify({ name, data: f }) }); loadTpls(); flash('התבנית נשמרה ✓'); };
  const updateTpl = async () => { if (!editTplId) return; await api(`/invitation-templates/${editTplId}`, { method: 'PATCH', body: JSON.stringify({ data: f }) }); loadTpls(); flash('התבנית עודכנה ✓'); };
  const deleteTpl = async (id: string) => { await api(`/invitation-templates/${id}`, { method: 'DELETE' }); loadTpls(); if (editTplId === id) setEditTplId(null); flash('התבנית נמחקה'); };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => set('image', String(r.result)); r.readAsDataURL(file); };
  const persist = async () => api('/invitations', { method: 'POST', body: JSON.stringify({ slug, data: f }) });
  const publish = async () => { await persist(); setSharing(true); };
  const preview = async () => { await persist(); window.open(link, '_blank'); };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop">{toast}</div>}
      <PageHeader title="הזמנה דיגיטלית" subtitle={f.customerId ? 'מקושר ללקוח · תבנית · תמונה · RSVP' : 'תבנית לפי סוג אירוע · תמונה · מפה · RSVP'} actions={<>
        {editTplId && <button onClick={updateTpl} className="btn-outline"><Save className="h-4 w-4" /> עדכן תבנית</button>}
        <button onClick={saveAsTemplate} className="btn-outline"><BookmarkPlus className="h-4 w-4" /> שמור כתבנית</button>
        <button onClick={preview} className="btn-outline"><Eye className="h-4 w-4" /> תצוגה לאורח</button>
        <button onClick={publish} className="btn-primary"><Rocket className="h-4 w-4" /> פרסם ושלח</button>
      </>} />

      {sharing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in" onClick={() => setSharing(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between"><h3 className="font-semibold text-ink">ההזמנה פורסמה 🎉</h3><button onClick={() => setSharing(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button></div>
            <p className="mb-3 text-sm text-ink-muted">האורחים יצפו ויאשרו הגעה דרך הקישור:</p>
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="input !py-1.5 font-mono text-[11px] text-ink-faint" />
              <button onClick={copyLink} className="btn-outline shrink-0 !py-1.5">{copied ? <><Check className="h-4 w-4" /> הועתק</> : <><Copy className="h-4 w-4" /> העתק</>}</button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-medium text-ink-muted">מספר וואטסאפ לשליחה ישירה (אופציונלי)</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="לדוגמה 0501234567 — או השאר ריק לבחירת איש קשר" inputMode="tel" className="input !py-2" />
            </label>

            <div className="space-y-2">
              {([{ id: 'WhatsApp', Icon: MessageCircle, c: 'text-emerald-600', label: phone.trim() ? 'שלח בוואטסאפ למספר שהוזן' : 'שתף בוואטסאפ (בחר/י איש קשר)' }, { id: 'SMS', Icon: Phone, c: 'text-violet-600', label: 'שלח ב-SMS' }, { id: 'Email', Icon: Mail, c: 'text-sky-600', label: 'שלח באימייל' }] as const).map((ch) => (
                <button key={ch.id} onClick={() => openShare(ch.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-right transition hover:bg-slate-50">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${ch.c}`}><ch.Icon className="h-5 w-5" /></span>
                  <div className="flex-1 font-semibold text-ink">{ch.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="תבנית לפי סוג אירוע" subtitle="תבניות מוכנות + תבניות שלך — ניתן לשנות הכל" action={f.customerId ? <Badge tone="emerald" dot>מקושר ללקוח</Badge> : undefined} />
            <div className="flex flex-wrap gap-2 p-4">
              {INVITATION_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-brand-300 hover:bg-brand-50"><span className="text-base">{t.emoji}</span> {t.name}</button>
              ))}
              {customTpls.map((t) => (
                <div key={t.id} className="group relative">
                  <button onClick={() => applyCustom(t)} className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/50 px-3 py-2 pe-7 text-sm text-brand-700 transition hover:bg-brand-50">{t.name}</button>
                  <button onClick={() => deleteTpl(t.id)} className="absolute left-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-ink-faint hover:text-rose-500" title="מחק תבנית"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="תמונה וסגנון" subtitle="העלה תמונה ובחר פריסה" />
            <div className="flex items-center gap-4 p-4">
              {f.image ? <img src={f.image} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-2xl">{f.emoji}</div>}
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="btn-outline !py-2"><ImagePlus className="h-4 w-4" /> {f.image ? 'החלף תמונה' : 'העלה תמונה'}</button>
                {f.image && <button onClick={() => set('image', '')} className="btn !py-2 bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4" /></button>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 border-t border-slate-100 p-4">
              {([['round', 'עגול', Circle], ['wide', 'רוחבי', RectangleHorizontal], ['full', 'מסך מלא', ImageIcon]] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => set('imageStyle', id)} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-medium transition ${(f.imageStyle ?? 'round') === id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-ink-muted hover:bg-slate-50'}`}>
                  <Icon className="h-5 w-5" /> {label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="עיצוב" subtitle="ערכת נושא" />
            <div className="grid grid-cols-4 gap-3 p-4">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => set('themeId', t.id)} className={`overflow-hidden rounded-xl border-2 transition ${f.themeId === t.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent'}`}>
                  <div className="h-14" style={{ background: t.bg }} /><div className="bg-white py-1.5 text-xs font-medium text-ink-soft">{t.name}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="טקסטים — הכל ניתן לעריכה" />
            <div className="grid grid-cols-2 gap-3 p-4">
              <Field label="כותרת עליונה (SAVE THE DATE)" v={f.topLabel ?? ''} on={(v) => set('topLabel', v)} />
              <Field label="כותרת אישור הגעה" v={f.rsvpLabel ?? ''} on={(v) => set('rsvpLabel', v)} />
              <Field label="חתן / חוגג" v={f.groom} on={(v) => set('groom', v)} />
              <Field label="כלה / חוגגת" v={f.bride} on={(v) => set('bride', v)} />
              <Field label="תאריך" v={f.date} on={(v) => set('date', v)} />
              <Field label="יום" v={f.day} on={(v) => set('day', v)} />
              <Field label="שעה" v={f.time} on={(v) => set('time', v)} />
              <Field label="אולם" v={f.venue} on={(v) => set('venue', v)} />
              <Field label="עיר" v={f.city} on={(v) => set('city', v)} />
              <div className="col-span-2"><Field label="טקסט הזמנה" v={f.text} on={(v) => set('text', v)} /></div>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-2">
          <div className="mx-auto w-[330px] rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-pop"><InvitationCard data={f} /></div>
          <p className="mt-3 text-center text-xs text-ink-faint">תצוגה מקדימה חיה · {slug}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span><input className="input !py-2" value={v} onChange={(e) => on(e.target.value)} /></label>;
}
