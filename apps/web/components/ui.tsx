'use client';

import { ReactNode } from 'react';

/* ---------------- Card ---------------- */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- PageHeader ---------------- */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- StatCard ---------------- */
export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = 'brand',
}: {
  label: string;
  value: string | number;
  delta?: { value: string; up?: boolean };
  icon?: ReactNode;
  tone?: 'brand' | 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';
}) {
  const tones: Record<string, string> = {
    brand: 'from-brand-500 to-brand-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-orange-500',
    sky: 'from-sky-500 to-cyan-500',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-400 to-slate-500',
  };
  return (
    <div className="card group relative overflow-hidden p-5 transition hover:shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${tones[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-medium ${delta.up ? 'text-emerald-600' : 'text-rose-500'}`}>
          {delta.up ? '▲' : '▼'} {delta.value}
        </div>
      )}
    </div>
  );
}

/* ---------------- Badge ---------------- */
const BADGE_TONES: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-700',
};
export function Badge({ children, tone = 'slate', dot }: { children: ReactNode; tone?: keyof typeof BADGE_TONES; dot?: boolean }) {
  return (
    <span className={`chip ${BADGE_TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({ name, size = 36 }: { name?: string; size?: number }) {
  const safe = (name ?? '').trim() || '?';
  const initials = safe.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  const hue = [...safe].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))` }}
    >
      {initials}
    </span>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({ icon = '📭', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="font-medium text-ink-soft">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
    </div>
  );
}

/* ---------------- Segmented control ---------------- */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3.5 py-1.5 transition ${value === o.value ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink-soft'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Progress bar ---------------- */
export function Bar({ value, max = 100, color = '#6366f1' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  );
}
