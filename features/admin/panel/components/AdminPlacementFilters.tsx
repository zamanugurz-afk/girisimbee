'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_PLACEMENT_STATUS_LABELS,
  ADMIN_PLACEMENT_STATUSES,
  ADMIN_PLACEMENT_TYPE_LABELS,
  ADMIN_PLACEMENT_TYPES,
} from '@/features/admin/panel/constants/admin-placements.constants';
import type {
  AdminPlacementStatus,
  AdminPlacementType,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminPlacementTypeFilter = AdminPlacementType | 'all';
export type AdminPlacementStatusFilter = AdminPlacementStatus | 'all';

export function AdminPlacementFilters({
  placementType,
  status,
  dateFrom,
  dateTo,
  onPlacementTypeChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
}: {
  placementType: AdminPlacementTypeFilter;
  status: AdminPlacementStatusFilter;
  dateFrom: string;
  dateTo: string;
  onPlacementTypeChange: (value: AdminPlacementTypeFilter) => void;
  onStatusChange: (value: AdminPlacementStatusFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[170px]">
        <Select
          value={placementType}
          onValueChange={(value) => onPlacementTypeChange(value as AdminPlacementTypeFilter)}
        >
          <SelectTrigger aria-label="Paket filtresi">
            <SelectValue placeholder="Paket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm paketler</SelectItem>
            {ADMIN_PLACEMENT_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_PLACEMENT_TYPE_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[170px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminPlacementStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_PLACEMENT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_PLACEMENT_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[150px]">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="Başlangıç tarihi"
        />
      </div>
      <div className="w-[150px]">
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Bitiş tarihi"
        />
      </div>
    </div>
  );
}
