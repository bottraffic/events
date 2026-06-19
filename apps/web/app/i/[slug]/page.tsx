'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { InvitationCard, themeById, type InviteData } from '@/components/invitation-card';

const DEFAULT: InviteData = { groom: 'דניאל', bride: 'שירה', date: '21 בספטמבר 2026', day: 'יום שני', time: '19:30', venue: 'אולמי הדר', city: 'תל אביב', text: 'מתרגשים להזמין אתכם לחגוג איתנו', emoji: '💍', themeId: 'gold', image: '' };

export default function PublicInvitation() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [size, setSize] = useState(2);
  const [done, setDone] = useState(false);

  useEffect(() => { api<InviteData>(`/invitations/${slug}`).then((d) => setData(d ?? DEFAULT)).catch(() => setData(DEFAULT)).finally(() => setLoading(false)); }, [slug]);

  const submit = async () => {
    if (!name.trim() || !status) return;
    await api('/guests', { method: 'POST', body: JSON.stringify({ name, size, status, group: 'אורח (הזמנה)', customerId: d.customerId }) });
    setDone(true);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  const d = data ?? DEFAULT;
  const theme = themeById(d.themeId);

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-[2rem] shadow-pop">
          <InvitationCard data={d} rsvp={status} onRsvp={(s) => setStatus(s)} />
        </div>

        {status && !done && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft animate-fade-in">
            <div className="mb-3 text-center text-sm font-semibold text-ink">
              {status === 'YES' ? 'נשמח לראותכם! 🎉 כמה תגיעו?' : status === 'MAYBE' ? 'אולי תגיעו — נשמור מקום' : 'תודה על העדכון'}
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="השם שלך" value={name} onChange={(e) => setName(e.target.value)} />
              {status !== 'NO' && (
                <label className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-ink-muted">מספר אורחים</span>
                  <span className="flex items-center gap-3">
                    <button onClick={() => setSize((s) => Math.max(1, s - 1))} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300">−</button>
                    <b className="w-5 text-center">{size}</b>
                    <button onClick={() => setSize((s) => s + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300">+</button>
                  </span>
                </label>
              )}
              <button onClick={submit} disabled={!name.trim()} className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50" style={{ background: theme.accent, color: theme.id === 'minimal' ? '#fff' : '#1a1a2e' }}>שלח אישור הגעה</button>
            </div>
          </div>
        )}

        {done && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-soft animate-fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-7 w-7" /></div>
            <div className="text-lg font-bold text-ink">תודה {name}!</div>
            <p className="text-sm text-ink-muted">{status === 'YES' ? `אישרת הגעה ל-${size} אורחים. נתראה!` : status === 'MAYBE' ? 'עדכנת "אולי" — נעדכן בקרוב.' : 'קיבלנו שלא תגיעו. תודה על העדכון.'}</p>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-ink-faint">© 2026 SIMCHA OS · הזמנה דיגיטלית</p>
      </div>
    </div>
  );
}
