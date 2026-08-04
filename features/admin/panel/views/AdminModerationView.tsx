'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import {
  AdminComplaintFilters,
  type AdminComplaintSectionFilter,
  type AdminComplaintStatusFilter,
} from '@/features/admin/panel/components/AdminComplaintFilters';
import { AdminComplaintDetailDialog } from '@/features/admin/panel/components/AdminComplaintDetailDialog';
import {
  ADMIN_COMPLAINT_ASSIGNEES,
  ADMIN_COMPLAINT_SECTIONS,
  ADMIN_COMPLAINT_STATUS_LABELS,
  ADMIN_COMPLAINT_TYPE_LABELS,
  ADMIN_COMPLAINTS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-complaints.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_COMPLAINTS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminComplaintStatus,
  AdminMockComplaint,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneComplaints(): AdminMockComplaint[] {
  return MOCK_ADMIN_COMPLAINTS.map((row) => ({ ...row }));
}

export function AdminModerationView() {
  const [complaints, setComplaints] = useState<AdminMockComplaint[]>(cloneComplaints);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<AdminComplaintSectionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminComplaintStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminMockComplaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<AdminMockComplaint | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigneeDraft, setAssigneeDraft] = useState<string>(ADMIN_COMPLAINT_ASSIGNEES[0]);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((row) => {
      if (section !== 'all' && row.report_type !== section) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q)
        || row.target_id.toLowerCase().includes(q)
        || row.reporter.toLowerCase().includes(q)
        || row.reason.toLowerCase().includes(q)
        || row.description.toLowerCase().includes(q)
        || row.report_type.includes(q)
        || row.status.includes(q)
      );
    });
  }, [complaints, query, section, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_COMPLAINTS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_COMPLAINTS_PAGE_SIZE,
    pageSafe * ADMIN_COMPLAINTS_PAGE_SIZE,
  );

  const sectionCounts = useMemo(() => {
    return ADMIN_COMPLAINT_SECTIONS.map((item) => ({
      ...item,
      count: complaints.filter((c) => c.report_type === item.id).length,
      openCount: complaints.filter(
        (c) =>
          c.report_type === item.id
          && (c.status === 'pending' || c.status === 'reviewing'),
      ).length,
    }));
  }, [complaints]);

  const detailLive = detail
    ? complaints.find((c) => c.id === detail.id) ?? detail
    : null;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function patchComplaint(
    id: string,
    updater: (row: AdminMockComplaint) => AdminMockComplaint,
  ) {
    setComplaints((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  }

  function setStatus(id: string, status: AdminComplaintStatus) {
    patchComplaint(id, (row) => ({ ...row, status }));
  }

  function openDetail(row: AdminMockComplaint) {
    setDetail(row);
    setDetailOpen(true);
  }

  function openAssign(row: AdminMockComplaint) {
    setAssignTarget(row);
    setAssigneeDraft(row.assignee ?? ADMIN_COMPLAINT_ASSIGNEES[0]);
    setAssignOpen(true);
  }

  const columns: AdminTableColumn<AdminMockComplaint>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    {
      key: 'report_type',
      header: 'report_type',
      render: (row) => ADMIN_COMPLAINT_TYPE_LABELS[row.report_type],
    },
    {
      key: 'target_id',
      header: 'target_id',
      className: 'max-w-[110px] truncate font-mono text-xs',
    },
    { key: 'reporter', header: 'reporter' },
    { key: 'reason', header: 'reason', className: 'min-w-[140px]' },
    {
      key: 'description',
      header: 'description',
      className: 'min-w-[200px] max-w-[280px] truncate',
    },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_COMPLAINT_STATUS_LABELS[row.status],
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
        <div className="flex max-w-[320px] flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => openDetail(row)}>
            Görüntüle
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setStatus(row.id, 'reviewing');
              notify(`Kullanıcı engellendi (mock): ${row.target_id}`);
            }}
          >
            Kullanıcıyı engelle
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setStatus(row.id, 'reviewing');
              notify(`İlan kaldırıldı (mock): ${row.target_id}`);
            }}
          >
            İlanı kaldır
          </Button>
          {row.status !== 'approved' && row.status !== 'rejected' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setStatus(row.id, 'approved');
                notify('Şikâyet kapatıldı');
              }}
            >
              Şikâyeti kapat
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => openAssign(row)}>
            Yöneticiye ata
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Şikâyetler / Moderasyon"
      description="Reports & Complaints — mock veri"
      toolbar={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href="/admin/moderation/content">Şüpheli içerik kuyruğu</Link>
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href="/admin/moderation/words">Küfür listesi</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="id, reporter, reason veya target ara…"
            />
            <p className="text-sm text-muted-foreground">{filtered.length} kayıt</p>
            {toast ? <p className="text-sm text-primary">{toast}</p> : null}
          </div>
          <AdminComplaintFilters
            section={section}
            status={statusFilter}
            onSectionChange={(value) => {
              setSection(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
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
            onClick={() => {
              setSection(item.id);
              setPage(1);
            }}
            className="text-left"
          >
            <AdminReportCard title={item.label} description={`${item.openCount} açık / ${item.count} toplam`}>
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
        emptyTitle="Şikâyet bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun şikâyet yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminComplaintDetailDialog
        complaint={detailLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yöneticiye ata</DialogTitle>
            <DialogDescription>
              Şikâyeti bir yöneticiye ata (mock oturum state).
            </DialogDescription>
          </DialogHeader>
          <Select value={assigneeDraft} onValueChange={setAssigneeDraft}>
            <SelectTrigger aria-label="Yönetici seç">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_COMPLAINT_ASSIGNEES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              İptal
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!assignTarget) return;
                patchComplaint(assignTarget.id, (row) => ({
                  ...row,
                  assignee: assigneeDraft,
                  status: row.status === 'pending' ? 'reviewing' : row.status,
                }));
                setAssignOpen(false);
                notify(`Atandı: ${assigneeDraft}`);
              }}
            >
              Ata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
