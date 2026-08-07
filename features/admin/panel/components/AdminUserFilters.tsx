'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_ROLES,
  ADMIN_USER_STATUS_LABELS,
  ADMIN_USER_STATUSES,
} from '@/features/admin/panel/constants/admin-users.constants';
import type {
  AdminUserRole,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminUserRoleFilter = AdminUserRole | 'all';
export type AdminUserStatusFilter = AdminUserStatus | 'all';

export function AdminUserFilters({
  role,
  status,
  onRoleChange,
  onStatusChange,
}: {
  role: AdminUserRoleFilter;
  status: AdminUserStatusFilter;
  onRoleChange: (value: AdminUserRoleFilter) => void;
  onStatusChange: (value: AdminUserStatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[180px]">
        <Select
          value={role}
          onValueChange={(value) => onRoleChange(value as AdminUserRoleFilter)}
        >
          <SelectTrigger aria-label="Rol filtresi">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm roller</SelectItem>
            {ADMIN_USER_ROLES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_USER_ROLE_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[180px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminUserStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_USER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_USER_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
