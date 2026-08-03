'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
  ADMIN_USERS_PAGE_SIZE,
} from '@/features/admin/panel/constants/admin-users.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import { MOCK_ADMIN_USERS } from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminMockUser,
  AdminTableColumn,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneUsers(): AdminMockUser[] {
  return MOCK_ADMIN_USERS.map((user) => ({ ...user }));
}

export function AdminUsersView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [users, setUsers] = useState<AdminMockUser[]>(cloneUsers);
  const [query, setQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [detailUser, setDetailUser] = useState<AdminMockUser | null>(null);
  const [editUser, setEditUser] = useState<AdminMockUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      if (!q) return true;
      return (
        user.id.toLowerCase().includes(q)
        || user.full_name.toLowerCase().includes(q)
        || user.username.toLowerCase().includes(q)
        || user.email.toLowerCase().includes(q)
        || user.role.includes(q)
        || user.status.includes(q)
      );
    });
  }, [users, query, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_USERS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const rows = filtered.slice(
    (pageSafe - 1) * ADMIN_USERS_PAGE_SIZE,
    pageSafe * ADMIN_USERS_PAGE_SIZE,
  );

  function setStatus(userId: string, status: AdminUserStatus) {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  }

  function handleSave(userId: string, draft: AdminUserEditDraft) {
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
  }

  function openDetail(user: AdminMockUser) {
    setDetailUser(user);
    setDetailOpen(true);
  }

  function openEdit(user: AdminMockUser) {
    setEditUser(user);
    setEditOpen(true);
  }

  const detailUserLive = detailUser
    ? users.find((user) => user.id === detailUser.id) ?? detailUser
    : null;
  const editUserLive = editUser
    ? users.find((user) => user.id === editUser.id) ?? editUser
    : null;

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
          <Button type="button" size="sm" variant="outline" onClick={() => openDetail(row)}>
            Detay
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
            Düzenle
          </Button>
          {row.status === 'active' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatus(row.id, 'suspended')}
            >
              Pasife al
            </Button>
          ) : null}
          {row.status !== 'deleted' ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setStatus(row.id, 'deleted')}
            >
              Yasakla
            </Button>
          ) : null}
          {row.status !== 'active' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStatus(row.id, 'active')}
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
      description="Kullanıcı yönetimi — mock veri (arama, filtre, düzenleme, durum)"
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
          <p className="text-sm text-muted-foreground">
            {filtered.length} kayıt
          </p>
        </div>
      }
    >
      <AdminTable
        columns={columns}
        rows={rows}
        emptyTitle="Kullanıcı bulunamadı"
        emptyDescription="Arama veya filtre kriterlerinize uygun kullanıcı yok."
      />
      <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />

      <AdminUserDetailDialog
        user={detailUserLive}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(user) => openEdit(user)}
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
