'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminTableColumn } from '@/features/admin/panel/types/admin-panel.types';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';

const PAGE_SIZE = 20;

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function AdminPaymentsView() {
  const [rows, setRows] = useState<MarketplacePayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listPayments({}, { page, limit: PAGE_SIZE });
      setRows(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ödemeler yüklenemedi');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: AdminTableColumn<MarketplacePayment>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'userId',
      header: 'user',
      className: 'max-w-[120px] truncate font-mono text-xs',
    },
    { key: 'purpose', header: 'purpose' },
    { key: 'status', header: 'status' },
    {
      key: 'amountCents',
      header: 'amount',
      render: (row) => formatAmount(row.amountCents, row.currency),
    },
    {
      key: 'paidAt',
      header: 'paid_at',
      render: (row) => formatAdminDateTime(row.paidAt),
    },
    {
      key: 'createdAt',
      header: 'created_at',
      render: (row) => formatAdminDateTime(row.createdAt),
    },
  ];

  return (
    <AdminPageShell
      title="Ödeme Merkezi"
      description="Canlı ödemeler — marketplace_payments üzerinden."
    >
      {loading ? (
        <AdminLoadingState />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} ödeme kaydı</p>
          <AdminTable
            columns={columns}
            rows={rows}
            emptyTitle="Ödeme bulunamadı"
            emptyDescription="Henüz kayıtlı ödeme yok."
          />
          <AdminPagination page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </AdminPageShell>
  );
}
