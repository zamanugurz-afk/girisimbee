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
  ADMIN_LOG_CATEGORIES,
  ADMIN_LOG_CATEGORY_LABELS,
  ADMIN_LOG_STATUS_LABELS,
  ADMIN_LOG_STATUSES,
  type AdminLogSortDir,
  type AdminLogSortField,
} from '@/features/admin/panel/constants/admin-logs.constants';
import type {
  AdminLogCategory,
  AdminLogStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminLogCategoryFilter = AdminLogCategory | 'all';
export type AdminLogStatusFilter = AdminLogStatus | 'all';

export function AdminLogFilters({
  category,
  status,
  sortField,
  sortDir,
  dateFrom,
  dateTo,
  onCategoryChange,
  onStatusChange,
  onSortFieldChange,
  onSortDirChange,
  onDateFromChange,
  onDateToChange,
}: {
  category: AdminLogCategoryFilter;
  status: AdminLogStatusFilter;
  sortField: AdminLogSortField;
  sortDir: AdminLogSortDir;
  dateFrom: string;
  dateTo: string;
  onCategoryChange: (value: AdminLogCategoryFilter) => void;
  onStatusChange: (value: AdminLogStatusFilter) => void;
  onSortFieldChange: (value: AdminLogSortField) => void;
  onSortDirChange: (value: AdminLogSortDir) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[170px]">
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value as AdminLogCategoryFilter)}
        >
          <SelectTrigger aria-label="Kategori filtresi">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {ADMIN_LOG_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_LOG_CATEGORY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[150px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminLogStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_LOG_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_LOG_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[170px]">
        <Select
          value={sortField}
          onValueChange={(value) => onSortFieldChange(value as AdminLogSortField)}
        >
          <SelectTrigger aria-label="Sıralama alanı">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">created_at</SelectItem>
            <SelectItem value="status">status</SelectItem>
            <SelectItem value="event_type">event_type</SelectItem>
            <SelectItem value="actor">actor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[130px]">
        <Select
          value={sortDir}
          onValueChange={(value) => onSortDirChange(value as AdminLogSortDir)}
        >
          <SelectTrigger aria-label="Sıralama yönü">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Azalan</SelectItem>
            <SelectItem value="asc">Artan</SelectItem>
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
