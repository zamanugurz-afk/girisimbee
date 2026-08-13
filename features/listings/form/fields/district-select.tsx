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
}

export function DistrictSelect({
  id,
  city,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'İlçe seçin',
}: DistrictSelectProps) {
  const [open, setOpen] = useState(false);
  const districts = useMemo(() => getDistrictsForCity(city), [city]);
  const cityMissing = !city;

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
            disabled={disabled || cityMissing || districts.length === 0}
            className={cn(
              'h-10 w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              formControlErrorClass(error),
            )}
          >
            {cityMissing ? 'Önce il seçin' : (value ?? placeholder)}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="İlçe ara…" />
            <CommandList>
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
                        'mr-2 h-4 w-4',
                        value === district ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {district}
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
