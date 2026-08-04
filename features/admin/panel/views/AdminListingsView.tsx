'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import {
  AdminListingFilters,
  type AdminListingCategoryFilter,
  type AdminListingOwnerFilter,
  type AdminListingStatusFilter,
} from '@/features/admin/panel/components/AdminListingFilters';
import { AdminListingDetailDialog } from '@/features/admin/panel/components/AdminListingDetailDialog';
import {
  AdminListingEditDialog,
  type AdminListingEditDraft,
} from '@/features/admin/panel/components/AdminListingEditDialog';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import {
  ADMIN_LISTING_STATUS_LABELS,
  ADMIN_LISTINGS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-listings.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { mapListingToAdminRow } from '@/features/admin/panel/lib/map-live-admin';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type {
  AdminMockListing,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';
import type { ListingId } from '@/lib/domain/ids';

function toApiListingStatus(filter: AdminListingStatusFilter): ListingStatus | undefined {
  switch (filter) {
    case 'active':
      return 'published';
    case 'pending':
      return 'pending_review';
    case 'draft':
      return 'draft';
    case 'suspended':
      return 'paused';
    case 'deleted':
      return 'archived';
    default:
      return undefined;
  }
}

export function AdminListingsView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [listings, setListings] = useState<AdminMockListing[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<AdminListingCategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminListingStatusFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState<AdminListingOwnerFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailListing, setDetailListing] = useState<AdminMockListing | null>(null);
  const [editListing, setEditListing] = useState<AdminMockListing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.searchListings(
        {
          query: debouncedQuery.trim() || undefined,
          status: toApiListingStatus(statusFilter),
        },
        { page, limit: ADMIN_LISTINGS_PAGE_SIZE },
      );
      let rows = result.data.map(mapListingToAdminRow);

      if (categoryFilter !== 'all') {
        rows = rows.filter((row) => row.category === categoryFilter);
      }
      if (ownerFilter !== 'all') {
        rows = rows.filter((row) => row.owner === ownerFilter);
      }
      if (dateFrom) {
        const fromTs = new Date(`${dateFrom}T00:00:00.000Z`).getTime();
        rows = rows.filter((row) => new Date(row.created_at).getTime() >= fromTs);
      }
      if (dateTo) {
        const toTs = new Date(`${dateTo}T23:59:59.999Z`).getTime();
        rows = rows.filter((row) => new Date(row.created_at).getTime() <= toTs);
      }

      setListings(rows);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İlanlar yüklenemedi');
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, categoryFilter, ownerFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const owners = useMemo(
    () => [...new Set(listings.map((listing) => listing.owner))].sort((a, b) => a.localeCompare(b, 'tr')),
    [listings],
  );

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_LISTINGS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);

  const detailLive = detailListing
    ? listings.find((item) => item.id === detailListing.id) ?? detailListing
    : null;
  const editLive = editListing
    ? listings.find((item) => item.id === editListing.id) ?? editListing
    : null;

  async function runListingAction(
    listingId: string,
    action:
      | { action: 'approve' }
      | { action: 'unpublish' }
      | { action: 'delete' }
      | { action: 'feature'; featuredUntil?: string }
      | { action: 'mark_urgent'; urgentUntil?: string },
  ) {
    setBusyId(listingId);
    try {
      await adminApi.patchListing(listingId as ListingId, action);
      toast.success('İşlem tamamlandı');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  function handleSave(_listingId: string, _draft: AdminListingEditDraft) {
    toast.message('Başlık/kategori düzenleme için ilan detay sayfasını kullanın. Durum aksiyonları canlıdır.');
  }

  const columns: AdminTableColumn<AdminMockListing>[] = [
    {
      key: 'id',
      header: 'ID',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'title', header: 'Başlık', className: 'min-w-[180px]' },
    { key: 'category', header: 'Kategori' },
    { key: 'owner', header: 'Sahip', className: 'max-w-[120px] truncate font-mono text-xs' },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => ADMIN_LISTING_STATUS_LABELS[row.status],
    },
    {
      key: 'view_count',
      header: 'Görüntülenme',
      className: 'tabular-nums',
    },
    {
      key: 'favorite_count',
      header: 'Favori',
      className: 'tabular-nums',
    },
    {
      key: 'created_at',
      header: 'Oluşturulma',
      render: (row) => formatAdminDateTime(row.created_at),
    },
    {
      key: 'updated_at',
      header: 'Güncelleme',
      render: (row) => formatAdminDateTime(row.updated_at),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex max-w-[320px] flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDetailListing(row);
              setDetailOpen(true);
            }}
          >
            Detay
          </Button>
          {(row.status === 'active' || row.status === 'pending') ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void runListingAction(row.id, { action: 'unpublish' })}
            >
              Yayından kaldır
            </Button>
          ) : null}
          {row.status !== 'active' && row.status !== 'deleted' ? (
            <Button
              type="button"
              size="sm"
              disabled={busyId === row.id}
              onClick={() => void runListingAction(row.id, { action: 'approve' })}
            >
              Yayınla
            </Button>
          ) : null}
          {!row.is_featured ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void runListingAction(row.id, { action: 'feature' })}
            >
              Vitrine taşı
            </Button>
          ) : null}
          {!row.is_urgent ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void runListingAction(row.id, { action: 'mark_urgent' })}
            >
              Acil vitrin
            </Button>
          ) : null}
          {row.status !== 'deleted' ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busyId === row.id}
              onClick={() => {
                if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
                void runListingAction(row.id, { action: 'delete' });
              }}
            >
              Sil
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="İlanlar"
      description="Canlı ilan yönetimi — marketplace_listings üzerinden."
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="id, başlık, kategori veya sahip ara…"
            />
            <p className="text-sm text-muted-foreground">{total} kayıt</p>
          </div>
          <AdminListingFilters
            category={categoryFilter}
            status={statusFilter}
            owner={ownerFilter}
            owners={owners}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onCategoryChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            onOwnerChange={(value) => {
              setOwnerFilter(value);
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
            rows={listings}
            emptyTitle="İlan bulunamadı"
            emptyDescription="Arama veya filtre kriterlerinize uygun ilan yok."
          />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      <AdminListingDetailDialog
        listing={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(listing) => {
          setEditListing(listing);
          setEditOpen(true);
        }}
      />
      <AdminListingEditDialog
        listing={editLive}
        open={editOpen}
        onOpenChange={setEditOpen}
        owners={owners}
        onSave={handleSave}
      />
    </AdminPageShell>
  );
}
