'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminTableColumn } from '@/features/admin/panel/types/admin-panel.types';

const PAGE_SIZE = 10;

type LiveNotification = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function AdminNotificationsView() {
  const [items, setItems] = useState<LiveNotification[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await adminApi.listRecentNotifications(100);
        if (!cancelled) setItems(next);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Bildirimler yüklenemedi');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(q)
        || (n.description ?? '').toLowerCase().includes(q)
        || n.userId.toLowerCase().includes(q)
        || n.type.toLowerCase().includes(q),
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const columns: AdminTableColumn<LiveNotification>[] = [
    { key: 'title', header: 'Başlık' },
    {
      key: 'userId',
      header: 'Kullanıcı',
      render: (row) => <span className="font-mono text-xs">{row.userId.slice(0, 8)}…</span>,
    },
    { key: 'type', header: 'Tür' },
    {
      key: 'isRead',
      header: 'Durum',
      render: (row) => (row.isRead ? 'Okundu' : 'Okunmadı'),
    },
    {
      key: 'createdAt',
      header: 'Tarih',
      render: (row) => formatAdminDateTime(row.createdAt),
    },
  ];

  return (
    <AdminPageShell
      title="Bildirimler"
      description="Canlı kullanıcı bildirimleri — notifications tablosu. Toplu gönderim sonraki aşamada eklenecek."
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
      {loading ? (
        <AdminLoadingState />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={rows}
            emptyTitle="Bildirim bulunamadı"
            emptyDescription="Henüz canlı bildirim kaydı yok veya tablo henüz oluşturulmamış."
          />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </AdminPageShell>
  );
}
