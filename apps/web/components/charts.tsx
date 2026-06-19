'use client';

/* Dependency-free SVG charts tuned for the enterprise dashboard. */

export function AreaChart({ data, height = 180, color = '#6366f1' }: { data: number[]; height?: number; color?: string }) {
  const w = 520;
  const max = Math.max(...data, 1);
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, height - (d / max) * (height - 24) - 8]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');
  const area = `${line} L ${w},${height} L 0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

export function Donut({ segments, size = 180 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text x="50%" y="48%" textAnchor="middle" className="fill-ink text-2xl font-bold">{total}</text>
        <text x="50%" y="62%" textAnchor="middle" className="fill-slate-400 text-[11px]">סה"כ</text>
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-ink-soft">{s.label}</span>
            <span className="font-semibold text-ink">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Funnel({ stages }: { stages: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="space-y-2.5">
      {stages.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-ink-muted">{s.label}</span>
          <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
            <div
              className="flex h-full items-center justify-end rounded-lg px-2 text-xs font-semibold text-white transition-all"
              style={{ width: `${(s.value / max) * 100}%`, background: s.color }}
            >
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniBars({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-12 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ height: `${(d / max) * 100}%`, background: color, opacity: 0.35 + (d / max) * 0.65 }} />
      ))}
    </div>
  );
}
