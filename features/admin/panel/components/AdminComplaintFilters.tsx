'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_COMPLAINT_SECTIONS,
  ADMIN_COMPLAINT_STATUS_LABELS,
  ADMIN_COMPLAINT_STATUSES,
} from '@/features/admin/panel/constants/admin-complaints.constants';
import type {
  AdminComplaintStatus,
  AdminComplaintType,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminComplaintSectionFilter = AdminComplaintType | 'all';
export type AdminComplaintStatusFilter = AdminComplaintStatus | 'all';

export function AdminComplaintFilters({
  section,
  status,
  onSectionChange,
  onStatusChange,
}: {
  section: AdminComplaintSectionFilter;
  status: AdminComplaintStatusFilter;
  onSectionChange: (value: AdminComplaintSectionFilter) => void;
  onStatusChange: (value: AdminComplaintStatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[240px]">
        <Select
          value={section}
          onValueChange={(value) => onSectionChange(value as AdminComplaintSectionFilter)}
        >
          <SelectTrigger aria-label="Şikâyet bölümü">
            <SelectValue placeholder="Bölüm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm bölümler</SelectItem>
            {ADMIN_COMPLAINT_SECTIONS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[180px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminComplaintStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_COMPLAINT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_COMPLAINT_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
