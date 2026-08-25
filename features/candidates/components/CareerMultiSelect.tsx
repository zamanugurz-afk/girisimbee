'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Plus, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';
import { formatTurkishSentence } from '@/features/candidates/lib/career-text-quality';
import {
  searchTaxonomyCatalog,
  getCanonicalCatalog,
  formatCanonicalCustomValue,
  type SetDomain,
} from '@/features/shared/services/set-matching.service';
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
  domain,
  catalog,
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
  domain?: SetDomain;
  catalog?: string[];
}) {
  const selected = value ?? [];
  const showManual = selected.some((item) => isManualCareerOption(item));
  const [query, setQuery] = useState('');

  // Full searchable pool: explicit catalog > domain registry > options
  const fullSearchPool = useMemo(() => {
    if (catalog && catalog.length > 0) return catalog;
    if (domain) {
      const domainCat = getCanonicalCatalog(domain);
      if (domainCat.length > 0) return domainCat;
    }
    return options;
  }, [catalog, domain, options]);

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

  // Real-time live suggestions for whatever user types in manual input
  const manualMatches = useMemo(() => {
    const raw = (manualValue ?? '').trim();
    if (!raw || raw.length < 1) return [];
    return searchTaxonomyCatalog(raw, fullSearchPool, {
      limit: 8,
      excludeValues: selected.filter((s) => !isManualCareerOption(s)),
    });
  }, [manualValue, fullSearchPool, selected]);

  function toggle(option: string, checked: boolean) {
    if (checked) {
      const next = selected.includes(option) ? selected : [...selected, option];
      onChange(next);
      return;
    }
    onChange(selected.filter((item) => item !== option));
  }

  function addMatchedOption(opt: string) {
    if (!selected.includes(opt)) {
      onChange([...selected, opt]);
    }
    if (onManualChange) {
      onManualChange('');
    }
  }

  function removeSelected(opt: string) {
    onChange(selected.filter((item) => item !== opt));
  }

  const pureSelected = selected.filter((item) => !isManualCareerOption(item));

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

      {/* Selected Chips */}
      {pureSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-muted/30 border border-border/50">
          {pureSelected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20 shadow-2xs"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSelected(item)}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                  title="Kaldır"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

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
        <div className="space-y-2 rounded-xl border border-amber-300/80 bg-amber-50/60 p-3.5 shadow-2xs dark:border-amber-700/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Özel / Manuel Belirtme & Anlık Sistem Eşleştirme:</span>
          </div>
          <Textarea
            value={manualValue ?? ''}
            disabled={disabled}
            rows={2}
            className="min-h-[64px] bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800/60 focus-visible:ring-amber-500 placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40"
            placeholder={manualPlaceholder ?? 'Kendi ifadenizi yazın (örn: SEGEM, PMP, AWS)...'}
            onKeyDownCapture={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(e) => onManualChange(e.target.value)}
            onBlur={() => {
              if (manualValue?.trim()) {
                onManualChange(formatTurkishSentence(manualValue));
              }
            }}
          />

          {/* Real-time System Option Suggestions */}
          {manualMatches.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-amber-200 dark:border-amber-800/40 animate-in fade-in duration-200">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Eşleşen Sistem Seçenekleri (Seçmek için tıklayın):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {manualMatches.map((match) => (
                  <button
                    key={match.value}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-zinc-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400 transition-colors shadow-2xs cursor-pointer"
                    onClick={() => addMatchedOption(match.value)}
                  >
                    <Plus className="h-3 w-3 text-emerald-600 dark:text-emerald-400 font-bold" />
                    <span>{match.value}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Fallback Action */}
          {manualValue && manualValue.trim().length > 1 && !manualMatches.some((m) => m.matchQuality === 'exact') && (
            <div className="pt-1">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                onClick={() => {
                  const formatted = formatCanonicalCustomValue(manualValue);
                  addMatchedOption(formatted);
                  onManualChange('');
                }}
              >
                <Plus className="h-3 w-3" />
                <span>&ldquo;{formatCanonicalCustomValue(manualValue)}&rdquo; değerini seçenek olarak ekle</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
