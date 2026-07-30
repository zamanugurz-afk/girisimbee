'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { Report, ReportEntityType } from '@/features/shared/types/report.types';
import type { ReportId, UserId } from '@/lib/domain/ids';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const ENTITY_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'user', label: 'Kullanıcılar' },
  { value: 'listing', label: 'İlanlar' },
  { value: 'company', label: 'Şirketler' },
  { value: 'profile', label: 'Profiller' },
];

const ENTITY_LABELS: Record<ReportEntityType, string> = {
  user: 'Kullanıcı',
  listing: 'İlan',
  company: 'Şirket',
  message: 'Mesaj',
  profile: 'Profil',
};

export function AdminReportsView() {
  const { user } = useAuth();
  const service = useMemo(() => getAdminService(), []);
  const [items, setItems] = useState<Report[]>([]);
  const [entityType, setEntityType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.listReports({
        entityType: entityType === 'all' ? undefined : (entityType as ReportEntityType),
        status: ['submitted', 'in_review'],
      });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Raporlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service, entityType]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(id: ReportId) {
    if (!user) return;
    setBusyId(id);
    try {
      await service.resolveReport(id, user.id as UserId, 'Admin tarafından çözüldü');
      toast.success('Rapor çözüldü');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function dismiss(id: ReportId) {
    if (!user) return;
    setBusyId(id);
    try {
      await service.dismissReport(id, user.id as UserId);
      toast.success('Rapor reddedildi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-44 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_FILTERS.map((f) => (
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">Bekleyen rapor yok.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tür</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hedef</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sebep</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((report) => (
                <tr key={report.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">{ENTITY_LABELS[report.entityType]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{report.entityId}</td>
                  <td className="px-4 py-3">{report.reason}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{report.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(report.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" disabled={busyId === report.id} onClick={() => void resolve(report.id)}>
                        Çöz
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs" disabled={busyId === report.id} onClick={() => void dismiss(report.id)}>
                        Reddet
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
