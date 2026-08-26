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
            'h-11 min-h-[42px] w-full min-w-0 justify-between rounded-xl px-3.5 font-normal text-left bg-card text-sm',
            !value && 'text-muted-foreground',
            formControlErrorClass(error),
          )}
        >
          <span className="truncate flex-1">{cityMissing ? 'Önce il seçin' : (value ?? placeholder)}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 rounded-xl shadow-lg border-border/80" align="start">
        <Command themeColor={themeColor}>
          <CommandInput placeholder="İlçe ara…" />
          <CommandList className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin">
            <CommandEmpty>İlçe bulunamadı.</CommandEmpty>
            <CommandGroup>
              {districts.map((district) => (
                <CommandItem
                  key={district}
                  value={district}
                  onSelect={() => {
                    onChange(district === value ? null : district);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-3.5 w-3.5 shrink-0',
                      value === district ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="leading-snug">{district}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
