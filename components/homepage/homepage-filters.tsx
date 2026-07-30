'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHomeFilters } from '@/lib/stores/home-filters';

interface HomepageFilterOptions {
  platforms: string[];
  brands: string[];
  products: string[];
  models: string[];
  cities: string[];
  districts: string[];
  sources: { slug: string; name: string }[];
  conditions: string[];
}

interface HomepageFiltersProps {
  options?: HomepageFilterOptions;
}

function FilterSelect({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select value={value ?? 'all'} onValueChange={(v) => onChange(v === 'all' ? null : v)}>
      <SelectTrigger className="h-9 min-w-[130px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function HomepageFilters({ options }: HomepageFiltersProps) {
  const filters = useHomeFilters();
  const hasActive =
    filters.platform ||
    filters.brand ||
    filters.product ||
    filters.model ||
    filters.city ||
    filters.district ||
    filters.source ||
    filters.condition ||
    filters.minPrice != null ||
    filters.maxPrice != null;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        Filtreler
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterSelect
          label="Platform"
          value={filters.platform}
          onChange={filters.setPlatform}
          items={(options?.platforms ?? []).map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label="Marka"
          value={filters.brand}
          onChange={filters.setBrand}
          items={(options?.brands ?? []).map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label="Ürün"
          value={filters.product}
          onChange={filters.setProduct}
          items={(options?.products ?? []).map((value) => ({ value, label: value.replace(/_/g, ' ') }))}
        />
        <FilterSelect
          label="Model"
          value={filters.model}
          onChange={filters.setModel}
          items={(options?.models ?? []).map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label="Şehir"
          value={filters.city}
          onChange={filters.setCity}
          items={(options?.cities ?? []).map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label="İlçe"
          value={filters.district}
          onChange={filters.setDistrict}
          items={(options?.districts ?? []).map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label="Kaynak"
          value={filters.source}
          onChange={filters.setSource}
          items={(options?.sources ?? []).map((source) => ({ value: source.slug, label: source.name }))}
        />
        <FilterSelect
          label="Durum"
          value={filters.condition}
          onChange={filters.setCondition}
          items={(options?.conditions ?? []).map((value) => ({ value, label: value }))}
        />

        <Input
          type="number"
          placeholder="Min fiyat"
          className="h-9 w-[120px]"
          value={filters.minPrice ?? ''}
          onChange={(event) =>
            filters.setMinPrice(event.target.value ? Number(event.target.value) : null)
          }
        />
        <Input
          type="number"
          placeholder="Max fiyat"
          className="h-9 w-[120px]"
          value={filters.maxPrice ?? ''}
          onChange={(event) =>
            filters.setMaxPrice(event.target.value ? Number(event.target.value) : null)
          }
        />

        {hasActive && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5" onClick={() => filters.reset()}>
            <X className="h-4 w-4" />
            Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
