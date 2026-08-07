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
  ADMIN_SUPPORT_CATEGORIES,
  ADMIN_SUPPORT_CATEGORY_LABELS,
  ADMIN_SUPPORT_OPERATORS,
  ADMIN_SUPPORT_PRIORITIES,
  ADMIN_SUPPORT_PRIORITY_LABELS,
  ADMIN_SUPPORT_SECTIONS,
  ADMIN_SUPPORT_STATUS_LABELS,
  ADMIN_SUPPORT_STATUSES,
} from '@/features/admin/panel/constants/admin-support.constants';
import type {
  AdminSupportCategory,
  AdminSupportPriority,
  AdminSupportSection,
  AdminSupportStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminSupportCategoryFilter = AdminSupportCategory | 'all';
export type AdminSupportOperatorFilter = 'all' | 'unassigned' | string;
export type AdminSupportPriorityFilter = AdminSupportPriority | 'all';
export type AdminSupportStatusFilter = AdminSupportStatus | 'all';

export function AdminSupportFilters({
  section,
  category,
  operator,
  priority,
  status,
  dateFrom,
  dateTo,
  onSectionChange,
  onCategoryChange,
  onOperatorChange,
  onPriorityChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
}: {
  section: AdminSupportSection;
  category: AdminSupportCategoryFilter;
  operator: AdminSupportOperatorFilter;
  priority: AdminSupportPriorityFilter;
  status: AdminSupportStatusFilter;
  dateFrom: string;
  dateTo: string;
  onSectionChange: (value: AdminSupportSection) => void;
  onCategoryChange: (value: AdminSupportCategoryFilter) => void;
  onOperatorChange: (value: AdminSupportOperatorFilter) => void;
  onPriorityChange: (value: AdminSupportPriorityFilter) => void;
  onStatusChange: (value: AdminSupportStatusFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[200px]">
        <Select
          value={section}
          onValueChange={(value) => onSectionChange(value as AdminSupportSection)}
        >
          <SelectTrigger aria-label="Destek bölümü">
            <SelectValue placeholder="Bölüm" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_SUPPORT_SECTIONS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <Select
          value={category}
          onValueChange={(value) => onCategoryChange(value as AdminSupportCategoryFilter)}
        >
          <SelectTrigger aria-label="Kategori filtresi">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {ADMIN_SUPPORT_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_SUPPORT_CATEGORY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Select
          value={operator}
          onValueChange={(value) => onOperatorChange(value as AdminSupportOperatorFilter)}
        >
          <SelectTrigger aria-label="Operatör filtresi">
            <SelectValue placeholder="Operatör" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm operatörler</SelectItem>
            <SelectItem value="unassigned">Atanmamış</SelectItem>
            {ADMIN_SUPPORT_OPERATORS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[150px]">
        <Select
          value={priority}
          onValueChange={(value) => onPriorityChange(value as AdminSupportPriorityFilter)}
        >
          <SelectTrigger aria-label="Öncelik filtresi">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm öncelikler</SelectItem>
            {ADMIN_SUPPORT_PRIORITIES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_SUPPORT_PRIORITY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminSupportStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_SUPPORT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_SUPPORT_STATUS_LABELS[item]}
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
