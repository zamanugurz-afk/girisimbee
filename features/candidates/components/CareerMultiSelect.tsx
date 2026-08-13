'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import { cn } from '@/lib/utils';

export function CareerMultiSelect({
  label,
  options,
  value,
  onChange,
  manualValue,
  onManualChange,
  manualPlaceholder,
  disabled,
  error,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  manualValue?: string;
  onManualChange?: (next: string) => void;
  manualPlaceholder?: string;
  disabled?: boolean;
  error?: string | null;
}) {
  const selected = value ?? [];
  const showManual = selected.includes(MANUAL_OPTION);

  function toggle(option: string, checked: boolean) {
    if (checked) onChange([...selected, option]);
    else onChange(selected.filter((item) => item !== option));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          'grid max-h-56 gap-1.5 overflow-y-auto rounded-lg border border-border/70 bg-background p-2 sm:grid-cols-2',
          error && 'border-destructive/40',
        )}
      >
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(next) => toggle(option, next === true)}
              />
              <span className="leading-snug">{option}</span>
            </label>
          );
        })}
      </div>
      {showManual && onManualChange ? (
        <Input
          value={manualValue ?? ''}
          disabled={disabled}
          placeholder={manualPlaceholder ?? 'Kendi ifadenizi yazın'}
          onChange={(e) => onManualChange(e.target.value)}
        />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
