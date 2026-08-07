'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AccountListingsFilterState } from '@/features/account/types/account-listings.types';
import { ACCOUNT_LISTING_CATEGORIES } from '@/features/account/types/account-listings.constants';

export function AccountListingFilters({
  value,
  onChange,
}: {
  value: AccountListingsFilterState;
  onChange: (next: AccountListingsFilterState) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Input
        value={value.query}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
        placeholder="İlanlarda ara…"
        aria-label="Arama"
        className="rounded-lg"
      />

      <Select
        value={value.category}
        onValueChange={(category) => onChange({ ...value, category })}
      >
        <SelectTrigger className="rounded-lg" aria-label="Kategori filtresi">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>
        <SelectContent>
          {ACCOUNT_LISTING_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.dateRange}
        onValueChange={(dateRange) =>
          onChange({
            ...value,
            dateRange: dateRange as AccountListingsFilterState['dateRange'],
          })
        }
      >
        <SelectTrigger className="rounded-lg" aria-label="Tarih filtresi">
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
            sort: sort as AccountListingsFilterState['sort'],
          })
        }
      >
        <SelectTrigger className="rounded-lg" aria-label="Sıralama">
          <SelectValue placeholder="Sıralama" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">En yeni</SelectItem>
          <SelectItem value="oldest">En eski</SelectItem>
          <SelectItem value="views_desc">Görüntülenme (çoktan aza)</SelectItem>
          <SelectItem value="favorites_desc">Favori (çoktan aza)</SelectItem>
          <SelectItem value="title_asc">Başlık (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
