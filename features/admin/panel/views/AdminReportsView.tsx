'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { AdminReportPeriod, AdminReportSnapshot } from '@/features/admin/types/admin.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';

const PERIOD_LABELS: Record<AdminReportPeriod, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  custom: 'Özel aralık',
};

const METRIC_LABELS: Record<string, string> = {
  newUsers: 'Yeni kullanıcılar',
  newListings: 'Yeni ilanlar',
  newApplications: 'Yeni başvurular',
  revenueCents: 'Gelir (TL)',
  visitors: 'Ziyaretçi / aktivite',
  totalUsers: 'Toplam kullanıcı',
  activeUsers: 'Aktif kullanıcı',
  totalListings: 'Toplam ilan',
  publishedListings: 'Yayındaki ilan',
  totalApplications: 'Toplam başvuru',
  succeededPayments: 'Başarılı ödeme',
  openReports: 'Açık şikayet',
  resolvedReports: 'Çözülen şikayet',
};

function formatMetricValue(key: string, value: number | string): string {
  if (typeof value !== 'number') return String(value);
  if (key === 'revenueCents') {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value / 100);
  }
  return new Intl.NumberFormat('tr-TR').format(value);
}

function toStartOfDayIso(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function toEndOfDayIso(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T23:59:59.999`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function AdminReportsView() {
  const [period, setPeriod] = useState<AdminReportPeriod>('daily');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState<AdminReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (period === 'custom' && (!fromDate || !toDate)) {
      setLoading(false);
      setReport(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await adminApi.generateReport(
          period,
          undefined,
          period === 'custom'
            ? { from: toStartOfDayIso(fromDate), to: toEndOfDayIso(toDate) }
            : undefined,
        );
        if (!cancelled) setReport(next);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Rapor yüklenemedi');
          setReport(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period, fromDate, toDate]);

  const metrics = report?.metrics ?? {};

  return (
    <AdminPageShell
      title="Raporlar"
      description="Günlük, haftalık, aylık ve özel tarih aralığında kullanıcı, ilan, başvuru ve gelir takibi."
      toolbar={
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map((p) => (
              <Button
                key={p}
                type="button"
                size="sm"
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
          {period === 'custom' ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="report-from" className="text-xs">
                  Başlangıç
                </Label>
                <Input
                  id="report-from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="report-to" className="text-xs">
                  Bitiş
                </Label>
                <Input
                  id="report-to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
            </div>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <AdminLoadingState />
      ) : (
        <div className="space-y-4">
          {report ? (
            <p className="text-xs text-muted-foreground">
              Oluşturulma: {formatAdminDateTime(report.generatedAt)} · dönem:{' '}
              {PERIOD_LABELS[report.period] ?? report.period}
            </p>
          ) : period === 'custom' ? (
            <p className="text-sm text-muted-foreground">
              Özel rapor için başlangıç ve bitiş tarihlerini seçin.
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(metrics).map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-border/80 bg-card p-4 dark:border-white/10"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {METRIC_LABELS[key] ?? key}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {formatMetricValue(key, value)}
                </p>
              </div>
            ))}
          </div>
          {Object.keys(metrics).length === 0 && period !== 'custom' ? (
            <p className="text-sm text-muted-foreground">Bu dönem için metrik bulunamadı.</p>
          ) : null}
        </div>
      )}
    </AdminPageShell>
  );
}
