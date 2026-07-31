'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type { ApplicationId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const MODULE_LABELS: Record<MarketplaceApplication['moduleKey'], string> = {
  candidates: 'Aday Başvurusu',
  employers: 'İşveren Başvurusu',
  franchise: 'Franchise Başvurusu',
};

export function AdminVerificationsView() {
  const [items, setItems] = useState<MarketplaceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [submitted, reviewing] = await Promise.all([
        adminApi.listApplications({ status: 'submitted' }, { page: 1, limit: 50 }),
        adminApi.listApplications({ status: 'reviewing' }, { page: 1, limit: 50 }),
      ]);
      const merged = [...submitted.data, ...reviewing.data];
      const unique = merged.filter(
        (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index,
      );
      setItems(unique);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: ApplicationId) {
    setBusyId(id);
    try {
      await adminApi.patchApplication(id, { action: 'review' });
      toast.success('Başvuru inceleniyor olarak işaretlendi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function archive(id: ApplicationId) {
    if (!window.confirm('Başvuruyu arşivlemek istediğinize emin misiniz?')) return;
    setBusyId(id);
    try {
      await adminApi.patchApplication(id, { action: 'archive' });
      toast.success('Başvuru arşivlendi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => void load()}>
        Yenile
      </Button>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">Bekleyen başvuru yok.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Modül</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Başvuran</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">İlan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((application) => (
                <tr key={application.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">{MODULE_LABELS[application.moduleKey]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {application.applicantProfileId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {application.listingId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{application.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {application.status === 'submitted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs"
                          disabled={busyId === application.id}
                          onClick={() => void review(application.id)}
                        >
                          İncele
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-xs"
                        disabled={busyId === application.id}
                        onClick={() => void archive(application.id)}
                      >
                        Arşivle
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
