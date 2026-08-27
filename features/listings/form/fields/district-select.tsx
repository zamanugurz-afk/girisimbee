'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { cn } from '@/lib/utils';

interface DistrictSelectProps {
  id?: string;
  city: string | null | undefined;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  themeColor?: string;
}

export function DistrictSelect({
  id,
  city,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'İlçe seçin',
  themeColor,
}: DistrictSelectProps) {
  const [open, setOpen] = useState(false);
  const districts = useMemo(() => getDistrictsForCity(city), [city]);
  const cityMissing = !city;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || cityMissing || districts.length === 0}
            className={cn(
              'flex h-11 min-h-[44px] w-full min-w-0 items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-normal text-left text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
              !value && 'text-muted-foreground font-normal',
              value && 'text-foreground font-normal',
              formControlErrorClass(error),
            )}
          >
            <span className="truncate flex-1 text-sm">{cityMissing ? 'Önce il seçin' : (value ?? placeholder)}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0 transition-transform duration-200" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-md dark:border-border dark:bg-card" align="start">
          <Command themeColor={themeColor}>
            <CommandInput placeholder="İlçe ara…" className="text-sm font-normal" />
            <CommandList className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">İlçe bulunamadı.</CommandEmpty>
              <CommandGroup>
                {districts.map((district) => (
                  <CommandItem
                    key={district}
                    value={district}
                    onSelect={() => {
                      onChange(district === value ? null : district);
                      setOpen(false);
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 px-3 text-sm font-normal outline-none transition-colors leading-snug gap-2 my-0.5',
                      value === district
                        ? 'bg-blue-50/90 text-blue-950 dark:bg-blue-950/50 dark:text-blue-200 font-medium'
                        : 'hover:bg-slate-100/80 dark:hover:bg-muted/60 text-slate-800 dark:text-slate-200 font-normal',
                    )}
                  >
                    <span className="flex-1 text-sm font-normal leading-snug">{district}</span>
                    {value === district && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
    </Popover>
  );
}
