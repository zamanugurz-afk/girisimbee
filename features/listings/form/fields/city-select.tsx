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
import { TURKISH_CITIES, LISTING_CITY_OPTIONS } from '@/features/shared/constants/turkish-cities';
import { sortCitiesForPicker } from '@/features/listings/lib/picker-sort';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { cn } from '@/lib/utils';

interface CitySelectProps {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  /** Use extended listing cities (81 provinces + Istanbul sub-regions). */
  extended?: boolean;
  themeColor?: string;
}

export function CitySelect({
  id,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Şehir seçin',
  extended = true,
  themeColor,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => value ?? undefined, [value]);
  const cities = sortCitiesForPicker(extended ? LISTING_CITY_OPTIONS : TURKISH_CITIES);

  return (
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
            'h-11 min-h-[44px] w-full min-w-0 justify-between rounded-xl px-3.5 font-normal text-left bg-card text-sm text-foreground transition-all',
            !value && 'text-muted-foreground',
            value && 'text-foreground font-normal',
            formControlErrorClass(error),
          )}
        >
          <span className="truncate flex-1">{selectedLabel ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 rounded-xl shadow-lg border-border/80" align="start">
        <Command themeColor={themeColor}>
            <CommandInput placeholder="Şehir ara…" />
            <CommandList className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin">
              <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onChange(city === value ? null : city);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3.5 w-3.5 shrink-0',
                        value === city ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="leading-snug">{city}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
      </PopoverContent>
    </Popover>
  );
}
