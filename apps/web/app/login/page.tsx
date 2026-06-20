'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: 'admin@demo.simcha.io', password: 'Demo1234!', tenantSlug: 'demo', venueName: '', adminName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register-tenant';
      const body = mode === 'login'
        ? { email: form.email, password: form.password, tenantSlug: form.tenantSlug }
        : { venueName: form.venueName, adminName: form.adminName, email: form.email, password: form.password };
      // Auth always uses the real backend so accounts/approvals are real
      const r = await fetch(`/v1${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const res = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(res.message ?? 'שגיאה');
      if (res.pending) { setError('החשבון נוצר וממתין לאישור מנהל המערכת. נעדכן אותך לאחר האישור.'); setMode('login'); return; }
      setSession(res.accessToken, res.refreshToken);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'שגיאה');
    } finally { setLoading(false); }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-stretch">
      {/* hero */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <img src="/logo-mark.png" alt="events360" className="h-12 w-12 rounded-xl object-cover" />
          <span className="text-xl font-extrabold">events360</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">מערכת ההפעלה<br />לאולמות וגני אירועים</h1>
          <p className="mt-4 max-w-md text-brand-100">CRM, טלפוניה, WhatsApp, אישורי הגעה, סידורי הושבה, חתימה דיגיטלית ו-AI — הכל במקום אחד.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {['🎯 ניהול לידים חכם', '🪑 AI Seating', '💬 WhatsApp Business', '📞 מרכז שיחות AI', '✍️ חתימה דיגיטלית', '📊 דוחות בזמן אמת'].map((f) => (
              <div key={f} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">{f}</div>
            ))}
          </div>
        </div>
        <p className="text-xs text-brand-200">© 2026 events360 · Venues &amp; CRM</p>
      </div>

      {/* form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-[480px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <img src="/logo-full.png" alt="events360" className="mx-auto w-28 sm:w-32 rounded-2xl object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-ink">{mode === 'login' ? 'ברוכים השבים' : 'פתיחת חשבון'}</h2>
          <p className="mt-1 text-sm text-ink-muted">{mode === 'login' ? 'התחבר כדי להמשיך' : 'הקם את האולם שלך תוך דקות'}</p>

          <div className="my-6 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-lg py-2 transition ${mode === 'login' ? 'bg-white shadow-card' : 'text-ink-muted'}`}>התחברות</button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-lg py-2 transition ${mode === 'register' ? 'bg-white shadow-card' : 'text-ink-muted'}`}>פתיחת חשבון</button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <Field label="שם האולם" value={form.venueName} onChange={(v) => setForm({ ...form, venueName: v })} required />
                <Field label="שם מלא" value={form.adminName} onChange={(v) => setForm({ ...form, adminName: v })} required />
              </>
            )}
            {mode === 'login' && <Field label="מזהה אולם" value={form.tenantSlug} onChange={(v) => setForm({ ...form, tenantSlug: v })} required />}
            <Field label="אימייל" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="סיסמה" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
            {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading ? '...' : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}</button>
          </form>
          {mode === 'login' && <p className="mt-4 text-center text-xs text-ink-faint">דמו: admin@demo.simcha.io · Demo1234! · אולם: demo</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="input" />
    </label>
  );
}
