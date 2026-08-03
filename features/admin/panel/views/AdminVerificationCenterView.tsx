'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import {
  AdminVerificationFilters,
  type AdminVerificationStatusFilter,
  type AdminVerificationTypeFilter,
} from '@/features/admin/panel/components/AdminVerificationFilters';
import { AdminVerificationDetailDialog } from '@/features/admin/panel/components/AdminVerificationDetailDialog';
import { AdminVerificationNoteDialog } from '@/features/admin/panel/components/AdminVerificationNoteDialog';
import {
  ADMIN_VERIFICATION_STATUS_LABELS,
  ADMIN_VERIFICATION_TYPE_LABELS,
  ADMIN_VERIFICATIONS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-verifications.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_VERIFICATIONS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockVerification,
  AdminTableColumn,
  AdminVerificationStatus,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneVerifications(): AdminMockVerification[] {
  return MOCK_ADMIN_VERIFICATIONS.map((row) => ({ ...row }));
}

function touch(row: AdminMockVerification): AdminMockVerification {
  return { ...row, updated_at: new Date().toISOString() };
}

export function AdminVerificationCenterView() {
  const [rowsState, setRowsState] = useState<AdminMockVerification[]>(cloneVerifications);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdminVerificationTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminVerificationStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminMockVerification | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<AdminMockVerification | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rowsState.filter((row) => {
      if (typeFilter !== 'all' && row.verification_type !== typeFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.user_id.toLowerCase().includes(q)
        || row.full_name.toLowerCase().includes(q)
        || row.verification_type.includes(q)
        || row.status.includes(q)
        || (row.note?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rowsState, query, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_VERIFICATIONS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_VERIFICATIONS_PAGE_SIZE,
    pageSafe * ADMIN_VERIFICATIONS_PAGE_SIZE,
  );

  const detailLive = detail
    ? rowsState.find((row) => row.id === detail.id) ?? detail
    : null;
  const noteLive = noteTarget
    ? rowsState.find((row) => row.id === noteTarget.id) ?? noteTarget
    : null;

  function patch(
    id: string,
    updater: (row: AdminMockVerification) => AdminMockVerification,
  ) {
    setRowsState((prev) =>
      prev.map((row) => (row.id === id ? touch(updater(row)) : row)),
    );
  }

  function setStatus(id: string, status: AdminVerificationStatus) {
    patch(id, (row) => ({ ...row, status }));
  }

  const columns: AdminTableColumn<AdminMockVerification>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'user_id',
      header: 'user_id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'full_name', header: 'full_name' },
    {
      key: 'verification_type',
      header: 'verification_type',
      render: (row) => ADMIN_VERIFICATION_TYPE_LABELS[row.verification_type],
    },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_VERIFICATION_STATUS_LABELS[row.status],
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
        <div className="flex max-w-[280px] flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDetail(row);
              setDetailOpen(true);
            }}
          >
            Görüntüle
          </Button>
          {row.status !== 'approved' ? (
            <Button type="button" size="sm" onClick={() => setStatus(row.id, 'approved')}>
              Onayla
            </Button>
          ) : null}
          {row.status !== 'rejected' ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setStatus(row.id, 'rejected')}
            >
              Reddet
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setNoteTarget(row);
              setNoteOpen(true);
            }}
          >
            Not ekle
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Doğrulama Merkezi"
      description="Verification Center — mock veri"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <AdminSearch
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="id, user_id veya ad ara…"
          />
          <AdminVerificationFilters
            type={typeFilter}
            status={statusFilter}
            onTypeChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
          <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
        </div>
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Doğrulama bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun kayıt yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminVerificationDetailDialog
        verification={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <AdminVerificationNoteDialog
        verification={noteLive}
        open={noteOpen}
        onOpenChange={setNoteOpen}
        onSave={(id, note) => {
          patch(id, (row) => ({
            ...row,
            note: note || null,
            status: row.status === 'pending' ? 'reviewing' : row.status,
          }));
        }}
      />
    </AdminPageShell>
  );
}
