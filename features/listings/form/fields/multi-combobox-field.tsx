'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { cn } from '@/lib/utils';

export interface MultiComboboxFieldProps {
  id?: string;
  label?: string;
  value: string[] | unknown;
  onChange: (value: string[]) => void;
  options: readonly string[];
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  themeColor?: string;
  maxDisplayChips?: number;
}

export function MultiComboboxField({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  placeholder = 'Seçim yapın',
  searchPlaceholder = 'Ara…',
  emptyText = 'Sonuç bulunamadı.',
  themeColor = 'amber',
  maxDisplayChips = 8,
}: MultiComboboxFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeOption = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== option));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Trigger text summary
  const summaryText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    if (selectedValues.length === 2) return `${selectedValues[0]}, ${selectedValues[1]}`;
    return `${selectedValues[0]}, ${selectedValues[1]} (+${selectedValues.length - 2})`;
  }, [selectedValues, placeholder]);

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-11 min-h-[44px] w-full min-w-0 justify-between rounded-xl px-3.5 font-normal text-left bg-card text-xs transition-all',
              selectedValues.length === 0 && 'text-muted-foreground',
              selectedValues.length > 0 && 'text-foreground font-medium',
              formControlErrorClass(error),
            )}
          >
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              <span className="truncate">{summaryText}</span>
              {selectedValues.length > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.2 text-[11px] font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 shrink-0"
                >
                  {selectedValues.length}
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[320px] max-w-[500px] p-0 rounded-xl shadow-lg border-border/80"
          align="start"
        >
          <Command themeColor={themeColor}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
              <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                {emptyText}
              </CommandEmpty>

              {selectedValues.length > 0 && (
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {selectedValues.length} seçenek seçildi
                  </span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium hover:underline text-[11px]"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              )}

              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => toggleOption(option)}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors',
                        isSelected
                          ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 font-medium'
                          : 'hover:bg-muted/60 text-foreground',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(option)}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 dark:data-[state=checked]:bg-amber-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1 leading-snug">{option}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags/chips below the combobox for easy overview and removal */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {selectedValues.slice(0, maxDisplayChips).map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in-50"
            >
              <span>{val}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeOption(e, val)}
                  className="rounded p-0.5 text-amber-700 hover:bg-amber-500/20 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100"
                  aria-label={`${val} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {selectedValues.length > maxDisplayChips && (
            <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
              +{selectedValues.length - maxDisplayChips} daha
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
