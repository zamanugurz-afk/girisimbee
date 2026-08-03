'use client';

import { useMemo, useState } from 'react';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import { AdminMetricCard } from '@/features/admin/panel/components/AdminMetricCard';
import { AdminChart } from '@/features/admin/panel/components/AdminChart';
import { AdminTopListingsTable } from '@/features/admin/panel/components/AdminTopListingsTable';
import { AdminTopUsersTable } from '@/features/admin/panel/components/AdminTopUsersTable';
import { AdminReportPeriodFilter } from '@/features/admin/panel/components/AdminReportPeriodFilter';
import { ADMIN_REPORT_PERIOD_LABELS } from '@/features/admin/panel/constants/admin-reports.constants';
import { getMockAdminReportSnapshot } from '@/features/admin/panel/mock/admin-panel.mock';
import type { AdminReportPeriod } from '@/features/admin/panel/types/admin-panel.types';

function formatCount(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminReportsView() {
  const [period, setPeriod] = useState<AdminReportPeriod>('weekly');
  const snapshot = useMemo(() => getMockAdminReportSnapshot(period), [period]);
  const { metrics } = snapshot;

  const metricCards = [
    { id: 'total_users', label: 'Toplam kullanıcı sayısı', value: formatCount(metrics.total_users) },
    { id: 'total_listings', label: 'Toplam ilan sayısı', value: formatCount(metrics.total_listings) },
    { id: 'daily_listings', label: 'Günlük ilan sayısı', value: formatCount(metrics.daily_listings) },
    {
      id: 'total_views',
      label: 'Toplam görüntülenme sayısı',
      value: formatCount(metrics.total_views),
    },
    {
      id: 'total_favorites',
      label: 'Toplam favori sayısı',
      value: formatCount(metrics.total_favorites),
    },
    {
      id: 'total_placements',
      label: 'Toplam vitrin sayısı',
      value: formatCount(metrics.total_placements),
    },
    {
      id: 'total_urgent_placements',
      label: 'Toplam acil vitrin sayısı',
      value: formatCount(metrics.total_urgent_placements),
    },
    {
      id: 'daily_revenue',
      label: 'Günlük gelir',
      value: formatCurrency(metrics.daily_revenue),
    },
    {
      id: 'monthly_revenue',
      label: 'Aylık gelir',
      value: formatCurrency(metrics.monthly_revenue),
    },
  ];

  return (
    <AdminPageShell
      title="Raporlar"
      description={`Platform metrikleri — mock veri (${ADMIN_REPORT_PERIOD_LABELS[period]})`}
      toolbar={
        <AdminReportPeriodFilter value={period} onChange={setPeriod} />
      }
    >
      <section aria-label="Özet metrikler" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <AdminMetricCard key={card.id} label={card.label} value={card.value} />
        ))}
      </section>

      <AdminReportCard
        title="Trend grafiği"
        description="Görüntülenme, ilan ve gelir — seçili dönem"
      >
        <AdminChart data={snapshot.chart} title={ADMIN_REPORT_PERIOD_LABELS[period]} />
      </AdminReportCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminReportCard title="En çok görüntülenen ilanlar">
          <AdminTopListingsTable rows={snapshot.top_viewed_listings} />
        </AdminReportCard>
        <AdminReportCard title="En çok favorilenen ilanlar">
          <AdminTopListingsTable
            rows={[...snapshot.top_favorited_listings].sort(
              (a, b) => b.favorite_count - a.favorite_count,
            )}
          />
        </AdminReportCard>
      </div>

      <AdminReportCard title="En aktif kullanıcılar">
        <AdminTopUsersTable rows={snapshot.top_active_users} />
      </AdminReportCard>
    </AdminPageShell>
  );
}
