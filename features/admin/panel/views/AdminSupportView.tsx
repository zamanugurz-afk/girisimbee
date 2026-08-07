'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import { AdminSupportStats } from '@/features/admin/panel/components/AdminSupportStats';
import {
  AdminSupportFilters,
  type AdminSupportCategoryFilter,
  type AdminSupportOperatorFilter,
  type AdminSupportPriorityFilter,
  type AdminSupportStatusFilter,
} from '@/features/admin/panel/components/AdminSupportFilters';
import { AdminSupportDetailDialog } from '@/features/admin/panel/components/AdminSupportDetailDialog';
import { AdminSupportAssignDialog } from '@/features/admin/panel/components/AdminSupportAssignDialog';
import { AdminSupportReplyDialog } from '@/features/admin/panel/components/AdminSupportReplyDialog';
import {
  ADMIN_SUPPORT_CATEGORY_LABELS,
  ADMIN_SUPPORT_PAGE_SIZE,
  ADMIN_SUPPORT_PRIORITY_LABELS,
  ADMIN_SUPPORT_SECTIONS,
  ADMIN_SUPPORT_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-support.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import {
  MOCK_ADMIN_SUPPORT_STATS,
  MOCK_ADMIN_SUPPORT_TICKETS,
} from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockSupportTicket,
  AdminSupportSection,
  AdminSupportStatus,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneTickets(): AdminMockSupportTicket[] {
  return MOCK_ADMIN_SUPPORT_TICKETS.map((row) => ({
    ...row,
    notes: [...row.notes],
    replies: [...row.replies],
  }));
}

function touch(row: AdminMockSupportTicket): AdminMockSupportTicket {
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

function matchesSection(row: AdminMockSupportTicket, section: AdminSupportSection): boolean {
  switch (section) {
    case 'tickets':
      return row.channel === 'ticket';
    case 'live_chat':
      return row.channel === 'live_chat';
    case 'email_inbox':
      return row.channel === 'email';
    case 'faq':
    case 'operators':
    case 'auto_replies':
      return true;
    default:
      return true;
  }
}

function computeStats(tickets: AdminMockSupportTicket[]) {
  const open_count = tickets.filter((t) => t.status === 'open').length;
  const waiting_count = tickets.filter((t) => t.status === 'waiting').length;
  const resolved_count = tickets.filter((t) => t.status === 'resolved').length;
  const responded = tickets.filter((t) => t.first_response_minutes != null);
  const avg_response_minutes = responded.length
    ? Math.round(
        responded.reduce((sum, t) => sum + (t.first_response_minutes ?? 0), 0)
          / responded.length,
      )
    : MOCK_ADMIN_SUPPORT_STATS.avg_response_minutes;
  const today = new Date().toISOString().slice(0, 10);
  const daily_ticket_count = tickets.filter((t) => t.created_at.startsWith(today)).length
    || MOCK_ADMIN_SUPPORT_STATS.daily_ticket_count;

  return {
    open_count,
    waiting_count,
    resolved_count,
    avg_response_minutes,
    operator_performance: MOCK_ADMIN_SUPPORT_STATS.operator_performance,
    daily_ticket_count,
  };
}

export function AdminSupportView() {
  const [tickets, setTickets] = useState<AdminMockSupportTicket[]>(cloneTickets);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<AdminSupportSection>('tickets');
  const [category, setCategory] = useState<AdminSupportCategoryFilter>('all');
  const [operator, setOperator] = useState<AdminSupportOperatorFilter>('all');
  const [priority, setPriority] = useState<AdminSupportPriorityFilter>('all');
  const [status, setStatus] = useState<AdminSupportStatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminMockSupportTicket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<AdminMockSupportTicket | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<AdminMockSupportTicket | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'note'>('reply');
  const [toast, setToast] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(tickets), [tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = toDayStart(dateFrom);
    const toTs = toDayEnd(dateTo);

    return tickets.filter((row) => {
      if (!matchesSection(row, section)) return false;
      if (category !== 'all' && row.category !== category) return false;
      if (operator === 'unassigned' && row.operator_id) return false;
      if (
        operator !== 'all'
        && operator !== 'unassigned'
        && row.operator_id !== operator
      ) {
        return false;
      }
      if (priority !== 'all' && row.priority !== priority) return false;
      if (status !== 'all' && row.status !== status) return false;

      const createdTs = new Date(row.created_at).getTime();
      if (fromTs !== null && createdTs < fromTs) return false;
      if (toTs !== null && createdTs > toTs) return false;

      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.ticket_id.toLowerCase().includes(q)
        || row.user_id.toLowerCase().includes(q)
        || row.user_name.toLowerCase().includes(q)
        || row.subject.toLowerCase().includes(q)
        || (row.operator_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tickets, query, section, category, operator, priority, status, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_SUPPORT_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_SUPPORT_PAGE_SIZE,
    pageSafe * ADMIN_SUPPORT_PAGE_SIZE,
  );

  const detailLive = detail
    ? tickets.find((row) => row.id === detail.id) ?? detail
    : null;
  const assignLive = assignTarget
    ? tickets.find((row) => row.id === assignTarget.id) ?? assignTarget
    : null;
  const replyLive = replyTarget
    ? tickets.find((row) => row.id === replyTarget.id) ?? replyTarget
    : null;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function patch(
    id: string,
    updater: (row: AdminMockSupportTicket) => AdminMockSupportTicket,
  ) {
    setTickets((prev) =>
      prev.map((row) => (row.id === id ? touch(updater(row)) : row)),
    );
  }

  function setTicketStatus(id: string, next: AdminSupportStatus) {
    patch(id, (row) => ({
      ...row,
      status: next,
      closed_at: next === 'closed' ? new Date().toISOString() : null,
    }));
  }

  const sectionHint =
    section === 'faq'
      ? 'SSS yönetimi — talep listesi referans olarak gösterilir (mock).'
      : section === 'operators'
        ? 'Operatör yönetimi — atama işlemleri üzerinden yönetilir (mock).'
        : section === 'auto_replies'
          ? 'Otomatik yanıtlar — yanıt akışı mock not/yanıt ile simüle edilir.'
          : undefined;

  const columns: AdminTableColumn<AdminMockSupportTicket>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[90px] truncate font-mono text-xs',
    },
    { key: 'ticket_id', header: 'ticket_id', className: 'font-mono text-xs' },
    {
      key: 'user_id',
      header: 'user_id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'operator_id',
      header: 'operator_id',
      className: 'max-w-[100px] truncate font-mono text-xs',
      render: (row) => row.operator_id ?? '—',
    },
    { key: 'subject', header: 'subject', className: 'min-w-[160px]' },
    {
      key: 'category',
      header: 'category',
      render: (row) => ADMIN_SUPPORT_CATEGORY_LABELS[row.category],
    },
    {
      key: 'priority',
      header: 'priority',
      render: (row) => ADMIN_SUPPORT_PRIORITY_LABELS[row.priority],
    },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_SUPPORT_STATUS_LABELS[row.status],
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
      key: 'closed_at',
      header: 'closed_at',
      render: (row) => formatAdminDateTime(row.closed_at),
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
              setAssignTarget(row);
              setAssignOpen(true);
            }}
          >
            Operatör ata
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setReplyTarget(row);
              setReplyMode('note');
              setReplyOpen(true);
            }}
          >
            Not ekle
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setReplyTarget(row);
              setReplyMode('reply');
              setReplyOpen(true);
            }}
          >
            Yanıt ver
          </Button>
          {row.status !== 'closed' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setTicketStatus(row.id, 'closed');
                notify(`Talep kapatıldı: ${row.ticket_id}`);
              }}
            >
              Kapat
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setTicketStatus(row.id, 'open');
                notify(`Talep yeniden açıldı: ${row.ticket_id}`);
              }}
            >
              Yeniden aç
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/admin/users?q=${encodeURIComponent(row.user_id)}`}>
              Kullanıcı profiline git
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Destek Merkezi"
      description="Support Center — mock veri"
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="ticket, kullanıcı veya konu ara…"
            />
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
            {toast ? <p className="text-sm text-primary">{toast}</p> : null}
          </div>
          <AdminSupportFilters
            section={section}
            category={category}
            operator={operator}
            priority={priority}
            status={status}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onSectionChange={(value) => {
              setSection(value);
              setPage(1);
            }}
            onCategoryChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            onOperatorChange={(value) => {
              setOperator(value);
              setPage(1);
            }}
            onPriorityChange={(value) => {
              setPriority(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatus(value);
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
      <AdminSupportStats stats={stats} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_SUPPORT_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="text-left"
            onClick={() => {
              setSection(item.id);
              setPage(1);
            }}
          >
            <AdminReportCard
              title={item.label}
              description={section === item.id ? 'Aktif bölüm' : 'Bölüme geç'}
            >
              <p className="text-sm text-muted-foreground">
                {tickets.filter((row) => matchesSection(row, item.id)).length} kayıt
              </p>
            </AdminReportCard>
          </button>
        ))}
      </div>

      {sectionHint ? (
        <p className="text-sm text-muted-foreground">{sectionHint}</p>
      ) : null}

      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Destek talebi bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun talep yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminSupportDetailDialog
        ticket={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <AdminSupportAssignDialog
        ticket={assignLive}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={(ticketId, operatorId, operatorName) => {
          patch(ticketId, (row) => ({
            ...row,
            operator_id: operatorId,
            operator_name: operatorName,
            status: row.status === 'open' || row.status === 'waiting' ? 'assigned' : row.status,
          }));
          notify(`Operatör atandı: ${operatorName}`);
        }}
      />
      <AdminSupportReplyDialog
        ticket={replyLive}
        open={replyOpen}
        onOpenChange={setReplyOpen}
        mode={replyMode}
        onSave={(ticketId, text, mode) => {
          patch(ticketId, (row) => ({
            ...row,
            notes: mode === 'note' ? [...row.notes, text] : row.notes,
            replies: mode === 'reply' ? [...row.replies, text] : row.replies,
            status:
              mode === 'reply' && row.status === 'open'
                ? 'waiting'
                : row.status,
            first_response_minutes:
              mode === 'reply' && row.first_response_minutes == null
                ? 5
                : row.first_response_minutes,
          }));
          notify(mode === 'reply' ? 'Yanıt kaydedildi' : 'Not eklendi');
        }}
      />
    </AdminPageShell>
  );
}
