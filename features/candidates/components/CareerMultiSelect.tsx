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
  themeColor = 'emerald',
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
  themeColor?: 'emerald' | 'sky' | 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'slate' | 'default' | string;
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
      if (!isManualCareerOption(option) && onManualChange && manualValue?.trim()) {
        onManualChange('');
      }
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
  const activeThemeKey = String(themeColor || 'default').toLowerCase();
  const themeMap: Record<string, any> = {
    emerald: {
      action: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
      manualBox: 'border-emerald-300/80 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-950/20',
      manualHeader: 'text-emerald-800 dark:text-emerald-300',
      manualDot: 'bg-emerald-500',
      textarea: 'border-emerald-200 dark:border-emerald-800/60 focus-visible:ring-emerald-500 placeholder:text-emerald-900/40 dark:placeholder:text-emerald-100/40',
      matchBorder: 'border-emerald-200 dark:border-emerald-800/40',
      matchHeader: 'text-emerald-900 dark:text-emerald-200',
      sparkle: 'text-emerald-600 dark:text-emerald-400',
      pill: 'border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-400',
      plusIcon: 'text-emerald-600 dark:text-emerald-400',
      fallbackText: 'text-emerald-800 dark:text-emerald-300',
    },
    sky: {
      action: 'text-sky-600 hover:text-sky-700 dark:text-sky-400',
      badge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
      manualBox: 'border-sky-300/80 bg-sky-50/60 dark:border-sky-700/60 dark:bg-sky-950/20',
      manualHeader: 'text-sky-800 dark:text-sky-300',
      manualDot: 'bg-sky-500',
      textarea: 'border-sky-200 dark:border-sky-800/60 focus-visible:ring-sky-500 placeholder:text-sky-900/40 dark:placeholder:text-sky-100/40',
      matchBorder: 'border-sky-200 dark:border-sky-800/40',
      matchHeader: 'text-sky-900 dark:text-sky-200',
      sparkle: 'text-sky-600 dark:text-sky-400',
      pill: 'border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:border-sky-400',
      plusIcon: 'text-sky-600 dark:text-sky-400',
      fallbackText: 'text-sky-800 dark:text-sky-300',
    },
    amber: {
      action: 'text-amber-600 hover:text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
      manualBox: 'border-amber-300/80 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-950/20',
      manualHeader: 'text-amber-800 dark:text-amber-300',
      manualDot: 'bg-amber-500',
      textarea: 'border-amber-200 dark:border-amber-800/60 focus-visible:ring-amber-500 placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40',
      matchBorder: 'border-amber-200 dark:border-amber-800/40',
      matchHeader: 'text-amber-900 dark:text-amber-200',
      sparkle: 'text-amber-600 dark:text-amber-400',
      pill: 'border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400',
      plusIcon: 'text-amber-600 dark:text-amber-400',
      fallbackText: 'text-amber-800 dark:text-amber-300',
    },
    blue: {
      action: 'text-blue-600 hover:text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20',
      manualBox: 'border-blue-300/80 bg-blue-50/60 dark:border-blue-700/60 dark:bg-blue-950/20',
      manualHeader: 'text-blue-800 dark:text-blue-300',
      manualDot: 'bg-blue-500',
      textarea: 'border-blue-200 dark:border-blue-800/60 focus-visible:ring-blue-500 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40',
      matchBorder: 'border-blue-200 dark:border-blue-800/40',
      matchHeader: 'text-blue-900 dark:text-blue-200',
      sparkle: 'text-blue-600 dark:text-blue-400',
      pill: 'border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-400',
      plusIcon: 'text-blue-600 dark:text-blue-400',
      fallbackText: 'text-blue-800 dark:text-blue-300',
    },
    purple: {
      action: 'text-purple-600 hover:text-purple-700 dark:text-purple-400',
      badge: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20',
      manualBox: 'border-purple-300/80 bg-purple-50/60 dark:border-purple-700/60 dark:bg-purple-950/20',
      manualHeader: 'text-purple-800 dark:text-purple-300',
      manualDot: 'bg-purple-500',
      textarea: 'border-purple-200 dark:border-purple-800/60 focus-visible:ring-purple-500 placeholder:text-purple-900/40 dark:placeholder:text-purple-100/40',
      matchBorder: 'border-purple-200 dark:border-purple-800/40',
      matchHeader: 'text-purple-900 dark:text-purple-200',
      sparkle: 'text-purple-600 dark:text-purple-400',
      pill: 'border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-400',
      plusIcon: 'text-purple-600 dark:text-purple-400',
      fallbackText: 'text-purple-800 dark:text-purple-300',
    },
    teal: {
      action: 'text-teal-600 hover:text-teal-700 dark:text-teal-400',
      badge: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/20',
      manualBox: 'border-teal-300/80 bg-teal-50/60 dark:border-teal-700/60 dark:bg-teal-950/20',
      manualHeader: 'text-teal-800 dark:text-teal-300',
      manualDot: 'bg-teal-500',
      textarea: 'border-teal-200 dark:border-teal-800/60 focus-visible:ring-teal-500 placeholder:text-teal-900/40 dark:placeholder:text-teal-100/40',
      matchBorder: 'border-teal-200 dark:border-teal-800/40',
      matchHeader: 'text-teal-900 dark:text-teal-200',
      sparkle: 'text-teal-600 dark:text-teal-400',
      pill: 'border-teal-300 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/50 hover:border-teal-400',
      plusIcon: 'text-teal-600 dark:text-teal-400',
      fallbackText: 'text-teal-800 dark:text-teal-300',
    },
    rose: {
      action: 'text-rose-600 hover:text-rose-700 dark:text-rose-400',
      badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
      manualBox: 'border-rose-300/80 bg-rose-50/60 dark:border-rose-700/60 dark:bg-rose-950/20',
      manualHeader: 'text-rose-800 dark:text-rose-300',
      manualDot: 'bg-rose-500',
      textarea: 'border-rose-200 dark:border-rose-800/60 focus-visible:ring-rose-500 placeholder:text-rose-900/40 dark:placeholder:text-rose-100/40',
      matchBorder: 'border-rose-200 dark:border-rose-800/40',
      matchHeader: 'text-rose-900 dark:text-rose-200',
      sparkle: 'text-rose-600 dark:text-rose-400',
      pill: 'border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-400',
      plusIcon: 'text-rose-600 dark:text-rose-400',
      fallbackText: 'text-rose-800 dark:text-rose-300',
    },
    default: {
      action: 'text-primary hover:underline',
      badge: 'bg-primary/10 text-primary border-primary/20',
      manualBox: 'border-primary/30 bg-primary/[0.04] dark:border-primary/40 dark:bg-primary/[0.08]',
      manualHeader: 'text-primary',
      manualDot: 'bg-primary',
      textarea: 'border-primary/30 focus-visible:ring-primary',
      matchBorder: 'border-primary/20',
      matchHeader: 'text-primary',
      sparkle: 'text-primary',
      pill: 'border-primary/30 hover:border-primary hover:bg-primary/10 text-primary',
      plusIcon: 'text-primary',
      fallbackText: 'text-primary',
    },
  };
  const theme = themeMap[activeThemeKey] ?? themeMap.default ?? themeMap.emerald;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">{label}</Label>
        {options.length > 1 && !disabled && (
          <button
            type="button"
            className={cn('text-xs font-semibold hover:underline cursor-pointer transition-colors', theme.action)}
            onClick={() => {
              const nonManual = options.filter((o) => !isManualCareerOption(o));
              const topSuggestions = nonManual.slice(0, 3);
              const isTopSelected = topSuggestions.length > 0 && topSuggestions.every((o) => selected.includes(o));
              if (isTopSelected) {
                onChange(selected.filter((s) => !topSuggestions.includes(s)));
              } else {
                onChange([...new Set([...selected, ...topSuggestions])]);
              }
            }}
          >
            {options.filter((o) => !isManualCareerOption(o)).slice(0, 3).length > 0 &&
            options.filter((o) => !isManualCareerOption(o)).slice(0, 3).every((o) => selected.includes(o))
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
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border shadow-2xs',
                theme.badge
              )}
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSelected(item)}
                  className="hover:opacity-75 rounded p-0.5 transition-colors cursor-pointer"
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
        <div className={cn('space-y-2 rounded-xl border p-3.5 shadow-2xs', theme.manualBox)}>
          <div className={cn('flex items-center gap-1.5 text-xs font-semibold', theme.manualHeader)}>
            <span className={cn('flex h-2 w-2 rounded-full animate-pulse', theme.manualDot)} />
            <span>Özel / Manuel Belirtme & Anlık Sistem Eşleştirme:</span>
          </div>
          <Textarea
            value={manualValue ?? ''}
            disabled={disabled}
            rows={2}
            className={cn('min-h-[64px] bg-white dark:bg-zinc-900', theme.textarea)}
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
            <div className={cn('space-y-1.5 pt-2 border-t animate-in fade-in duration-200', theme.matchBorder)}>
              <div className={cn('flex items-center gap-1 text-[11px] font-semibold', theme.matchHeader)}>
                <Sparkles className={cn('h-3.5 w-3.5', theme.sparkle)} />
                <span>Eşleşen Sistem Seçenekleri (Seçmek için tıklayın):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {manualMatches.map((match) => (
                  <button
                    key={match.value}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border text-slate-800 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer',
                      theme.pill
                    )}
                    onClick={() => addMatchedOption(match.value)}
                  >
                    <Plus className={cn('h-3 w-3 font-bold', theme.plusIcon)} />
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
                className={cn('inline-flex items-center gap-1 text-[11px] hover:underline cursor-pointer', theme.fallbackText)}
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
