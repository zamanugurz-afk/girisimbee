'use client';

import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';
import { formatTurkishSentence } from '@/features/candidates/lib/career-text-quality';
import { cn } from '@/lib/utils';

export function CareerMultiSelect({
  label,
  options,
  value,
  onChange,
  manualValue,
  onManualChange,
  manualPlaceholder,
  searchPlaceholder,
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
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string | null;
}) {
  const selected = value ?? [];
  const showManual = selected.some((item) => isManualCareerOption(item));
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return options;
    return options.filter((option) => {
      if (isManualCareerOption(option) || selected.includes(option)) return true;
      return option.toLocaleLowerCase('tr-TR').includes(q);
    });
  }, [options, query, selected]);

  function toggle(option: string, checked: boolean) {
    if (checked) {
      const next = selected.includes(option) ? selected : [...selected, option];
      onChange(next);
      return;
    }
    onChange(selected.filter((item) => item !== option));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {options.length > 12 ? (
        <Input
          value={query}
          disabled={disabled}
          placeholder={searchPlaceholder ?? 'Listede ara...'}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : null}
      <div
        className={cn(
          'grid max-h-56 gap-1.5 overflow-y-auto rounded-lg border border-border/70 bg-background p-2 sm:grid-cols-2',
          error && 'border-destructive/40',
        )}
      >
        {visible.map((option) => {
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
        <Textarea
          value={manualValue ?? ''}
          disabled={disabled}
          rows={4}
          className="min-h-[96px]"
          placeholder={manualPlaceholder ?? 'Kendi ifadenizi yazın'}
          onKeyDownCapture={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(e) => onManualChange(e.target.value)}
          onBlur={() => {
            if (manualValue?.trim()) {
              onManualChange(formatTurkishSentence(manualValue));
            }
          }}
        />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
