'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import {
  AdminPlacementFilters,
  type AdminPlacementStatusFilter,
  type AdminPlacementTypeFilter,
} from '@/features/admin/panel/components/AdminPlacementFilters';
import {
  ADMIN_PLACEMENT_EXTEND_DAYS,
  ADMIN_PLACEMENT_STATUS_LABELS,
  ADMIN_PLACEMENT_TYPE_LABELS,
  ADMIN_PLACEMENTS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-placements.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { calcRemainingDays } from '@/features/admin/panel/lib/placement-dates';
import { PERMISSIONS } from '@/features/authorization/permission.constants';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import type {
  AdminMockPlacement,
  AdminPlacementStatus,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function toDayStart(value: string): number | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function toDayEnd(value: string): number | null {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function normalizeStatus(status: string): AdminPlacementStatus {
  if (
    status === 'active'
    || status === 'pending'
    || status === 'expired'
    || status === 'cancelled'
  ) {
    return status;
  }
  return 'pending';
}

export function AdminPlacementsView() {
  const { hasPermission } = useRbac();
  const canExtendPlacement = hasPermission(PERMISSIONS.LISTINGS_EXTEND);
  const canGrantBoost = hasPermission(PERMISSIONS.LISTINGS_GRANT_BOOST);
  const [placements, setPlacements] = useState<AdminMockPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdminPlacementTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminPlacementStatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/placements');
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { placements?: AdminMockPlacement[] };
      };
      if (!res.ok) throw new Error(json.error ?? 'Vitrinler yüklenemedi');
      setPlacements(
        (json.data?.placements ?? []).map((row) => ({
          ...row,
          status: normalizeStatus(String(row.status)),
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Vitrinler yüklenemedi');
      setPlacements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = toDayStart(dateFrom);
    const toTs = toDayEnd(dateTo);

    return placements.filter((row) => {
      if (typeFilter !== 'all' && row.placement_type !== typeFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      const startedTs = new Date(row.started_at).getTime();
      if (fromTs !== null && startedTs < fromTs) return false;
      if (toTs !== null && startedTs > toTs) return false;

      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.listing_id.toLowerCase().includes(q)
        || row.listing_title.toLowerCase().includes(q)
        || row.owner.toLowerCase().includes(q)
        || row.placement_type.includes(q)
        || row.status.includes(q)
      );
    });
  }, [placements, query, typeFilter, statusFilter, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PLACEMENTS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_PLACEMENTS_PAGE_SIZE,
    pageSafe * ADMIN_PLACEMENTS_PAGE_SIZE,
  );

  async function runAction(id: string, action: 'extend' | 'cancel' | 'reactivate') {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/placements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'İşlem başarısız');
      toast.success(
        action === 'extend'
          ? 'Süre uzatıldı'
          : action === 'cancel'
            ? 'Vitrin iptal edildi'
            : 'Vitrin yeniden etkinleştirildi',
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  const columns: AdminTableColumn<AdminMockPlacement>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'listing_id',
      header: 'listing_id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'listing_title', header: 'listing_title', className: 'min-w-[180px]' },
    { key: 'owner', header: 'owner', className: 'max-w-[110px] truncate font-mono text-xs' },
    {
      key: 'placement_type',
      header: 'placement_type',
      render: (row) => ADMIN_PLACEMENT_TYPE_LABELS[row.placement_type],
    },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_PLACEMENT_STATUS_LABELS[row.status],
    },
    {
      key: 'started_at',
      header: 'started_at',
      render: (row) => formatAdminDateTime(row.started_at),
    },
    {
      key: 'expires_at',
      header: 'expires_at',
      render: (row) => formatAdminDateTime(row.expires_at),
    },
    {
      id: 'remaining_days',
      key: 'expires_at',
      header: 'remaining_days',
      className: 'tabular-nums',
      render: (row) => String(calcRemainingDays(row.expires_at)),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex max-w-[300px] flex-wrap gap-1.5">
          {canExtendPlacement ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void runAction(row.id, 'extend')}
            >
              Süreyi uzat (+{ADMIN_PLACEMENT_EXTEND_DAYS} gün)
            </Button>
          ) : null}
          {row.status !== 'cancelled' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void runAction(row.id, 'cancel')}
            >
              İptal et
            </Button>
          ) : null}
          {canGrantBoost && row.status !== 'active' ? (
            <Button
              type="button"
              size="sm"
              disabled={busyId === row.id}
              onClick={() => void runAction(row.id, 'reactivate')}
            >
              Yeniden etkinleştir
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/admin/listings?q=${encodeURIComponent(row.listing_id)}`}>
              İlana git
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Vitrinler"
      description="Canlı marketplace_listing_placements — süre uzatma ve doping yalnızca süper yönetici."
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="id, ilan, sahip veya paket ara…"
            />
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
              Yenile
            </Button>
          </div>
          <AdminPlacementFilters
            placementType={typeFilter}
            status={statusFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPlacementTypeChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            onDateFromChange={(value) => {
              setDateFrom(value);
              setPage(1);
            }}
            onDateToChange={(value) => {
              setDateTo(value);
              setPage(1);
            }}
          />
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
            emptyTitle="Vitrin bulunamadı"
            emptyDescription="Arama veya filtre kriterlerinize uygun vitrin kaydı yok."
          />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </AdminPageShell>
  );
}
