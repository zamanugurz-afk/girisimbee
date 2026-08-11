'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { PERMISSIONS } from '@/features/authorization/permission.constants';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
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
  const { hasPermission } = useRbac();
  const canSend = hasPermission(PERMISSIONS.NOTIFICATIONS_SEND);
  const [items, setItems] = useState<LiveNotification[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await adminApi.listRecentNotifications(100);
      setItems(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bildirimler yüklenemedi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      await adminApi.sendNotification({
        userId: userId.trim(),
        title: title.trim(),
        body: body.trim(),
      });
      toast.success('Bildirim gönderildi');
      setTitle('');
      setBody('');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gönderilemedi');
    } finally {
      setSending(false);
    }
  }

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
      description="Canlı kullanıcı bildirimleri — tek kullanıcıya sistem bildirimi gönderilebilir."
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
      {canSend ? (
        <form
          onSubmit={(e) => void handleSend(e)}
          className="mb-6 space-y-3 rounded-2xl border border-border/80 p-4 dark:border-white/10"
        >
          <h2 className="text-sm font-semibold">Bildirim gönder</h2>
          <Input
            placeholder="userId (UUID)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="font-mono text-xs"
            required
          />
          <Input
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={160}
          />
          <Textarea
            placeholder="Mesaj"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            maxLength={2000}
          />
          <Button type="submit" size="sm" disabled={sending}>
            {sending ? 'Gönderiliyor…' : 'Gönder'}
          </Button>
        </form>
      ) : null}

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
