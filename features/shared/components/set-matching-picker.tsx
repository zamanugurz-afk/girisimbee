'use client';

import React, { useState, useMemo, useRef, useEffect, type KeyboardEvent } from 'react';
import { Plus, X, Search, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  getCanonicalCatalog,
  searchTaxonomyCatalog,
  formatCanonicalCustomValue,
  type SetDomain,
  type SetCatalogContext,
} from '@/features/shared/services/set-matching.service';

export interface SetMatchingPickerProps {
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
  customAddLabel?: (query: string) => string;
  maxItems?: number;
  disabled?: boolean;
  error?: string | null;
  suggestedItems?: readonly string[] | string[];
  badgeColor?: 'amber' | 'blue' | 'purple' | 'emerald' | 'slate' | 'default';
  className?: string;
  onCustomAdd?: (val: string) => void;
}

const COLOR_MAP = {
  amber: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  blue: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
  default: 'bg-primary/10 text-primary border-primary/20',
};

export function SetMatchingPicker({
  id,
  label,
  required = false,
  domain,
  domainContext,
  catalog: explicitCatalog,
  value,
  onChange,
  mode = 'multi',
  placeholder,
  searchPlaceholder,
  helperText,
  allowCustom = true,
  customAddLabel,
  maxItems,
  disabled = false,
  error,
  suggestedItems = [],
  badgeColor = 'default',
  className,
  onCustomAdd,
}: SetMatchingPickerProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Resolve active catalog
  const activeCatalog = useMemo(() => {
    if (explicitCatalog && explicitCatalog.length > 0) return explicitCatalog;
    if (domain) return getCanonicalCatalog(domain, domainContext);
    return [];
  }, [explicitCatalog, domain, domainContext]);

  // 2. Resolve selected values
  const selectedList = useMemo(() => {
    if (mode === 'single') {
      return value ? [String(value)] : [];
    }
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value, mode]);

  // 3. Search and score suggestions
  const suggestions = useMemo(() => {
    return searchTaxonomyCatalog(query, activeCatalog, {
      limit: 15,
      excludeValues: mode === 'multi' ? selectedList : [],
    });
  }, [query, activeCatalog, selectedList, mode]);

  // 4. Custom addition candidate
  const customCandidate = useMemo(() => {
    const raw = query.trim();
    if (!raw || !allowCustom) return null;
    const formatted = formatCanonicalCustomValue(raw);
    const isAlreadyExactMatch = suggestions.some(
      (s) => s.matchQuality === 'exact' || s.value.toLocaleLowerCase('tr-TR') === raw.toLocaleLowerCase('tr-TR'),
    );
    if (isAlreadyExactMatch) return null;
    return formatted;
  }, [query, allowCustom, suggestions]);

  // Reset highlight on query or list change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, suggestions.length]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(itemValue: string) {
    if (disabled) return;
    if (mode === 'single') {
      onChange(itemValue);
      setQuery('');
      setIsOpen(false);
      return;
    }

    if (maxItems && selectedList.length >= maxItems) return;
    if (!selectedList.includes(itemValue)) {
      const next = [...selectedList, itemValue];
      onChange(next);
    }
    setQuery('');
    inputRef.current?.focus();
  }

  function handleAddCustom() {
    if (!customCandidate || disabled) return;
    onCustomAdd?.(customCandidate);
    handleSelect(customCandidate);
  }

  function handleRemove(itemToRemove: string) {
    if (disabled) return;
    if (mode === 'single') {
      onChange('');
      return;
    }
    const next = selectedList.filter((item) => item !== itemToRemove);
    onChange(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (e.key === 'Backspace' && !query && selectedList.length > 0 && mode === 'multi') {
      e.preventDefault();
      handleRemove(selectedList[selectedList.length - 1]);
      return;
    }

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    const totalOptions = suggestions.length + (customCandidate ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalOptions === 0) return;

      if (customCandidate && highlightedIndex === suggestions.length) {
        handleAddCustom();
      } else if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  }

  // Available quick suggestion pills
  const availableQuickPills = useMemo(() => {
    return suggestedItems.filter((item) => !selectedList.includes(item)).slice(0, 10);
  }, [suggestedItems, selectedList]);

  const chipStyle = COLOR_MAP[badgeColor] || COLOR_MAP.default;

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-xs font-semibold text-foreground">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          {maxItems && mode === 'multi' && (
            <span className="text-[11px] text-muted-foreground">
              {selectedList.length}/{maxItems} seçildi
            </span>
          )}
        </div>
      )}

      {/* Selected Chips container (Multi Mode) */}
      {mode === 'multi' && selectedList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-zinc-800 dark:bg-zinc-900/40">
          {selectedList.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className={cn(
                'gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all',
                chipStyle,
              )}
            >
              <span className="leading-snug">{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="hover:opacity-75 focus:outline-none"
                  aria-label={`${item} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input / Combobox */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            disabled={disabled}
            placeholder={
              mode === 'single' && selectedList.length > 0
                ? selectedList[0]
                : searchPlaceholder || placeholder || 'Listeden ara veya kendin yaz...'
            }
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              'h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900',
              error && 'border-destructive/60 focus:border-destructive',
              disabled && 'opacity-60 cursor-not-allowed',
            )}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions List */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-md">
            {suggestions.length === 0 && !customCandidate && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Eşleşen sistem değeri bulunamadı.
              </div>
            )}

            {suggestions.map((suggestion, index) => {
              const isSelected = selectedList.includes(suggestion.value);
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  key={`${suggestion.value}-${index}`}
                  type="button"
                  onClick={() => handleSelect(suggestion.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer',
                    isHighlighted
                      ? 'bg-amber-500/10 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                      : 'text-foreground hover:bg-muted/50',
                    isSelected && 'opacity-60',
                  )}
                >
                  <span className="truncate">{suggestion.value}</span>
                  {suggestion.matchQuality === 'exact' && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Tam Eşleşme
                    </span>
                  )}
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />}
                </button>
              );
            })}

            {/* Custom Value Addition Button */}
            {customCandidate && (
              <button
                type="button"
                onClick={handleAddCustom}
                onMouseEnter={() => setHighlightedIndex(suggestions.length)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border-t border-border/70 p-2.5 text-left text-xs font-semibold transition-colors cursor-pointer mt-1',
                  highlightedIndex === suggestions.length
                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10',
                )}
              >
                <Plus className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="truncate">
                  {customAddLabel
                    ? customAddLabel(customCandidate)
                    : `"${customCandidate}" yeni değer olarak ekle`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Suggested Quick Add Pills */}
      {availableQuickPills.length > 0 && !disabled && (
        <div className="pt-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground mb-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Önerilenler:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableQuickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => handleSelect(pill)}
                className="rounded-lg border border-border/80 bg-muted/30 px-2 py-1 text-[11px] font-medium text-foreground hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
              >
                + {pill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text or error */}
      {error ? (
        <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
