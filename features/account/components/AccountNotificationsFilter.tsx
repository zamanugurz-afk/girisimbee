'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AccountNotificationsFilterState } from '@/features/account/types/account-notifications.types';

export function AccountNotificationsFilter({
  value,
  onChange,
}: {
  value: AccountNotificationsFilterState;
  onChange: (next: AccountNotificationsFilterState) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Input
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
        placeholder="Bildirimlerde ara…"
        aria-label="Arama"
        className="rounded-2xl sm:col-span-2 xl:col-span-1"
      />

      <Select
        value={value.dateRange}
        onValueChange={(dateRange) =>
          onChange({
            ...value,
            dateRange: dateRange as AccountNotificationsFilterState['dateRange'],
          })
        }
      >
        <SelectTrigger className="rounded-2xl" aria-label="Tarih filtresi">
          <SelectValue placeholder="Tarih" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm tarihler</SelectItem>
          <SelectItem value="7d">Son 7 gün</SelectItem>
          <SelectItem value="30d">Son 30 gün</SelectItem>
          <SelectItem value="90d">Son 90 gün</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.sort}
        onValueChange={(sort) =>
          onChange({
            ...value,
            sort: sort as AccountNotificationsFilterState['sort'],
          })
        }
      >
        <SelectTrigger className="rounded-2xl" aria-label="Sıralama">
          <SelectValue placeholder="Sıralama" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unread_first">Okunmamış önce</SelectItem>
          <SelectItem value="newest">En yeni</SelectItem>
          <SelectItem value="oldest">En eski</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
