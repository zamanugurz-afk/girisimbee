'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import {
  AdminLogFilters,
  type AdminLogCategoryFilter,
  type AdminLogStatusFilter,
} from '@/features/admin/panel/components/AdminLogFilters';
import { AdminLogDetailDialog } from '@/features/admin/panel/components/AdminLogDetailDialog';
import {
  ADMIN_LOG_STATUS_LABELS,
  ADMIN_LOGS_PAGE_SIZE,
  type AdminLogSortDir,
  type AdminLogSortField,
} from '@/features/admin/panel/constants/admin-logs.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_LOGS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockLog,
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

function exportLogsCsv(rows: AdminMockLog[]): void {
  const header = [
    'id',
    'category',
    'event_type',
    'actor',
    'target',
    'ip_address',
    'status',
    'created_at',
    'details',
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.category,
        row.event_type,
        row.actor,
        row.target,
        row.ip_address,
        row.status,
        row.created_at,
        row.details,
      ]
        .map((cell) => escape(String(cell)))
        .join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `admin-logs-mock-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminLogsView() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AdminLogCategoryFilter>('all');
  const [status, setStatus] = useState<AdminLogStatusFilter>('all');
  const [sortField, setSortField] = useState<AdminLogSortField>('created_at');
  const [sortDir, setSortDir] = useState<AdminLogSortDir>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminMockLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = toDayStart(dateFrom);
    const toTs = toDayEnd(dateTo);

    const rows = MOCK_ADMIN_LOGS.filter((row) => {
      if (category !== 'all' && row.category !== category) return false;
      if (status !== 'all' && row.status !== status) return false;

      const createdTs = new Date(row.created_at).getTime();
      if (fromTs !== null && createdTs < fromTs) return false;
      if (toTs !== null && createdTs > toTs) return false;

      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.event_type.toLowerCase().includes(q)
        || row.actor.toLowerCase().includes(q)
        || row.target.toLowerCase().includes(q)
        || row.ip_address.toLowerCase().includes(q)
        || row.category.includes(q)
        || row.status.includes(q)
        || row.details.toLowerCase().includes(q)
      );
    });

    const sorted = [...rows].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = String(av).localeCompare(String(bv), 'tr', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [query, category, status, sortField, sortDir, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_LOGS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (pageSafe - 1) * ADMIN_LOGS_PAGE_SIZE,
    pageSafe * ADMIN_LOGS_PAGE_SIZE,
  );

  const columns: AdminTableColumn<AdminMockLog>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'event_type', header: 'event_type', className: 'min-w-[140px]' },
    { key: 'actor', header: 'actor' },
    { key: 'target', header: 'target', className: 'max-w-[140px] truncate' },
    { key: 'ip_address', header: 'ip_address', className: 'font-mono text-xs' },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_LOG_STATUS_LABELS[row.status],
    },
    {
      key: 'created_at',
      header: 'created_at',
      render: (row) => formatAdminDateTime(row.created_at),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setDetail(row);
            setDetailOpen(true);
          }}
        >
          Detay
        </Button>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Sistem kayıtları"
      description="Logs — mock veri (filtre, sıralama, dışa aktarma)"
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="id, event, actor, target veya IP ara…"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                exportLogsCsv(filtered);
                setToast(`${filtered.length} kayıt CSV olarak dışa aktarıldı (mock)`);
                window.setTimeout(() => setToast(null), 2500);
              }}
            >
              Dışa aktar (CSV)
            </Button>
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
            {toast ? <p className="text-sm text-primary">{toast}</p> : null}
          </div>
          <AdminLogFilters
            category={category}
            status={status}
            sortField={sortField}
            sortDir={sortDir}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onCategoryChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            onSortFieldChange={(value) => {
              setSortField(value);
              setPage(1);
            }}
            onSortDirChange={(value) => {
              setSortDir(value);
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
        rows={pageRows}
        emptyTitle="Kayıt bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun log yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminLogDetailDialog log={detail} open={detailOpen} onOpenChange={setDetailOpen} />
    </AdminPageShell>
  );
}
