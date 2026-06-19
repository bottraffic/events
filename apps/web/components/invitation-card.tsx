'use client';

export const THEMES = [
  { id: 'gold', name: 'זהב קלאסי', bg: 'linear-gradient(160deg,#1a1a2e,#16213e)', accent: '#d4af37' },
  { id: 'rose', name: 'רוז עדין', bg: 'linear-gradient(160deg,#3d1f2e,#5c2a44)', accent: '#f3c1d3' },
  { id: 'emerald', name: 'אזמרגד', bg: 'linear-gradient(160deg,#0f2922,#1a3c34)', accent: '#9ae6b4' },
  { id: 'minimal', name: 'מינימל לבן', bg: 'linear-gradient(160deg,#f8f7f4,#ece9e2)', accent: '#1e293b' },
];
export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];

export interface InviteData {
  groom: string; bride: string; date: string; day: string; time: string;
  venue: string; city: string; text: string; image?: string; emoji?: string; themeId: string;
  topLabel?: string; rsvpLabel?: string; customerId?: string; imageStyle?: 'round' | 'wide' | 'full';
}

export function InvitationCard({ data, rsvp, onRsvp }: { data: InviteData; rsvp?: string | null; onRsvp?: (s: string) => void }) {
  const theme = themeById(data.themeId);
  const light = theme.id === 'minimal';
  const style = data.imageStyle ?? 'round';
  const opts = [{ k: 'YES', l: 'מגיע/ה' }, { k: 'MAYBE', l: 'אולי' }, { k: 'NO', l: 'לא מגיע/ה' }];
  const isFull = style === 'full' && !!data.image;

  const outerBg = isFull
    ? { backgroundImage: `linear-gradient(180deg, rgba(15,15,30,0.55), rgba(15,15,30,0.78)), url(${data.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: theme.bg };

  return (
    <div className="relative overflow-hidden rounded-[1.8rem]" style={outerBg}>
      <div className="flex min-h-[600px] flex-col items-center justify-between px-7 py-10 text-center" style={{ color: light && !isFull ? '#1e293b' : '#fff' }}>
        {/* hero image */}
        <div className="flex w-full flex-col items-center gap-3">
          {style === 'wide' && data.image ? (
            <img src={data.image} alt="" className="h-40 w-full rounded-2xl object-cover shadow-lg" style={{ border: `2px solid ${theme.accent}` }} />
          ) : style === 'round' ? (
            data.image
              ? <img src={data.image} alt="" className="h-32 w-32 rounded-full object-cover shadow-lg" style={{ border: `3px solid ${theme.accent}` }} />
              : <div className="flex h-28 w-28 items-center justify-center rounded-full text-4xl" style={{ background: `${theme.accent}22`, border: `2px dashed ${theme.accent}` }}>{data.emoji ?? '💌'}</div>
          ) : !data.image ? (
            <div className="flex h-28 w-28 items-center justify-center rounded-full text-4xl" style={{ background: `${theme.accent}22`, border: `2px dashed ${theme.accent}` }}>{data.emoji ?? '💌'}</div>
          ) : null}
          <div className="text-xs tracking-[0.3em]" style={{ color: theme.accent }}>{data.topLabel ?? 'SAVE THE DATE'}</div>
        </div>

        <div className="space-y-4">
          <div className="text-xs" style={{ opacity: 0.75 }}>{data.text}</div>
          <div className="text-4xl font-extrabold leading-tight">
            {data.groom}<div className="my-1 text-2xl" style={{ color: theme.accent }}>&</div>{data.bride}
          </div>
          <div className="mx-auto h-px w-24" style={{ background: theme.accent }} />
          <div className="space-y-1 text-sm">
            <div className="font-semibold">{data.day}, {data.date}</div>
            <div style={{ opacity: 0.85 }}>בשעה {data.time}</div>
            <div className="mt-2" style={{ color: theme.accent }}>{data.venue} · {data.city}</div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="text-xs" style={{ opacity: 0.75 }}>{data.rsvpLabel ?? 'נא לאשר הגעה'}</div>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            {opts.map((o) => {
              const sel = rsvp === o.k;
              return (
                <button key={o.k} onClick={() => onRsvp?.(o.k)} disabled={!onRsvp}
                  className="rounded-xl py-2.5 transition"
                  style={sel || o.k === 'YES' && !rsvp ? { background: theme.accent, color: light ? '#fff' : '#1a1a2e' } : { border: `1px solid ${theme.accent}`, color: light ? '#1e293b' : '#fff', opacity: rsvp && !sel ? 0.5 : 1 }}>
                  {o.l}
                </button>
              );
            })}
          </div>
          <a href={`https://waze.com/ul?q=${encodeURIComponent(data.venue + ' ' + data.city)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 pt-2 text-xs" style={{ color: theme.accent }}>📍 ניווט עם Waze</a>
        </div>
      </div>
    </div>
  );
}
