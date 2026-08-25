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
  badgeColor?: 'amber' | 'blue' | 'purple' | 'emerald' | 'default';
}

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
  badgeColor = 'amber',
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

  const badgeStyles = {
    amber: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    default: 'bg-primary/10 text-primary border-primary/20',
  }[badgeColor];

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
                badgeStyles
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
            error && 'border-rose-500 focus-visible:ring-rose-500'
          )}
        />
      </div>

      {/* Live Matching Suggestions */}
      {liveMatches.length > 0 && (
        <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-3 dark:border-amber-700/60 dark:bg-amber-950/30 space-y-1.5 transition-all">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3 w-3 text-amber-600 animate-pulse shrink-0" />
            <span>Eşleşen Sistem Seçenekleri (Seçmek için tıklayın):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {liveMatches.map(({ value: matchVal, matchQuality }) => (
              <button
                key={matchVal}
                type="button"
                onClick={() => handleSelect(matchVal)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
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