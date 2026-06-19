'use client';

import { useEffect, useState } from 'react';
import { Download, DollarSign, Target, TrendingUp, Rocket } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, Card, CardHeader, StatCard, Bar } from '@/components/ui';
import { AreaChart, Donut, Funnel } from '@/components/charts';

export default function ReportsPage() {
  const [ov, setOv] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);

  useEffect(() => {
    api('/reports/overview').then(setOv).catch(() => {});
    api('/reports/sources').then(setSources).catch(() => {});
    api('/reports/revenue').then(setRevenue).catch(() => {});
    api('/reports/funnel').then(setFunnel).catch(() => {});
  }, []);

  const roi = [
    { ch: 'פייסבוק', spend: 8000, rev: 182000 },
    { ch: 'אינסטגרם', spend: 6000, rev: 96000 },
    { ch: 'גוגל', spend: 9000, rev: 134000 },
    { ch: 'טיקטוק', spend: 3000, rev: 41000 },
  ];

  const exportCsv = () => {
    const rows: string[][] = [['דוח עסקי — SIMCHA OS']];
    rows.push([]); rows.push(['מדד', 'ערך']);
    if (ov) { rows.push(['הכנסה צפויה', String(ov.expectedRevenue)]); rows.push(['לידים', String(ov.totalLeads)]); rows.push(['אחוז המרה', `${ov.conversionRate}%`]); rows.push(['עסקאות שנסגרו', String(ov.closedDeals)]); }
    rows.push([]); rows.push(['מקור', 'לידים']);
    sources.forEach((s) => rows.push([s.label ?? s.source, String(s.count)]));
    rows.push([]); rows.push(['ערוץ', 'הוצאה', 'הכנסה', 'ROI']);
    roi.forEach((r) => rows.push([r.ch, String(r.spend), String(r.rev), `${Math.round((r.rev / r.spend) * 100)}%`]));
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `simcha-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="דוחות וניתוח עסקי" subtitle="הכנסות · מקורות · ROI · משפך המרה" actions={<button onClick={exportCsv} className="btn-outline"><Download className="h-4 w-4" /> ייצוא Excel</button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="הכנסה צפויה" value={ov ? `₪${Number(ov.expectedRevenue).toLocaleString()}` : '—'} icon={<DollarSign className="h-5 w-5" />} tone="amber" />
        <StatCard label="לידים" value={ov?.totalLeads ?? '—'} icon={<Target className="h-5 w-5" />} tone="brand" />
        <StatCard label="המרה" value={ov ? `${ov.conversionRate}%` : '—'} icon={<TrendingUp className="h-5 w-5" />} tone="emerald" />
        <StatCard label="ROI ממוצע" value="340%" icon={<Rocket className="h-5 w-5" />} tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="הכנסות חודשיות" subtitle="אלפי ₪" />
          <div className="p-5">{revenue && <AreaChart data={revenue.values} color="#10b981" />}</div>
        </Card>
        <Card>
          <CardHeader title="מקורות תנועה" />
          <div className="p-5">{sources.length > 0 && <Donut segments={sources.map((s) => ({ label: s.label, value: s.count, color: s.color }))} />}</div>
        </Card>
        <Card>
          <CardHeader title="משפך המרה" />
          <div className="p-5">{funnel.length > 0 && <Funnel stages={funnel} />}</div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="החזר השקעה לפי ערוץ (ROI)" />
          <div className="space-y-4 p-5">
            {roi.map((r) => {
              const roiPct = Math.round((r.rev / r.spend) * 100);
              return (
                <div key={r.ch}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-ink-soft">{r.ch}</span><span className="font-semibold text-emerald-600">{roiPct}% · ₪{r.rev.toLocaleString()}</span></div>
                  <Bar value={roiPct} max={4000} color="#6366f1" />
                  <div className="mt-0.5 text-[11px] text-ink-faint">הוצאה ₪{r.spend.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
