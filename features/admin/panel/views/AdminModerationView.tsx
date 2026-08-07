'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { Report, ReportStatus } from '@/features/shared/types/report.types';
import type { AdminTableColumn } from '@/features/admin/panel/types/admin-panel.types';
import { ids } from '@/lib/domain/ids';

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: 'Beklemede',
  in_review: 'İnceleniyor',
  resolved: 'Çözüldü',
  dismissed: 'Reddedildi',
  deleted: 'Silindi',
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  fraud: 'Dolandırıcılık',
  harassment: 'Taciz',
  misleading: 'Yanıltıcı',
  inappropriate: 'Uygunsuz',
  duplicate: 'Mükerrer',
  other: 'Diğer',
};

const ENTITY_LABELS: Record<string, string> = {
  listing: 'İlan',
  user: 'Kullanıcı',
  company: 'Şirket',
  message: 'Mesaj',
  profile: 'Profil',
};

type StatusFilter = 'all' | ReportStatus;

type ListingModerationAction = 'none' | 'unpublish' | 'archive' | 'delete';

const LISTING_ACTION_LABELS: Record<ListingModerationAction, string> = {
  none: 'Sadece şikayeti kapat (ilan dokunulmaz)',
  unpublish: 'İlanı yayından kaldır',
  archive: 'İlanı arşivle',
  delete: 'İlanı sil',
};

export function AdminModerationView() {
  const [rows, setRows] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | 'listing' | 'user'>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [resolveTarget, setResolveTarget] = useState<Report | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [listingAction, setListingAction] = useState<ListingModerationAction>('none');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listModerationReports(
        {
          status: statusFilter === 'all' ? undefined : statusFilter,
          entityType: entityFilter === 'all' ? undefined : entityFilter,
          query: query.trim() || undefined,
        },
        { page, limit: PAGE_SIZE },
      );
      setRows(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Şikayetler yüklenemedi');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [entityFilter, page, query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sectionCounts = useMemo(() => {
    const listing = rows.filter((r) => r.entityType === 'listing').length;
    const user = rows.filter((r) => r.entityType === 'user').length;
    const open = rows.filter((r) => r.status === 'submitted' || r.status === 'in_review').length;
    return [
      { id: 'listing', label: 'İlan şikâyetleri', count: listing, openCount: open },
      { id: 'user', label: 'Kullanıcı şikâyetleri', count: user, openCount: open },
    ];
  }, [rows]);

  function openResolve(row: Report) {
    setResolveTarget(row);
    setResolutionNote('');
    setListingAction(row.entityType === 'listing' ? 'unpublish' : 'none');
    setResolveOpen(true);
  }

  async function runModerationAction(
    id: string,
    action: { action: 'resolve'; resolution: string } | { action: 'dismiss' } | { action: 'review' },
  ) {
    setBusyId(id);
    try {
      await adminApi.moderationAction(id, action);
      toast.success('Şikayet güncellendi');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function applyListingAction(
    entityId: string,
    action: Exclude<ListingModerationAction, 'none'>,
  ) {
    const listingId = ids.listing(entityId);
    if (action === 'unpublish') {
      await adminApi.patchListing(listingId, { action: 'unpublish' });
      return 'İlan yayından kaldırıldı';
    }
    if (action === 'archive') {
      await adminApi.patchListing(listingId, { action: 'archive' });
      return 'İlan arşivlendi';
    }
    await adminApi.patchListing(listingId, { action: 'delete' });
    return 'İlan silindi';
  }

  async function confirmResolve() {
    if (!resolveTarget) return;
    const reportId = resolveTarget.id;
    setBusyId(reportId);
    try {
      let listingResult: string | null = null;
      if (resolveTarget.entityType === 'listing' && listingAction !== 'none') {
        listingResult = await applyListingAction(resolveTarget.entityId, listingAction);
      }

      const note = resolutionNote.trim()
        || (listingResult
          ? `${listingResult}. Şikayet yönetici tarafından çözüldü.`
          : 'Yönetici tarafından çözüldü');

      await adminApi.moderationAction(reportId, {
        action: 'resolve',
        resolution: listingResult && resolutionNote.trim()
          ? `${note} (${listingResult})`
          : note,
      });

      toast.success(
        listingResult
          ? `Şikayet çözüldü · ${listingResult}`
          : 'Şikayet çözüldü',
      );
      setResolveOpen(false);
      setResolveTarget(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Çözüm işlemi başarısız');
    } finally {
      setBusyId(null);
    }
  }

  async function quickListingAction(
    row: Report,
    action: Exclude<ListingModerationAction, 'none'>,
  ) {
    if (row.entityType !== 'listing') return;
    setBusyId(row.id);
    try {
      const listingResult = await applyListingAction(row.entityId, action);
      await adminApi.moderationAction(row.id, {
        action: 'resolve',
        resolution: `${listingResult}. Şikayet otomatik kapatıldı.`,
      });
      toast.success(`${listingResult} · şikayet kapatıldı`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İlan işlemi başarısız');
    } finally {
      setBusyId(null);
    }
  }

  const columns: AdminTableColumn<Report>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}…</span>,
    },
    {
      key: 'entityType',
      header: 'Hedef',
      render: (row) => (
        <div className="space-y-1">
          <span>
            {ENTITY_LABELS[row.entityType] ?? row.entityType}
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              {row.entityId.slice(0, 8)}…
            </span>
          </span>
          {row.entityType === 'listing' ? (
            <Link
              href={`/ilan/${row.entityId}`}
              className="block text-xs text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              İlanı aç
            </Link>
          ) : null}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Sebep',
      render: (row) => REASON_LABELS[row.reason] ?? row.reason,
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (row) => (
        <span className="line-clamp-2 max-w-[220px] text-sm">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => STATUS_LABELS[row.status] ?? row.status,
    },
    {
      key: 'createdAt',
      header: 'Tarih',
      render: (row) => formatAdminDateTime(row.createdAt),
    },
    {
      key: 'id',
      id: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex max-w-[360px] flex-wrap gap-1">
          {(row.status === 'submitted' || row.status === 'in_review') && (
            <>
              {row.status === 'submitted' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyId === row.id}
                  onClick={() => void runModerationAction(row.id, { action: 'review' })}
                >
                  İncele
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => openResolve(row)}
              >
                Çöz
              </Button>
              {row.entityType === 'listing' ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => void quickListingAction(row, 'unpublish')}
                  >
                    Yayından kaldır
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busyId === row.id}
                    onClick={() => void quickListingAction(row, 'delete')}
                  >
                    İlanı sil
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyId === row.id}
                onClick={() => void runModerationAction(row.id, { action: 'dismiss' })}
              >
                Reddet
              </Button>
            </>
          )}
          {row.status === 'resolved' && row.entityType === 'listing' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => openResolve(row)}
            >
              İlan aksiyonu
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const isListingResolve = resolveTarget?.entityType === 'listing';
  const resolveAlreadyClosed =
    resolveTarget != null
    && resolveTarget.status !== 'submitted'
    && resolveTarget.status !== 'in_review';

  return (
    <AdminPageShell
      title="Moderasyon"
      description="Canlı şikayet kuyruğu. İlan şikayetlerinde yayından kaldırma, arşivleme veya silme buradan yapılır."
      toolbar={
        <div className="flex w-full flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {sectionCounts.map((item) => (
              <AdminReportCard
                key={item.id}
                title={item.label}
                description={`Bu sayfadaki kayıt: ${item.count} · açık: ${item.openCount}`}
              >
                <p className="text-2xl font-semibold tabular-nums">{item.count}</p>
              </AdminReportCard>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminSearch
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder="id, hedef veya sebep ara…"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                <SelectItem value="submitted">Beklemede</SelectItem>
                <SelectItem value="in_review">İnceleniyor</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="dismissed">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entityFilter}
              onValueChange={(v) => {
                setEntityFilter(v as 'all' | 'listing' | 'user');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Hedef" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm hedefler</SelectItem>
                <SelectItem value="listing">İlan</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    >
      {loading ? (
        <AdminLoadingState />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={rows}
            emptyTitle="Şikayet yok"
            emptyDescription="Henüz canlı şikayet kaydı bulunmuyor. Kullanıcılar ilan detayından şikayet gönderebilir."
          />
          <AdminPagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      <Dialog
        open={resolveOpen}
        onOpenChange={(open) => {
          setResolveOpen(open);
          if (!open) setResolveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {resolveAlreadyClosed ? 'İlan aksiyonu' : 'Şikayeti çöz'}
            </DialogTitle>
            <DialogDescription>
              {isListingResolve
                ? 'Gerekirse ilan üzerinde işlem seçin; ardından şikayet kapatılır.'
                : 'Çözüm notunu girin ve şikayeti kapatın.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {isListingResolve ? (
              <div className="space-y-1.5">
                <Label>İlan aksiyonu</Label>
                <Select
                  value={listingAction}
                  onValueChange={(v) => setListingAction(v as ListingModerationAction)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LISTING_ACTION_LABELS) as ListingModerationAction[]).map(
                      (key) => (
                        <SelectItem key={key} value={key}>
                          {LISTING_ACTION_LABELS[key]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <p className="font-mono text-xs text-muted-foreground">
                  İlan: {resolveTarget?.entityId}
                </p>
              </div>
            ) : null}

            {!resolveAlreadyClosed ? (
              <div className="space-y-1.5">
                <Label htmlFor="resolution-note">Çözüm notu</Label>
                <Textarea
                  id="resolution-note"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Örn. Yanıltıcı içerik nedeniyle yayından kaldırıldı."
                />
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResolveOpen(false);
                setResolveTarget(null);
              }}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              disabled={busyId === resolveTarget?.id || (resolveAlreadyClosed && listingAction === 'none')}
              onClick={() => {
                if (resolveAlreadyClosed && resolveTarget?.entityType === 'listing') {
                  void (async () => {
                    if (listingAction === 'none') return;
                    setBusyId(resolveTarget.id);
                    try {
                      const result = await applyListingAction(
                        resolveTarget.entityId,
                        listingAction,
                      );
                      toast.success(result);
                      setResolveOpen(false);
                      setResolveTarget(null);
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : 'İlan işlemi başarısız',
                      );
                    } finally {
                      setBusyId(null);
                    }
                  })();
                  return;
                }
                void confirmResolve();
              }}
            >
              {resolveAlreadyClosed ? 'Uygula' : 'Kaydet ve çöz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
