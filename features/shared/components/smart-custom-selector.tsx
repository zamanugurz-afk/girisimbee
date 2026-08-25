'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  searchTaxonomyCatalog,
  getCanonicalCatalog,
  formatCanonicalCustomValue,
  type SetDomain,
  type SetCatalogContext,
} from '@/features/shared/services/set-matching.service';
import { cn } from '@/lib/utils';

export interface SmartCustomSelectorProps {
  id?: string;
  label?: string;
  required?: boolean;
  domain?: SetDomain;
  domainContext?: SetCatalogContext;
  catalog?: readonly string[] | string[];
  value: string[] | string | undefined | null;
  onChange: (value: any) => void;
  mode?: 'multi' | 'single';
  placeholder?: string;
  searchPlaceholder?: string;
  helperText?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  themeColor?: 'emerald' | 'sky' | 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'slate' | 'default' | string;
  badgeColor?: 'emerald' | 'sky' | 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'slate' | 'default' | string;
}

const SMART_SELECTOR_THEMES = {
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    focusRing: 'focus-visible:ring-emerald-500 focus:border-emerald-500',
    box: 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-700/60 dark:bg-emerald-950/30',
    headerText: 'text-emerald-800 dark:text-emerald-300',
    sparkle: 'text-emerald-600 dark:text-emerald-400',
    pill: 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100',
    pillIcon: 'text-emerald-600 dark:text-emerald-400',
    customText: 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300',
  },
  sky: {
    badge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30',
    focusRing: 'focus-visible:ring-sky-500 focus:border-sky-500',
    box: 'border-sky-300/80 bg-sky-50/70 dark:border-sky-700/60 dark:bg-sky-950/30',
    headerText: 'text-sky-800 dark:text-sky-300',
    sparkle: 'text-sky-600 dark:text-sky-400',
    pill: 'border-sky-300 dark:border-sky-700 hover:border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-900 dark:text-sky-100',
    pillIcon: 'text-sky-600 dark:text-sky-400',
    customText: 'text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
    focusRing: 'focus-visible:ring-amber-500 focus:border-amber-500',
    box: 'border-amber-300/80 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/30',
    headerText: 'text-amber-800 dark:text-amber-300',
    sparkle: 'text-amber-600 dark:text-amber-400',
    pill: 'border-amber-300 dark:border-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100',
    pillIcon: 'text-amber-600 dark:text-amber-400',
    customText: 'text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300',
  },
  blue: {
    badge: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30',
    focusRing: 'focus-visible:ring-blue-500 focus:border-blue-500',
    box: 'border-blue-300/80 bg-blue-50/70 dark:border-blue-700/60 dark:bg-blue-950/30',
    headerText: 'text-blue-800 dark:text-blue-300',
    sparkle: 'text-blue-600 dark:text-blue-400',
    pill: 'border-blue-300 dark:border-blue-700 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-100',
    pillIcon: 'text-blue-600 dark:text-blue-400',
    customText: 'text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
  },
  purple: {
    badge: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30',
    focusRing: 'focus-visible:ring-purple-500 focus:border-purple-500',
    box: 'border-purple-300/80 bg-purple-50/70 dark:border-purple-700/60 dark:bg-purple-950/30',
    headerText: 'text-purple-800 dark:text-purple-300',
    sparkle: 'text-purple-600 dark:text-purple-400',
    pill: 'border-purple-300 dark:border-purple-700 hover:border-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-900 dark:text-purple-100',
    pillIcon: 'text-purple-600 dark:text-purple-400',
    customText: 'text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300',
  },
  teal: {
    badge: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30',
    focusRing: 'focus-visible:ring-teal-500 focus:border-teal-500',
    box: 'border-teal-300/80 bg-teal-50/70 dark:border-teal-700/60 dark:bg-teal-950/30',
    headerText: 'text-teal-800 dark:text-teal-300',
    sparkle: 'text-teal-600 dark:text-teal-400',
    pill: 'border-teal-300 dark:border-teal-700 hover:border-teal-500 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-900 dark:text-teal-100',
    pillIcon: 'text-teal-600 dark:text-teal-400',
    customText: 'text-teal-700 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300',
  },
  rose: {
    badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30',
    focusRing: 'focus-visible:ring-rose-500 focus:border-rose-500',
    box: 'border-rose-300/80 bg-rose-50/70 dark:border-rose-700/60 dark:bg-rose-950/30',
    headerText: 'text-rose-800 dark:text-rose-300',
    sparkle: 'text-rose-600 dark:text-rose-400',
    pill: 'border-rose-300 dark:border-rose-700 hover:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-900 dark:text-rose-100',
    pillIcon: 'text-rose-600 dark:text-rose-400',
    customText: 'text-rose-700 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300',
  },
  slate: {
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    focusRing: 'focus-visible:ring-slate-500 focus:border-slate-500',
    box: 'border-slate-300 bg-slate-100/70 dark:border-slate-700 dark:bg-slate-900/40',
    headerText: 'text-slate-800 dark:text-slate-200',
    sparkle: 'text-slate-600 dark:text-slate-400',
    pill: 'border-slate-300 dark:border-slate-700 hover:border-slate-500 hover:bg-slate-200 text-slate-900 dark:text-slate-100',
    pillIcon: 'text-slate-600 dark:text-slate-400',
    customText: 'text-slate-700 hover:text-slate-900 dark:text-slate-300',
  },
  default: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    focusRing: 'focus-visible:ring-primary focus:border-primary',
    box: 'border-primary/30 bg-primary/[0.04] dark:border-primary/40 dark:bg-primary/[0.08]',
    headerText: 'text-primary',
    sparkle: 'text-primary',
    pill: 'border-primary/30 hover:border-primary hover:bg-primary/10 text-primary',
    pillIcon: 'text-primary',
    customText: 'text-primary hover:underline',
  },
};

export function SmartCustomSelector({
  id,
  label,
  required = false,
  domain,
  domainContext,
  catalog: explicitCatalog,
  value,
  onChange,
  mode = 'multi',
  placeholder = 'Yazmaya başlayın...',
  searchPlaceholder = 'Seçenek ara veya kendin yaz...',
  helperText,
  allowCustom = true,
  disabled = false,
  error,
  className,
  themeColor,
  badgeColor = 'default',
}: SmartCustomSelectorProps) {
  const [inputValue, setInputValue] = useState('');

  // 1. Resolve full catalog
  const activeCatalog = useMemo(() => {
    if (explicitCatalog && explicitCatalog.length > 0) return explicitCatalog;
    if (domain) return getCanonicalCatalog(domain, domainContext);
    return [];
  }, [explicitCatalog, domain, domainContext]);

  // 2. Resolve selected list
  const selectedList = useMemo(() => {
    if (mode === 'single') {
      return value ? [String(value)] : [];
    }
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(' · ').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value, mode]);

  // 3. Search and score suggestions
  const liveMatches = useMemo(() => {
    const raw = inputValue.trim();
    if (!raw || raw.length < 1) return [];
    return searchTaxonomyCatalog(raw, activeCatalog, {
      limit: 6,
      excludeValues: selectedList,
    });
  }, [inputValue, activeCatalog, selectedList]);

  function handleSelect(item: string) {
    if (disabled) return;
    if (mode === 'single') {
      onChange(item);
      setInputValue('');
      return;
    }
    if (!selectedList.includes(item)) {
      const next = [...selectedList, item];
      onChange(next);
    }
    setInputValue('');
  }

  function handleRemove(item: string) {
    if (disabled) return;
    if (mode === 'single') {
      onChange('');
      return;
    }
    const next = selectedList.filter((s) => s !== item);
    onChange(next);
  }

  function handleAddCustom() {
    if (disabled || !inputValue.trim()) return;
    const formatted = formatCanonicalCustomValue(inputValue);
    handleSelect(formatted);
  }

  const activeThemeKey = (themeColor || badgeColor || 'default').toLowerCase();
  const theme = (SMART_SELECTOR_THEMES as any)[activeThemeKey] ?? SMART_SELECTOR_THEMES.default;

  return (
    <div className={cn('space-y-2 w-full min-w-0', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-rose-500 font-bold ml-1">*</span>}
          </Label>
          {selectedList.length > 0 && mode === 'multi' && (
            <Badge variant="secondary" className="text-[11px] font-medium">
              {selectedList.length} seçili
            </Badge>
          )}
        </div>
      )}

      {/* Selected Chips */}
      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-muted/40 border border-border/60">
          {selectedList.map((item) => (
            <span
              key={item}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border shadow-2xs transition-all',
                theme.badge
              )}
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded-full hover:bg-rose-500/10 transition-colors"
                  aria-label={`${item} seçeneğini kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (liveMatches.length > 0) {
                handleSelect(liveMatches[0].value);
              } else if (allowCustom && inputValue.trim()) {
                handleAddCustom();
              }
            }
          }}
          disabled={disabled}
          placeholder={selectedList.length > 0 && mode === 'single' ? selectedList[0] : (placeholder || searchPlaceholder)}
          className={cn(
            'h-11 min-h-[42px] w-full min-w-0 rounded-xl px-3.5 text-sm',
            theme.focusRing,
            error && 'border-rose-500 focus-visible:ring-rose-500'
          )}
        />
      </div>

      {/* Live Matching Suggestions */}
      {liveMatches.length > 0 && (
        <div className={cn('rounded-xl border p-3 space-y-1.5 transition-all', theme.box)}>
          <div className={cn('flex items-center gap-1.5 text-[11px] font-semibold', theme.headerText)}>
            <Sparkles className={cn('h-3 w-3 animate-pulse shrink-0', theme.sparkle)} />
            <span>Eşleşen Sistem Seçenekleri (Seçmek için tıklayın):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {liveMatches.map(({ value: matchVal, matchQuality }) => (
              <button
                key={matchVal}
                type="button"
                onClick={() => handleSelect(matchVal)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border shadow-2xs cursor-pointer transition-all active:scale-95',
                  theme.pill
                )}
              >
                <Plus className={cn('h-3 w-3 shrink-0', theme.pillIcon)} />
                <span>{matchVal}</span>
                {matchQuality === 'exact' && (
                  <span className="text-[10px] text-emerald-600 font-bold ml-0.5">(Tam)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Custom Addition Option */}
      {allowCustom && inputValue.trim().length > 1 && !liveMatches.some((m) => m.matchQuality === 'exact') && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleAddCustom}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer',
              theme.customText
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>
              <strong>&ldquo;{formatCanonicalCustomValue(inputValue)}&rdquo;</strong> değerini seçenek olarak ekle
            </span>
          </button>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}