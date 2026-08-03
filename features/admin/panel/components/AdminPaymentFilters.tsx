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
  ADMIN_PAYMENT_METHOD_LABELS,
  ADMIN_PAYMENT_METHODS,
  ADMIN_PAYMENT_PACKAGE_LABELS,
  ADMIN_PAYMENT_PACKAGE_TYPES,
  ADMIN_PAYMENT_SECTIONS,
  ADMIN_PAYMENT_STATUS_LABELS,
  ADMIN_PAYMENT_STATUSES,
} from '@/features/admin/panel/constants/admin-payments.constants';
import type {
  AdminPaymentMethod,
  AdminPaymentPackageType,
  AdminPaymentSection,
  AdminPaymentStatus,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminPaymentPackageFilter = AdminPaymentPackageType | 'all';
export type AdminPaymentMethodFilter = AdminPaymentMethod | 'all';
export type AdminPaymentStatusFilter = AdminPaymentStatus | 'all';
export type AdminPaymentUserFilter = 'all' | string;

export function AdminPaymentFilters({
  section,
  user,
  users,
  listingId,
  packageType,
  paymentMethod,
  status,
  dateFrom,
  dateTo,
  onSectionChange,
  onUserChange,
  onListingIdChange,
  onPackageTypeChange,
  onPaymentMethodChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
}: {
  section: AdminPaymentSection;
  user: AdminPaymentUserFilter;
  users: string[];
  listingId: string;
  packageType: AdminPaymentPackageFilter;
  paymentMethod: AdminPaymentMethodFilter;
  status: AdminPaymentStatusFilter;
  dateFrom: string;
  dateTo: string;
  onSectionChange: (value: AdminPaymentSection) => void;
  onUserChange: (value: AdminPaymentUserFilter) => void;
  onListingIdChange: (value: string) => void;
  onPackageTypeChange: (value: AdminPaymentPackageFilter) => void;
  onPaymentMethodChange: (value: AdminPaymentMethodFilter) => void;
  onStatusChange: (value: AdminPaymentStatusFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-[200px]">
        <Select
          value={section}
          onValueChange={(value) => onSectionChange(value as AdminPaymentSection)}
        >
          <SelectTrigger aria-label="Ödeme bölümü">
            <SelectValue placeholder="Bölüm" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_PAYMENT_SECTIONS.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Select value={user} onValueChange={onUserChange}>
          <SelectTrigger aria-label="Kullanıcı filtresi">
            <SelectValue placeholder="Kullanıcı" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kullanıcılar</SelectItem>
            {users.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Input
          value={listingId}
          onChange={(e) => onListingIdChange(e.target.value)}
          placeholder="İlan numarası"
          aria-label="İlan numarası"
        />
      </div>

      <div className="w-[160px]">
        <Select
          value={packageType}
          onValueChange={(value) => onPackageTypeChange(value as AdminPaymentPackageFilter)}
        >
          <SelectTrigger aria-label="Paket türü">
            <SelectValue placeholder="Paket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm paketler</SelectItem>
            {ADMIN_PAYMENT_PACKAGE_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_PAYMENT_PACKAGE_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <Select
          value={paymentMethod}
          onValueChange={(value) => onPaymentMethodChange(value as AdminPaymentMethodFilter)}
        >
          <SelectTrigger aria-label="Ödeme yöntemi">
            <SelectValue placeholder="Yöntem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm yöntemler</SelectItem>
            {ADMIN_PAYMENT_METHODS.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_PAYMENT_METHOD_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AdminPaymentStatusFilter)}
        >
          <SelectTrigger aria-label="Durum filtresi">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {ADMIN_PAYMENT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ADMIN_PAYMENT_STATUS_LABELS[item]}
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
