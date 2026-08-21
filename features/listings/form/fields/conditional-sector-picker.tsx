'use client';

import React, { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, CheckCheck, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSectorsForBusinessTypes,
  resolveCanonicalBusinessType,
} from '@/features/listings/config/business-type-sector-map';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';

export interface ConditionalSectorPickerProps {
  id?: string;
  label?: string;
  required?: boolean;
  selectedBusinessTypes: readonly string[] | string[];
  value: unknown;
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  prunedNotice?: boolean;
  onDismissPrunedNotice?: () => void;
}

function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u');
}

export function ConditionalSectorPicker({
  id = 'conditional-sector-picker',
  label = 'İlgilenilen Sektörler',
  required = false,
  selectedBusinessTypes,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  prunedNotice = false,
  onDismissPrunedNotice,
}: ConditionalSectorPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSectors = useMemo(() => {
    return Array.isArray(value) ? value.map(String) : [];
  }, [value]);

  const rawTypes = useMemo(() => {
    return Array.isArray(selectedBusinessTypes) ? selectedBusinessTypes.map(String) : [];
  }, [selectedBusinessTypes]);

  const availableSectors = useMemo(() => {
    return getSectorsForBusinessTypes(rawTypes);
  }, [rawTypes]);

  const filteredSectors = useMemo(() => {
    if (!searchQuery.trim()) return availableSectors;
    const query = normalizeSearchText(searchQuery);
    return availableSectors.filter((sector) => normalizeSearchText(sector).includes(query));
  }, [availableSectors, searchQuery]);

  function toggleSector(sector: string, checked: boolean) {
    if (disabled) return;
    const next = checked
      ? [...selectedSectors, sector]
      : selectedSectors.filter((s) => s !== sector);
    onChange(next);
  }

  function handleSelectAll() {
    if (disabled) return;
    const union = Array.from(new Set([...selectedSectors, ...filteredSectors]));
    onChange(union);
  }

  function handleClearAll() {
    if (disabled) return;
    const filteredSet = new Set(filteredSectors);
    const remaining = selectedSectors.filter((s) => !filteredSet.has(s));
    onChange(remaining);
  }

  // 1. If no business type is selected yet, render subtle helper hint
  if (rawTypes.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-left transition-colors">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-500/70 animate-pulse" />
          <p className="text-xs font-normal text-muted-foreground leading-relaxed">
            Önce yukarıdan ilgilendiğiniz işletme türünü seçin. Seçtiğiniz işletme türlerine uygun sektörler burada listelenecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 transition-all duration-200 ease-in-out">
      {/* Header with Title, Description, and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor={id} className="text-sm font-semibold text-foreground">
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {selectedSectors.length > 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20">
                {selectedSectors.length} sektör seçili
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seçtiğiniz işletme türleriyle ilişkili sektörleri seçin.
          </p>
        </div>

        {/* Quick select/clear buttons */}
        {availableSectors.length > 4 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={disabled || filteredSectors.length === 0}
              className="h-7 px-2 text-[11px] font-normal text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tümünü Seç
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled || selectedSectors.length === 0}
              className="h-7 px-2 text-[11px] font-normal text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Temizle
            </Button>
          </div>
        )}
      </div>

      {/* Pruned Notification Banner */}
      {prunedNotice && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-900 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>İşletme türü değiştiği için bazı sektör seçimleri güncellendi.</span>
          </div>
          {onDismissPrunedNotice && (
            <button
              type="button"
              onClick={onDismissPrunedNotice}
              className="rounded p-0.5 text-amber-700 hover:bg-amber-100 hover:text-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
              aria-label="Kapat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Search Input when there are many options */}
      {availableSectors.length >= 8 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id={`${id}-search`}
            type="text"
            placeholder="Sektör ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="h-8.5 pl-8.5 pr-8 text-xs bg-muted/20 focus-visible:bg-background border-border/80"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Sector Checkbox Grid */}
      {filteredSectors.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 max-h-[360px] overflow-y-auto pr-1 py-0.5 scrollbar-thin">
          {filteredSectors.map((sector) => {
            const isChecked = selectedSectors.includes(sector);
            const checkboxId = `${id}-${normalizeSearchText(sector)}`;

            return (
              <label
                key={sector}
                htmlFor={checkboxId}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-all duration-150 select-none',
                  isChecked
                    ? 'border-amber-500/60 bg-amber-500/8 text-foreground shadow-2xs font-medium dark:border-amber-500/50 dark:bg-amber-500/10'
                    : 'border-border/80 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={(next) => toggleSector(sector, next === true)}
                  disabled={disabled}
                  className={cn(
                    'mt-0.5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 dark:data-[state=checked]:bg-amber-500',
                  )}
                />
                <span className="leading-snug text-xs sm:text-sm">{sector}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 bg-muted/10 p-4 text-center text-xs text-muted-foreground">
          &quot;{searchQuery}&quot; aramasına uygun sektör bulunamadı.
        </div>
      )}

      {/* Error & Helper Footer */}
      <FormFieldFooter helperText={helperText} error={error} />
    </div>
  );
}
