'use client';

import { useMemo, useState } from 'react';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { MOCK_ADMIN_NOTIFICATIONS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockNotification,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

const PAGE_SIZE = 5;

const columns: AdminTableColumn<AdminMockNotification>[] = [
  { key: 'title', header: 'Başlık' },
  { key: 'audience', header: 'Hedef' },
  { key: 'channel', header: 'Kanal' },
  { key: 'status', header: 'Durum' },
  { key: 'createdAt', header: 'Tarih' },
];

export function AdminNotificationsView() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_ADMIN_NOTIFICATIONS;
    return MOCK_ADMIN_NOTIFICATIONS.filter(
      (n) =>
        n.title.toLowerCase().includes(q)
        || n.audience.toLowerCase().includes(q)
        || n.channel.includes(q)
        || n.status.includes(q),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <AdminPageShell
      title="Bildirimler"
      description="Bildirim gönderimi — mock veriler"
      toolbar={
        <AdminSearch
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Bildirim ara…"
        />
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Bildirim bulunamadı"
        emptyDescription="Arama kriterlerinize uygun bildirim yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
    </AdminPageShell>
  );
}
