'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Target, Handshake, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { Card, CardHeader, PageHeader, StatCard, Badge, Avatar } from '@/components/ui';
import { AreaChart, Donut, Funnel } from '@/components/charts';

export default function DashboardPage() {
  const [ov, setOv] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<{ months: string[]; values: number[] } | null>(null);
  const [funnel, setFunnel] = useState<any[]>([]);

  useEffect(() => {
    api('/reports/overview').then(setOv).catch(() => {});
    api('/reports/sources').then(setSources).catch(() => {});
    api('/reports/revenue').then(setRevenue).catch(() => {});
    api('/reports/funnel').then(setFunnel).catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="שלום דני 👋"
        subtitle="הנה תמונת המצב של אולמי דמו להיום"
        actions={<Link href="/pipeline" className="btn-primary"><Plus className="h-4 w-4" /> ליד חדש</Link>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="לידים החודש" value={ov?.leadsThisMonth ?? '—'} delta={{ value: '18% מהחודש שעבר', up: true }} icon={<Target className="h-5 w-5" />} tone="brand" />
        <StatCard label="עסקאות שנסגרו" value={ov?.closedDeals ?? '—'} delta={{ value: '2 השבוע', up: true }} icon={<Handshake className="h-5 w-5" />} tone="emerald" />
        <StatCard label="הכנסה צפויה" value={ov ? `₪${Number(ov.expectedRevenue).toLocaleString()}` : '—'} delta={{ value: '11% רבעוני', up: true }} icon={<DollarSign className="h-5 w-5" />} tone="amber" />
        <StatCard label="אחוז המרה" value={ov ? `${ov.conversionRate}%` : '—'} delta={{ value: '3% החודש', up: false }} icon={<TrendingUp className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="מגמת הכנסות" subtitle="12 החודשים האחרונים (אלפי ₪)" action={<Badge tone="emerald" dot>+34% YoY</Badge>} />
          <div className="p-5">{revenue && <AreaChart data={revenue.values} />}</div>
        </Card>

        <Card>
          <CardHeader title="מקורות לידים" />
          <div className="p-5">
            {sources.length > 0 && <Donut segments={sources.map((s) => ({ label: s.label, value: s.count, color: s.color }))} />}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="משפך מכירות" subtitle="המרה לאורך שלבי ה-Pipeline" />
          <div className="p-5">{funnel.length > 0 && <Funnel stages={funnel} />}</div>
        </Card>

        <Card>
          <CardHeader title="פעילות אחרונה" />
          <div className="divide-y divide-slate-50">
            {[
              { who: 'יוסי כהן', what: 'ליד חדש מפייסבוק', time: 'לפני 5 דק׳', tone: 'brand' as const },
              { who: 'אבי רוזן', what: 'חתם על חוזה', time: 'לפני שעה', tone: 'emerald' as const },
              { who: 'רינה לוי', what: 'הודעת WhatsApp', time: 'לפני שעתיים', tone: 'sky' as const },
              { who: 'דנה ברק', what: 'שיחה נכנסת 4:18', time: 'אתמול', tone: 'amber' as const },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={a.who} size={34} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{a.who}</div>
                  <div className="text-xs text-ink-faint">{a.what}</div>
                </div>
                <span className="text-[11px] text-ink-faint">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
