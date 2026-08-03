'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  ADMIN_LISTING_STATUS_LABELS,
  ADMIN_LISTINGS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-listings.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_LISTINGS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminListingStatus,
  AdminMockListing,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneListings(): AdminMockListing[] {
  return MOCK_ADMIN_LISTINGS.map((listing) => ({ ...listing }));
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

function touch(listing: AdminMockListing): AdminMockListing {
  return { ...listing, updated_at: new Date().toISOString() };
}

export function AdminListingsView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [listings, setListings] = useState<AdminMockListing[]>(cloneListings);
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<AdminListingCategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminListingStatusFilter>('all');
  const [ownerFilter, setOwnerFilter] = useState<AdminListingOwnerFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detailListing, setDetailListing] = useState<AdminMockListing | null>(null);
  const [editListing, setEditListing] = useState<AdminMockListing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const owners = useMemo(
    () => [...new Set(listings.map((listing) => listing.owner))].sort((a, b) => a.localeCompare(b, 'tr')),
    [listings],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = toDayStart(dateFrom);
    const toTs = toDayEnd(dateTo);

    return listings.filter((listing) => {
      if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
      if (ownerFilter !== 'all' && listing.owner !== ownerFilter) return false;

      const createdTs = new Date(listing.created_at).getTime();
      if (fromTs !== null && createdTs < fromTs) return false;
      if (toTs !== null && createdTs > toTs) return false;

      if (!q) return true;
      return (
        listing.id.toLowerCase().includes(q)
        || listing.title.toLowerCase().includes(q)
        || listing.category.toLowerCase().includes(q)
        || listing.owner.toLowerCase().includes(q)
        || listing.status.includes(q)
      );
    });
  }, [listings, query, categoryFilter, statusFilter, ownerFilter, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_LISTINGS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_LISTINGS_PAGE_SIZE,
    pageSafe * ADMIN_LISTINGS_PAGE_SIZE,
  );

  const detailLive = detailListing
    ? listings.find((item) => item.id === detailListing.id) ?? detailListing
    : null;
  const editLive = editListing
    ? listings.find((item) => item.id === editListing.id) ?? editListing
    : null;

  function patchListing(
    listingId: string,
    updater: (listing: AdminMockListing) => AdminMockListing,
  ) {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId ? touch(updater(listing)) : listing,
      ),
    );
  }

  function setStatus(listingId: string, status: AdminListingStatus) {
    patchListing(listingId, (listing) => ({ ...listing, status }));
  }

  function handleSave(listingId: string, draft: AdminListingEditDraft) {
    patchListing(listingId, (listing) => ({
      ...listing,
      title: draft.title.trim() || listing.title,
      category: draft.category || listing.category,
      owner: draft.owner || listing.owner,
      status: draft.status,
    }));
  }

  function openDetail(listing: AdminMockListing) {
    setDetailListing(listing);
    setDetailOpen(true);
  }

  function openEdit(listing: AdminMockListing) {
    setEditListing(listing);
    setEditOpen(true);
  }

  const columns: AdminTableColumn<AdminMockListing>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'title', header: 'title', className: 'min-w-[180px]' },
    { key: 'category', header: 'category' },
    { key: 'owner', header: 'owner' },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_LISTING_STATUS_LABELS[row.status],
    },
    {
      key: 'view_count',
      header: 'view_count',
      className: 'tabular-nums',
    },
    {
      key: 'favorite_count',
      header: 'favorite_count',
      className: 'tabular-nums',
    },
    {
      key: 'created_at',
      header: 'created_at',
      render: (row) => formatAdminDateTime(row.created_at),
    },
    {
      key: 'updated_at',
      header: 'updated_at',
      render: (row) => formatAdminDateTime(row.updated_at),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex max-w-[320px] flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => openDetail(row)}>
            Detay
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
            Düzenle
          </Button>
          {row.status === 'active' || row.status === 'pending' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatus(row.id, 'suspended')}
            >
              Yayından kaldır
            </Button>
          ) : null}
          {row.status !== 'active' && row.status !== 'deleted' ? (
            <Button type="button" size="sm" onClick={() => setStatus(row.id, 'active')}>
              Yeniden yayınla
            </Button>
          ) : null}
          {!row.is_featured ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                patchListing(row.id, (listing) => ({
                  ...listing,
                  is_featured: true,
                  status: listing.status === 'deleted' ? listing.status : 'active',
                }))
              }
            >
              Vitrine taşı
            </Button>
          ) : null}
          {!row.is_urgent ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                patchListing(row.id, (listing) => ({
                  ...listing,
                  is_urgent: true,
                  status: listing.status === 'deleted' ? listing.status : 'active',
                }))
              }
            >
              Acil vitrin
            </Button>
          ) : null}
          {row.status !== 'deleted' ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() =>
                patchListing(row.id, (listing) => ({
                  ...listing,
                  status: 'deleted',
                  is_featured: false,
                  is_urgent: false,
                }))
              }
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
      description="İlan yönetimi — mock veri (arama, filtre, düzenleme, vitrin aksiyonları)"
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
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
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
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="İlan bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun ilan yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminListingDetailDialog
        listing={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(listing) => openEdit(listing)}
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
