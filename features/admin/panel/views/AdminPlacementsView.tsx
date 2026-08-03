'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
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
import {
  calcRemainingDays,
  extendExpiresAt,
} from '@/features/admin/panel/lib/placement-dates';
import { MOCK_ADMIN_PLACEMENTS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockPlacement,
  AdminPlacementStatus,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function clonePlacements(): AdminMockPlacement[] {
  return MOCK_ADMIN_PLACEMENTS.map((row) => ({ ...row }));
}

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

export function AdminPlacementsView() {
  const [placements, setPlacements] = useState<AdminMockPlacement[]>(clonePlacements);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdminPlacementTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminPlacementStatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

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

  function patchPlacement(
    id: string,
    updater: (row: AdminMockPlacement) => AdminMockPlacement,
  ) {
    setPlacements((prev) =>
      prev.map((row) => (row.id === id ? updater(row) : row)),
    );
  }

  function extendDuration(id: string) {
    patchPlacement(id, (row) => ({
      ...row,
      expires_at: extendExpiresAt(row.expires_at, ADMIN_PLACEMENT_EXTEND_DAYS),
      status: row.status === 'expired' || row.status === 'cancelled' ? 'active' : row.status,
    }));
  }

  function setStatus(id: string, status: AdminPlacementStatus) {
    patchPlacement(id, (row) => {
      if (status === 'active') {
        const expires_at =
          calcRemainingDays(row.expires_at) === 0
            ? extendExpiresAt(row.expires_at, ADMIN_PLACEMENT_EXTEND_DAYS)
            : row.expires_at;
        return { ...row, status, expires_at };
      }
      return { ...row, status };
    });
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
    { key: 'owner', header: 'owner' },
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => extendDuration(row.id)}
          >
            Süreyi uzat
          </Button>
          {row.status !== 'cancelled' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatus(row.id, 'cancelled')}
            >
              İptal et
            </Button>
          ) : null}
          {row.status !== 'active' ? (
            <Button type="button" size="sm" onClick={() => setStatus(row.id, 'active')}>
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
      description="Vitrin ve Acil Vitrin yönetimi — mock veri"
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
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Vitrin bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun vitrin kaydı yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
    </AdminPageShell>
  );
}
