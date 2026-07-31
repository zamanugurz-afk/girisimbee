'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { formatTryPlain, parseTryInput } from '@/lib/utils';

interface CurrencyInputProps {
  id: string;
  value: unknown;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  disabled,
  error,
  placeholder = '0 TL',
  min,
  max,
}: CurrencyInputProps) {
  const numericValue =
    typeof value === 'number' ? value : value === undefined || value === null || value === '' ? undefined : Number(value);

  const [display, setDisplay] = useState(() =>
    numericValue !== undefined && !Number.isNaN(numericValue) ? formatTryPlain(numericValue) : '',
  );

  useEffect(() => {
    if (numericValue === undefined || Number.isNaN(numericValue)) {
      setDisplay('');
      return;
    }
    setDisplay(formatTryPlain(numericValue));
  }, [numericValue]);

  return (
    <div className="space-y-2">
      <Input
        id={id}
        inputMode="numeric"
        value={display}
        onChange={(event) => {
          const raw = event.target.value;
          setDisplay(raw);
          const parsed = parseTryInput(raw);
          onChange(parsed);
        }}
        onBlur={() => {
          if (numericValue !== undefined && !Number.isNaN(numericValue)) {
            setDisplay(formatTryPlain(numericValue));
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        className={formControlErrorClass(error)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
