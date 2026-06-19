'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Target, Users, Megaphone, CheckSquare, Calendar, Mail, UserCheck,
  Armchair, MessageSquare, Phone, FileText, Workflow, Sparkles, BarChart3, Store,
  Settings, Search, Bell, LogOut, PanelRightClose, PanelRightOpen, Plus, CalendarClock, Receipt, Menu, X,
} from 'lucide-react';
import { api, clearSession, getToken } from '@/lib/api';
import { Avatar } from '@/components/ui';

type Item = { href: string; label: string; icon: React.ComponentType<any> };
const NAV: { section: string; items: Item[] }[] = [
  { section: 'ראשי', items: [{ href: '/dashboard', label: 'דשבורד', icon: LayoutDashboard }] },
  { section: 'מכירות', items: [
    { href: '/pipeline', label: 'לידים', icon: Target },
    { href: '/customers', label: 'לקוחות', icon: Users },
    { href: '/calendar', label: 'יומן פגישות', icon: CalendarClock },
    { href: '/campaigns', label: 'קמפיינים', icon: Megaphone },
    { href: '/tasks', label: 'משימות', icon: CheckSquare },
  ] },
  { section: 'אירועים', items: [
    { href: '/events', label: 'אירועים', icon: Calendar },
    { href: '/invitations', label: 'הזמנות דיגיטליות', icon: Mail },
    { href: '/rsvp', label: 'אישורי הגעה', icon: UserCheck },
    { href: '/seating', label: 'סידורי הושבה', icon: Armchair },
  ] },
  { section: 'תקשורת', items: [
    { href: '/inbox', label: 'הודעות', icon: MessageSquare },
    { href: '/calls', label: 'שיחות', icon: Phone },
  ] },
  { section: 'מסמכים ואוטומציה', items: [
    { href: '/contracts', label: 'חוזים והסכמים', icon: FileText },
    { href: '/documents', label: 'חשבוניות וקבלות', icon: Receipt },
    { href: '/automations', label: 'אוטומציות', icon: Workflow },
    { href: '/ai', label: 'עוזר AI', icon: Sparkles },
  ] },
  { section: 'ניהול', items: [
    { href: '/reports', label: 'דוחות', icon: BarChart3 },
    { href: '/vendors', label: 'ספקים', icon: Store },
    { href: '/settings', label: 'הגדרות', icon: Settings },
  ] },
];

const NOTIFS = [
  { Icon: Target, tone: 'bg-brand-50 text-brand-600', title: 'ליד חדש מפייסבוק', body: 'יוסי כהן · חתונה 350 איש', time: 'עכשיו' },
  { Icon: Bell, tone: 'bg-amber-50 text-amber-600', title: 'תזכורת: התקשר לרינה לוי', body: 'מתוזמן ל-17:00 היום', time: 'בעוד שעה' },
  { Icon: FileText, tone: 'bg-emerald-50 text-emerald-600', title: 'חוזה נחתם', body: 'אבי רוזן · ₪92,000', time: 'לפני שעה' },
  { Icon: MessageSquare, tone: 'bg-sky-50 text-sky-600', title: 'הודעת WhatsApp חדשה', body: 'דנה ברק שלחה הודעה', time: 'לפני שעתיים' },
  { Icon: UserCheck, tone: 'bg-violet-50 text-violet-600', title: 'אישור הגעה', body: '12 אורחים אישרו · גל & מאיה', time: 'אתמול' },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition hover:bg-slate-100 hover:text-ink-soft">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">5</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-semibold text-ink">התראות</span>
              <span className="chip bg-slate-100 text-slate-500">אתר + אפליקציה</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {NOTIFS.map((n, i) => (
                <div key={i} className="flex gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.tone}`}><n.Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="text-sm font-medium text-ink">{n.title}</div><div className="truncate text-xs text-ink-faint">{n.body}</div></div>
                  <span className="whitespace-nowrap text-[10px] text-ink-faint">{n.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50">סמן הכל כנקרא</button>
          </div>
        </>
      )}
    </div>
  );
}

function QuickCreate() {
  const [open, setOpen] = useState(false);
  const items = [
    { href: '/pipeline', label: 'ליד חדש', icon: Target },
    { href: '/customers', label: 'לקוח חדש', icon: Users },
    { href: '/events', label: 'אירוע חדש', icon: Calendar },
    { href: '/calendar', label: 'פגישה חדשה', icon: CalendarClock },
    { href: '/contracts', label: 'הסכם חדש', icon: FileText },
  ];
  return (
    <div className="relative hidden sm:block">
      <button onClick={() => setOpen((o) => !o)} className="btn-primary !py-2"><Plus className="h-4 w-4" /> חדש</button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop animate-fade-in">
            {items.map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700">
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<{ name: string; roles: string[] } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api('/auth/me').then(setMe).catch(() => {});
  }, [router]);

  // close the mobile drawer whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const logout = () => { clearSession(); router.replace('/login'); };
  const current = NAV.flatMap((s) => s.items).find((i) => i.href === pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* mobile drawer backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-slate-200 bg-white shadow-pop transition-transform duration-200 lg:static lg:z-auto lg:shadow-none lg:transition-all ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${collapsed ? 'w-64 lg:w-[72px]' : 'w-64'}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-extrabold text-white shadow-soft">S</div>
          {!collapsed && <div className="leading-tight"><div className="text-base font-extrabold tracking-tight text-ink">SIMCHA OS</div><div className="text-[10px] font-medium text-ink-faint">Enterprise</div></div>}
          <button onClick={() => setMobileOpen(false)} className="ms-auto flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition hover:bg-slate-100 hover:text-ink-soft lg:hidden" aria-label="סגור תפריט">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {NAV.map((group) => (
            <div key={group.section} className="mb-4">
              {!collapsed && <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint">{group.section}</div>}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} title={item.label}
                      className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition ${active ? 'bg-gradient-to-l from-brand-50 to-brand-50/30 text-brand-700' : 'text-ink-muted hover:bg-slate-50 hover:text-ink-soft'}`}>
                      {active && <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-brand-600" />}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${active ? 'bg-white text-brand-600 shadow-card' : 'text-ink-muted group-hover:bg-white/70'}`}><Icon className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button onClick={() => setCollapsed((c) => !c)} className="m-2.5 hidden items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-ink-faint transition hover:bg-slate-50 lg:flex">
          {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <><PanelRightClose className="h-4 w-4" /> כווץ תפריט</>}
        </button>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-40 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:gap-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-slate-100 hover:text-ink-soft lg:hidden" aria-label="פתח תפריט">
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold text-ink-soft">{current?.label ?? ''}</div>
          <div className="relative ms-2 hidden flex-1 md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input placeholder="חיפוש לידים, אירועים, לקוחות…" className="input max-w-md !py-2 pr-9" />
          </div>
          <div className="ms-auto flex items-center gap-3">
            <QuickCreate />
            <NotificationBell />
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1 pe-3 ps-1">
              <Avatar name={me?.name ?? 'דני מנהל'} size={32} />
              <div className="hidden leading-tight sm:block"><div className="text-sm font-semibold text-ink">{me?.name ?? 'דני מנהל'}</div><div className="text-[10px] text-ink-faint">מנהל מערכת</div></div>
              <button onClick={logout} title="התנתקות" className="text-ink-faint transition hover:text-rose-500"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
