'use client';

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
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
  themeColor = 'blue',
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
              'flex h-11 min-h-[44px] w-full min-w-0 items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-normal text-left text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
              selectedValues.length === 0 && 'text-muted-foreground font-normal',
              selectedValues.length > 0 && 'text-foreground font-normal',
              formControlErrorClass(error),
            )}
          >
            <span className="truncate flex-1 text-sm">{summaryText}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0 transition-transform duration-200" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[300px] max-w-[500px] p-0 rounded-xl shadow-lg border border-border/80 bg-popover text-popover-foreground backdrop-blur-md dark:border-border dark:bg-card"
          align="start"
        >
          <Command themeColor={themeColor}>
            <CommandInput placeholder={searchPlaceholder} className="text-sm font-normal" />
            <CommandList className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </CommandEmpty>

              {selectedValues.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 text-xs text-muted-foreground bg-muted/20 rounded-md mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedValues.length} seçenek seçildi
                  </span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline text-xs transition-colors"
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
                        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 px-3 text-sm font-normal outline-none transition-colors leading-snug gap-2.5 my-0.5',
                        isSelected
                          ? 'bg-blue-50/90 text-blue-950 dark:bg-blue-950/50 dark:text-blue-200 font-medium'
                          : 'hover:bg-slate-100/80 dark:hover:bg-muted/60 text-slate-800 dark:text-slate-200 font-normal',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOption(option)}
                        className="h-4 w-4 rounded-[4px] border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:data-[state=checked]:bg-blue-500 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1 text-sm font-normal leading-snug text-slate-900 dark:text-slate-100">
                        {option}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 ml-auto" />
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
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-50/80 px-2.5 py-1 text-xs font-medium text-blue-900 dark:bg-blue-950/40 dark:border-blue-800/40 dark:text-blue-200 shadow-sm animate-in fade-in-50"
            >
              <span>{val}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeOption(e, val)}
                  className="rounded p-0.5 text-blue-700 hover:bg-blue-200/60 hover:text-blue-950 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
                  aria-label={`${val} kaldır`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {selectedValues.length > maxDisplayChips && (
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
              +{selectedValues.length - maxDisplayChips} daha
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
