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
  ADMIN_LISTING_CATEGORIES,
  ADMIN_LISTING_STATUS_LABELS,
  ADMIN_LISTING_STATUSES,
} from '@/features/admin/panel/constants/admin-listings.constants';
import type { AdminListingStatus } from '@/features/admin/panel/types/admin-panel.types';

export type AdminListingCategoryFilter = 'all' | string;
export type AdminListingStatusFilter = AdminListingStatus | 'all';
export type AdminListingOwnerFilter = 'all' | string;

export function AdminListingFilters({
  category,
  status,
  owner,
  owners,
  dateFrom,
  dateTo,
  onCategoryChange,
  onStatusChange,
  onOwnerChange,
  onDateFromChange,
  onDateToChange,
}: {
  category: AdminListingCategoryFilter;
  status: AdminListingStatusFilter;
  owner: AdminListingOwnerFilter;
  owners: string[];
  dateFrom: string;
  dateTo: string;
  onCategoryChange: (value: AdminListingCategoryFilter) => void;
  onStatusChange: (value: AdminListingStatusFilter) => void;
  onOwnerChange: (value: AdminListingOwnerFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[160px]">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger aria-label="Kategori filtresi">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {ADMIN_LISTING_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[170px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminListingStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_LISTING_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_LISTING_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Select value={owner} onValueChange={onOwnerChange}>
          <SelectTrigger aria-label="Kullanıcı filtresi">
            <SelectValue placeholder="Kullanıcı" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kullanıcılar</SelectItem>
            {owners.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
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
