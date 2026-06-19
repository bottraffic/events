export const C = {
  brand: '#6366f1',
  brandDark: '#4f46e5',
  brand50: '#eef2ff',
  ink: '#0f172a',
  inkSoft: '#334155',
  inkMuted: '#64748b',
  inkFaint: '#94a3b8',
  bg: '#f4f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#ef4444',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
};

export const TONE: Record<string, { bg: string; fg: string }> = {
  emerald: { bg: '#ecfdf5', fg: '#047857' },
  amber: { bg: '#fffbeb', fg: '#b45309' },
  rose: { bg: '#fef2f2', fg: '#b91c1c' },
  sky: { bg: '#f0f9ff', fg: '#0369a1' },
  violet: { bg: '#f5f3ff', fg: '#6d28d9' },
  brand: { bg: '#eef2ff', fg: '#4338ca' },
  slate: { bg: '#f1f5f9', fg: '#475569' },
};

export const RSVP_TONE: Record<string, string> = { YES: 'emerald', MAYBE: 'amber', NO: 'rose', PENDING: 'slate' };
export const RSVP_LABEL: Record<string, string> = { YES: 'מגיע', MAYBE: 'אולי', NO: 'לא מגיע', PENDING: 'ממתין' };
