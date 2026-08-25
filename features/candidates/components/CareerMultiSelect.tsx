'use client';

import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';
import { formatTurkishSentence } from '@/features/candidates/lib/career-text-quality';
import { searchTaxonomyCatalog } from '@/features/shared/services/set-matching.service';
import { cn } from '@/lib/utils';

export function CareerMultiSelect({
  label,
  options,
  value,
  onChange,
  manualValue,
  onManualChange,
  manualPlaceholder,
  searchPlaceholder,
  disabled,
  error,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  manualValue?: string;
  onManualChange?: (next: string) => void;
  manualPlaceholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string | null;
}) {
  const selected = value ?? [];
  const showManual = selected.some((item) => isManualCareerOption(item));
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    const scored = searchTaxonomyCatalog(q, options, { limit: options.length });
    const matchedValues = new Set(scored.map((s) => s.value));
    return options.filter((option) => {
      if (isManualCareerOption(option) || selected.includes(option)) return true;
      return matchedValues.has(option);
    });
  }, [options, query, selected]);

  function toggle(option: string, checked: boolean) {
    if (checked) {
      const next = selected.includes(option) ? selected : [...selected, option];
      onChange(next);
      return;
    }
    onChange(selected.filter((item) => item !== option));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {options.length > 1 && !disabled && (
          <button
            type="button"
            className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer transition-colors"
            onClick={() => {
              const nonManual = options.filter((o) => !isManualCareerOption(o));
              const allSelected = nonManual.length > 0 && nonManual.every((o) => selected.includes(o));
              if (allSelected) {
                onChange(selected.filter((s) => !nonManual.includes(s)));
              } else {
                onChange([...new Set([...selected, ...nonManual])]);
              }
            }}
          >
            {options.filter((o) => !isManualCareerOption(o)).length > 0 &&
            options.filter((o) => !isManualCareerOption(o)).every((o) => selected.includes(o))
              ? 'Seçimi Temizle'
              : 'Önerilenleri Ekle'}
          </button>
        )}
      </div>
      {options.length > 12 ? (
        <Input
          value={query}
          disabled={disabled}
          placeholder={searchPlaceholder ?? 'Listede ara...'}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : null}
      <div
        className={cn(
          'grid max-h-56 gap-1.5 overflow-y-auto rounded-lg border border-border/70 bg-background p-2 sm:grid-cols-2',
          error && 'border-destructive/40',
        )}
      >
        {visible.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(next) => toggle(option, next === true)}
              />
              <span className="leading-snug">{option}</span>
            </label>
          );
        })}
      </div>
      {showManual && onManualChange ? (
        <div className="space-y-1.5 rounded-xl border border-amber-300/80 bg-amber-50/60 p-3.5 shadow-2xs dark:border-amber-700/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Özel / Manuel Belirtme Alanı:</span>
          </div>
          <Textarea
            value={manualValue ?? ''}
            disabled={disabled}
            rows={3}
            className="min-h-[84px] bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800/60 focus-visible:ring-amber-500 placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40"
            placeholder={manualPlaceholder ?? 'Kendi ifadenizi yazın'}
            onKeyDownCapture={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(e) => onManualChange(e.target.value)}
            onBlur={() => {
              if (manualValue?.trim()) {
                onManualChange(formatTurkishSentence(manualValue));
              }
            }}
          />
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
