'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AccountFavoritesFilterState } from '@/features/account/types/account-favorites.types';

export function AccountFavoritesFilter({
  value,
  onChange,
}: {
  value: AccountFavoritesFilterState;
  onChange: (next: AccountFavoritesFilterState) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Input
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
        placeholder="Favorilerde ara…"
        aria-label="Arama"
        className="rounded-2xl sm:col-span-2 xl:col-span-1"
      />

      <Select
        value={value.dateRange}
        onValueChange={(dateRange) =>
          onChange({
            ...value,
            dateRange: dateRange as AccountFavoritesFilterState['dateRange'],
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
            sort: sort as AccountFavoritesFilterState['sort'],
          })
        }
      >
        <SelectTrigger className="rounded-2xl" aria-label="Sıralama">
          <SelectValue placeholder="Sıralama" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">En yeni eklenen</SelectItem>
          <SelectItem value="oldest">En eski eklenen</SelectItem>
          <SelectItem value="title_asc">Başlık (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
