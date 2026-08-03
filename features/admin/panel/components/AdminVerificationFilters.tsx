'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_VERIFICATION_STATUS_LABELS,
  ADMIN_VERIFICATION_STATUSES,
  ADMIN_VERIFICATION_TYPE_LABELS,
  ADMIN_VERIFICATION_TYPES,
} from '@/features/admin/panel/constants/admin-verifications.constants';
import type {
  AdminVerificationStatus,
  AdminVerificationType,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminVerificationTypeFilter = AdminVerificationType | 'all';
export type AdminVerificationStatusFilter = AdminVerificationStatus | 'all';

export function AdminVerificationFilters({
  type,
  status,
  onTypeChange,
  onStatusChange,
}: {
  type: AdminVerificationTypeFilter;
  status: AdminVerificationStatusFilter;
  onTypeChange: (value: AdminVerificationTypeFilter) => void;
  onStatusChange: (value: AdminVerificationStatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[200px]">
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as AdminVerificationTypeFilter)}
        >
          <SelectTrigger aria-label="Doğrulama türü">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm türler</SelectItem>
            {ADMIN_VERIFICATION_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_VERIFICATION_TYPE_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[180px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminVerificationStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_VERIFICATION_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_VERIFICATION_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
