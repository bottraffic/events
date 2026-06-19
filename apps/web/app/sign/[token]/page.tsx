'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { renderMerged } from '@/components/rich-editor';
import { SignaturePad } from '@/components/signature-pad';

const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '—');

export default function SignPage() {
  const { token } = useParams<{ token: string }>();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sig, setSig] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => { api(`/contracts/${token}`).then((r) => { setC(r); setDone(r?.status === 'SIGNED'); }).finally(() => setLoading(false)); }, [token]);

  const md = (d: any): Record<string, string> => ({
    'לקוח': d.customerName || '—', 'בן_זוג': d.partnerName || '', 'תאריך': fmt(d.eventDate), 'סוג': d.eventType || '—',
    'מוזמנים': String(d.guests || '—'), 'אולם': d.hall || '—', 'סכום': (d.amount || 0).toLocaleString(),
    'מקדמה': (d.deposit || 0).toLocaleString(), 'יתרה': ((d.amount || 0) - (d.deposit || 0)).toLocaleString(),
  });

  const sign = async () => {
    const ua = navigator.userAgent;
    const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'מכשיר נייד' : 'מחשב';
    const updated = await api(`/contracts/${token}/sign`, { method: 'POST', body: JSON.stringify({ signature: sig, signerName: c.customerName, device, userAgent: ua }) });
    setC(updated);
    setDone(true);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  if (!c) return <div className="flex min-h-screen items-center justify-center text-ink-faint">ההסכם לא נמצא</div>;

  return (
    <div className="mesh-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-extrabold text-white">S</div>
            <div><div className="font-extrabold text-ink">אולמי דמו בע"מ</div><div className="text-[11px] text-ink-faint">הסכם לחתימה דיגיטלית</div></div>
          </div>
          <span className="chip bg-white text-ink-muted shadow-card"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> מאובטח</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h1 className="text-lg font-bold text-ink">{c.title}</h1>
            <p className="text-sm text-ink-muted">שלום {c.customerName}, נא לעיין בהסכם ולחתום בתחתית הדף.</p>
          </div>

          <div className="px-7 py-6">
            <div className="rt-content !min-h-0 text-[13px]" dangerouslySetInnerHTML={{ __html: renderMerged(c.bodyHtml, md(c)) }} />
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-7 py-6">
            {done ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-7 w-7" /></div>
                <div className="text-lg font-bold text-ink">ההסכם נחתם בהצלחה!</div>
                <p className="text-sm text-ink-muted">תודה {c.customerName}. עותק חתום נשמר ונשלח אליך.</p>
                {c.signature && <img src={c.signature} alt="חתימה" className="mt-2 max-h-16" />}
                <div className="mt-2 text-[11px] text-ink-faint">נחתם {c.signedAt || 'היום'} · IP {c.ip || '—'} · מכשיר {c.device || 'נייד'}</div>
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm font-semibold text-ink-soft">חתימה דיגיטלית</div>
                <SignaturePad onChange={setSig} />
                <button disabled={!sig} onClick={sign} className="btn-primary mt-4 w-full !py-3 disabled:opacity-50"><Check className="h-4 w-4" /> אני מאשר/ת וחותם/ת על ההסכם</button>
                <p className="mt-2 text-center text-[11px] text-ink-faint">בלחיצה על הכפתור החתימה מקבלת תוקף משפטי מחייב</p>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-faint">© 2026 SIMCHA OS · חתימה מאובטחת ומוצפנת</p>
      </div>
    </div>
  );
}
