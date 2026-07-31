'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { AdminReportCategory, AdminReportPeriod, AdminReportSnapshot } from '@/features/admin/types/admin.types';
import { formatNumber } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const PERIOD_FILTERS: { value: AdminReportPeriod; label: string }[] = [
  { value: 'daily', label: 'Günlük' },
  { value: 'monthly', label: 'Aylık' },
];

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'users', label: 'Kullanıcılar' },
  { value: 'listings', label: 'İlanlar' },
  { value: 'applications', label: 'Başvurular' },
  { value: 'payments', label: 'Ödemeler' },
  { value: 'reports', label: 'Bildirimler' },
];

const METRIC_LABELS: Record<string, string> = {
  newUsers: 'Yeni Kullanıcı',
  newListings: 'Yeni İlan',
  newApplications: 'Yeni Başvuru',
  revenueCents: 'Gelir (kuruş)',
  visitors: 'Ziyaretçi',
  totalUsers: 'Toplam Kullanıcı',
  activeUsers: 'Aktif Kullanıcı',
  totalListings: 'Toplam İlan',
  publishedListings: 'Yayında İlan',
  totalApplications: 'Toplam Başvuru',
  succeededPayments: 'Başarılı Ödeme',
  openReports: 'Açık Bildirim',
  resolvedReports: 'Çözülen Bildirim',
};

export function AdminReportsView() {
  const [report, setReport] = useState<AdminReportSnapshot | null>(null);
  const [period, setPeriod] = useState<AdminReportPeriod>('daily');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(
        await adminApi.generateReport(period, category as AdminReportCategory | 'all'),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [period, category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={period} onValueChange={(v) => setPeriod(v as AdminReportPeriod)}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void load()}>
          Yenile
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : !report ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">Rapor oluşturulamadı.</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-xs text-muted-foreground">
            Oluşturulma: {new Date(report.generatedAt).toLocaleString('tr-TR')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(report.metrics).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-border/80 p-5 dark:border-white/10">
                <p className="text-sm text-muted-foreground">{METRIC_LABELS[key] ?? key}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                  {formatNumber(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
