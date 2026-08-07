'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import {
  AdminUserFilters,
  type AdminUserRoleFilter,
  type AdminUserStatusFilter,
} from '@/features/admin/panel/components/AdminUserFilters';
import { AdminUserDetailDialog } from '@/features/admin/panel/components/AdminUserDetailDialog';
import {
  AdminUserEditDialog,
  type AdminUserEditDraft,
} from '@/features/admin/panel/components/AdminUserEditDialog';
import { AdminLoadingState } from '@/features/admin/panel/components/AdminLoadingState';
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
  ADMIN_USERS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-users.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { mapAdminUserView } from '@/features/admin/panel/lib/map-live-admin';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type {
  AdminMockUser,
  AdminTableColumn,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';
import type { UserId } from '@/lib/domain/ids';
import type { DomainUserRole, UserStatus } from '@/features/authentication/types/user.types';

function toApiStatus(filter: AdminUserStatusFilter): UserStatus | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'suspended') return 'suspended';
  if (filter === 'deleted') return 'deleted';
  return 'active';
}

function toApiRole(filter: AdminUserRoleFilter): DomainUserRole | undefined {
  if (filter === 'all') return undefined;
  return filter;
}

export function AdminUsersView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [users, setUsers] = useState<AdminMockUser[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminMockUser | null>(null);
  const [editUser, setEditUser] = useState<AdminMockUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.searchUsers(
        {
          query: debouncedQuery.trim() || undefined,
          status: toApiStatus(statusFilter),
          role: toApiRole(roleFilter),
        },
        { page, limit: ADMIN_USERS_PAGE_SIZE },
      );
      setUsers(result.data.map(mapAdminUserView));
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kullanıcılar yüklenemedi');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, roleFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_USERS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);

  const detailUserLive = useMemo(
    () => (detailUser ? users.find((user) => user.id === detailUser.id) ?? detailUser : null),
    [detailUser, users],
  );
  const editUserLive = useMemo(
    () => (editUser ? users.find((user) => user.id === editUser.id) ?? editUser : null),
    [editUser, users],
  );

  async function setStatus(userId: string, status: AdminUserStatus) {
    if (status === 'deleted') {
      if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
    }

    setBusyId(userId);
    try {
      if (status === 'suspended') {
        await adminApi.patchUser(userId as UserId, { action: 'suspend' });
      } else if (status === 'active') {
        await adminApi.patchUser(userId as UserId, { action: 'activate' });
      } else if (status === 'deleted') {
        await adminApi.patchUser(userId as UserId, { action: 'delete' });
      }
      toast.success('İşlem tamamlandı');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız');
    } finally {
      setBusyId(null);
    }
  }

  function handleSave(userId: string, draft: AdminUserEditDraft) {
    // Role/profile edits need dedicated API — for now update local + toast.
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              full_name: draft.full_name.trim() || user.full_name,
              username: draft.username.trim() || user.username,
              email: draft.email.trim() || user.email,
              role: draft.role,
              status: draft.status,
            }
          : user,
      ),
    );
    toast.message('Profil alanları yerel olarak güncellendi. Durum için Pasife al / Etkinleştir kullanın.');
  }

  const columns: AdminTableColumn<AdminMockUser>[] = [
    {
      key: 'id',
      header: 'id',
      className: 'max-w-[120px] truncate font-mono text-xs',
    },
    { key: 'full_name', header: 'full_name' },
    { key: 'username', header: 'username' },
    { key: 'email', header: 'email' },
    {
      key: 'role',
      header: 'role',
      render: (row) => ADMIN_USER_ROLE_LABELS[row.role],
    },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_USER_STATUS_LABELS[row.status],
    },
    {
      key: 'created_at',
      header: 'created_at',
      render: (row) => formatAdminDateTime(row.created_at),
    },
    {
      key: 'last_login_at',
      header: 'last_login_at',
      render: (row) => formatAdminDateTime(row.last_login_at),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => {
            setDetailUser(row);
            setDetailOpen(true);
          }}>
            Detay
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => {
            setEditUser(row);
            setEditOpen(true);
          }}>
            Düzenle
          </Button>
          {row.status === 'active' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId === row.id}
              onClick={() => void setStatus(row.id, 'suspended')}
            >
              Pasife al
            </Button>
          ) : null}
          {row.status !== 'deleted' ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busyId === row.id}
              onClick={() => void setStatus(row.id, 'deleted')}
            >
              Sil
            </Button>
          ) : null}
          {row.status !== 'active' ? (
            <Button
              type="button"
              size="sm"
              disabled={busyId === row.id}
              onClick={() => void setStatus(row.id, 'active')}
            >
              Etkinleştir
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Kullanıcılar"
      description="Canlı kullanıcı listesi — profiles + Auth üzerinden."
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <AdminSearch
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="id, ad, kullanıcı adı veya e-posta ara…"
          />
          <AdminUserFilters
            role={roleFilter}
            status={statusFilter}
            onRoleChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
          <p className="text-sm text-muted-foreground">{total} kayıt</p>
        </div>
      }
    >
      {loading ? (
        <AdminLoadingState />
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={users}
            emptyTitle="Kullanıcı bulunamadı"
            emptyDescription="Arama veya filtre kriterlerinize uygun kullanıcı yok."
          />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}

      <AdminUserDetailDialog
        user={detailUserLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(user) => {
          setEditUser(user);
          setEditOpen(true);
        }}
      />
      <AdminUserEditDialog
        user={editUserLive}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSave}
      />
    </AdminPageShell>
  );
}
