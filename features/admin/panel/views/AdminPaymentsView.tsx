'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import {
  AdminPaymentFilters,
  type AdminPaymentMethodFilter,
  type AdminPaymentPackageFilter,
  type AdminPaymentStatusFilter,
  type AdminPaymentUserFilter,
} from '@/features/admin/panel/components/AdminPaymentFilters';
import { AdminPaymentDetailDialog } from '@/features/admin/panel/components/AdminPaymentDetailDialog';
import { AdminInvoiceDialog } from '@/features/admin/panel/components/AdminInvoiceDialog';
import {
  ADMIN_PAYMENT_METHOD_LABELS,
  ADMIN_PAYMENT_PACKAGE_LABELS,
  ADMIN_PAYMENT_SECTIONS,
  ADMIN_PAYMENT_STATUS_LABELS,
  ADMIN_PAYMENTS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-payments.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_PAYMENTS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockPayment,
  AdminPaymentSection,
  AdminPaymentStatus,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function clonePayments(): AdminMockPayment[] {
  return MOCK_ADMIN_PAYMENTS.map((row) => ({ ...row }));
}

function touch(row: AdminMockPayment): AdminMockPayment {
  return { ...row, updated_at: new Date().toISOString() };
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

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function matchesSection(row: AdminMockPayment, section: AdminPaymentSection): boolean {
  switch (section) {
    case 'payments':
      return true;
    case 'refunds':
      return row.status === 'refunded';
    case 'commissions':
      return row.status === 'completed' || row.status === 'refunded';
    case 'invoices':
      return Boolean(row.invoice_number);
    case 'failed':
      return row.status === 'failed';
    case 'pending':
      return row.status === 'pending';
    default:
      return true;
  }
}

export function AdminPaymentsView() {
  const [payments, setPayments] = useState<AdminMockPayment[]>(clonePayments);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<AdminPaymentSection>('payments');
  const [userFilter, setUserFilter] = useState<AdminPaymentUserFilter>('all');
  const [listingId, setListingId] = useState('');
  const [packageType, setPackageType] = useState<AdminPaymentPackageFilter>('all');
  const [paymentMethod, setPaymentMethod] = useState<AdminPaymentMethodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminPaymentStatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminMockPayment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [invoice, setInvoice] = useState<AdminMockPayment | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const users = useMemo(
    () =>
      [...new Set(payments.map((row) => row.user_name))].sort((a, b) =>
        a.localeCompare(b, 'tr'),
      ),
    [payments],
  );

  const sectionCounts = useMemo(
    () =>
      ADMIN_PAYMENT_SECTIONS.map((item) => ({
        ...item,
        count: payments.filter((row) => matchesSection(row, item.id)).length,
      })),
    [payments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const listingQ = listingId.trim().toLowerCase();
    const fromTs = toDayStart(dateFrom);
    const toTs = toDayEnd(dateTo);

    return payments.filter((row) => {
      if (!matchesSection(row, section)) return false;
      if (userFilter !== 'all' && row.user_name !== userFilter) return false;
      if (listingQ && !row.listing_id.toLowerCase().includes(listingQ)) return false;
      if (packageType !== 'all' && row.package_type !== packageType) return false;
      if (paymentMethod !== 'all' && row.payment_method !== paymentMethod) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      const createdTs = new Date(row.created_at).getTime();
      if (fromTs !== null && createdTs < fromTs) return false;
      if (toTs !== null && createdTs > toTs) return false;

      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.user_id.toLowerCase().includes(q)
        || row.user_name.toLowerCase().includes(q)
        || row.listing_id.toLowerCase().includes(q)
        || row.invoice_number.toLowerCase().includes(q)
        || row.package_type.includes(q)
        || row.status.includes(q)
      );
    });
  }, [
    payments,
    query,
    section,
    userFilter,
    listingId,
    packageType,
    paymentMethod,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAYMENTS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_PAYMENTS_PAGE_SIZE,
    pageSafe * ADMIN_PAYMENTS_PAGE_SIZE,
  );

  const detailLive = detail
    ? payments.find((row) => row.id === detail.id) ?? detail
    : null;
  const invoiceLive = invoice
    ? payments.find((row) => row.id === invoice.id) ?? invoice
    : null;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function patch(
    id: string,
    updater: (row: AdminMockPayment) => AdminMockPayment,
  ) {
    setPayments((prev) =>
      prev.map((row) => (row.id === id ? touch(updater(row)) : row)),
    );
  }

  function setStatus(id: string, status: AdminPaymentStatus) {
    patch(id, (row) => ({ ...row, status }));
  }

  const columns: AdminTableColumn<AdminMockPayment>[] = [
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
    {
      key: 'listing_id',
      header: 'listing_id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'package_type',
      header: 'package_type',
      render: (row) => ADMIN_PAYMENT_PACKAGE_LABELS[row.package_type],
    },
    {
      key: 'amount',
      header: section === 'commissions' ? 'commission' : 'amount',
      className: 'tabular-nums',
      render: (row) =>
        formatMoney(
          section === 'commissions' ? row.commission_amount : row.amount,
          row.currency,
        ),
    },
    { key: 'currency', header: 'currency' },
    {
      key: 'payment_method',
      header: 'payment_method',
      render: (row) => ADMIN_PAYMENT_METHOD_LABELS[row.payment_method],
    },
    { key: 'invoice_number', header: 'invoice_number' },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_PAYMENT_STATUS_LABELS[row.status],
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
        <div className="flex max-w-[340px] flex-wrap gap-1.5">
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDetail(row);
              setDetailOpen(true);
            }}
          >
            Ödeme ayrıntısı
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setInvoice(row);
              setInvoiceOpen(true);
            }}
          >
            Fatura ayrıntısı
          </Button>
          {row.status === 'completed' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus(row.id, 'refunded');
                notify(`İade başlatıldı (mock): ${row.id}`);
              }}
            >
              İade başlat
            </Button>
          ) : null}
          {row.status === 'failed' || row.status === 'cancelled' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setStatus(row.id, 'pending');
                notify(`Tekrar denendi (mock): ${row.id}`);
              }}
            >
              Tekrar dene
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/admin/users?q=${encodeURIComponent(row.user_id)}`}>
              Kullanıcıya git
            </Link>
          </Button>
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
      title="Ödeme Merkezi"
      description="Payment Center — mock veri (sağlayıcı entegrasyonu yok)"
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="id, user, listing veya fatura ara…"
            />
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
            {toast ? <p className="text-sm text-primary">{toast}</p> : null}
          </div>
          <AdminPaymentFilters
            section={section}
            user={userFilter}
            users={users}
            listingId={listingId}
            packageType={packageType}
            paymentMethod={paymentMethod}
            status={statusFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onSectionChange={(value) => {
              setSection(value);
              setPage(1);
            }}
            onUserChange={(value) => {
              setUserFilter(value);
              setPage(1);
            }}
            onListingIdChange={(value) => {
              setListingId(value);
              setPage(1);
            }}
            onPackageTypeChange={(value) => {
              setPackageType(value);
              setPage(1);
            }}
            onPaymentMethodChange={(value) => {
              setPaymentMethod(value);
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sectionCounts.map((item) => (
          <button
            key={item.id}
            type="button"
            className="text-left"
            onClick={() => {
              setSection(item.id);
              setPage(1);
            }}
          >
            <AdminReportCard title={item.label} description="Mock bölüm">
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
                {item.count}
              </p>
            </AdminReportCard>
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Ödeme bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun işlem yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminPaymentDetailDialog
        payment={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onOpenInvoice={(row) => {
          setInvoice(row);
          setInvoiceOpen(true);
        }}
      />
      <AdminInvoiceDialog
        payment={invoiceLive}
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
      />
    </AdminPageShell>
  );
}
