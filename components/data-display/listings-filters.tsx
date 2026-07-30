'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFilters } from '@/lib/stores';
import { PROVIDERS, CATEGORIES, DEAL_SCORE_META } from '@/config/site';
import type { DealScore } from '@/types';

const SORT_OPTIONS = [
  { value: 'deal', label: 'En iyi fırsat önce' },
  { value: 'price-asc', label: 'Fiyat: düşükten yükseğe' },
  { value: 'price-desc', label: 'Fiyat: yüksekten düşüğe' },
  { value: 'newest', label: 'En yeni önce' },
];

export function ListingsFilters({ resultCount }: { resultCount: number }) {
  const f = useFilters();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Başlık, ilçe veya satıcı ara…"
            value={f.query}
            onChange={(e) => f.setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={f.provider ?? 'all'} onValueChange={(v) => f.setProvider(v === 'all' ? null : v)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Kaynak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kaynaklar</SelectItem>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={f.category ?? 'all'} onValueChange={(v) => f.setCategory(v === 'all' ? null : v)}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kategoriler</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={f.dealScore ?? 'all'} onValueChange={(v) => f.setDealScore(v === 'all' ? null : (v as DealScore))}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Fırsat puanı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm fırsatlar</SelectItem>
              {(Object.keys(DEAL_SCORE_META) as DealScore[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {DEAL_SCORE_META[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={f.sortBy} onValueChange={(v) => f.setSortBy(v as typeof f.sortBy)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span> ilan
        </p>
        {(f.query || f.provider || f.category || f.dealScore) && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={f.reset}>
            <X className="mr-1 h-3 w-3" />
            Filtreleri temizle
          </Button>
        )}
      </div>
    </div>
  );
}
