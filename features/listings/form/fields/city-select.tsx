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
}

export function CitySelect({
  id,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Şehir seçin',
  extended = false,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => value ?? undefined, [value]);
  const cities = sortCitiesForPicker(extended ? LISTING_CITY_OPTIONS : TURKISH_CITIES);

  return (
    <div className="space-y-2">
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
              'h-10 w-full min-w-0 justify-between font-normal text-left',
              !value && 'text-muted-foreground',
              formControlErrorClass(error),
            )}
          >
            <span className="truncate flex-1">{selectedLabel ?? placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Şehir ara…" />
            <CommandList>
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
                        'mr-2 h-4 w-4',
                        value === city ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
