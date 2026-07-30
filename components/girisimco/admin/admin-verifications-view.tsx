'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { Verification } from '@/features/authentication/types/verification.types';
import type { VerificationId, UserId } from '@/lib/domain/ids';
import { getVerificationStatusLabel } from '@/features/authentication/utils/verification-status-labels';
import { getVerificationDocumentUrl } from '@/features/authentication/lib/upload-verification-media';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<Verification['type'], string> = {
  email: 'E-posta',
  phone: 'Telefon',
  identity: 'Kullanıcı',
  company: 'Şirket',
  investor_accreditation: 'Yatırımcı',
};

export function AdminVerificationsView() {
  const { user } = useAuth();
  const service = useMemo(() => getAdminService(), []);
  const [items, setItems] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.listVerifications({
        status: ['pending', 'in_review'],
      });
      setItems(result.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Doğrulamalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: VerificationId) {
    if (!user) return;
    setBusyId(id);
    try {
      await service.approveVerification(id, user.id as UserId);
      toast.success('Doğrulama onaylandı');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: VerificationId) {
    if (!user) return;
    const reason = window.prompt('Red sebebi:');
    if (!reason?.trim()) return;
    setBusyId(id);
    try {
      await service.rejectVerification(id, user.id as UserId, reason.trim());
      toast.success('Doğrulama reddedildi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function openDocument(path: string) {
    try {
      const url = await getVerificationDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Belge açılamadı');
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
          <p className="text-sm text-muted-foreground">Bekleyen doğrulama yok.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tür</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kullanıcı</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Belgeler</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id} className="border-b border-border/80 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">{TYPE_LABELS[v.type]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.userId}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{getVerificationStatusLabel(v.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {v.documentUrls.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {v.documentUrls.map((path, i) => (
                          <Button
                            key={path}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-lg px-2 text-xs"
                            onClick={() => void openDocument(path)}
                          >
                            Belge {i + 1}
                          </Button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        disabled={busyId === v.id || v.documentUrls.length === 0}
                        onClick={() => void approve(v.id)}
                      >
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-xs"
                        disabled={busyId === v.id}
                        onClick={() => void reject(v.id)}
                      >
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
