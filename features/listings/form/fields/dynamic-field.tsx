'use client';

import type { ListingFieldDefinition } from '@/features/listings/types/listing-type.types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyInput } from '@/features/listings/form/fields/currency-input';
import { DigitalAiCapabilityPicker } from '@/features/listings/form/fields/digital-ai-capability-picker';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { getCustomFieldUi } from '@/features/listings/form/listing-field-metadata';
import { normalizeListingTitle } from '@/features/listings/lib/listing-content-quality';

/** Free-text name fields — Title Case on blur (İlk Harf Büyük). */
const TITLE_CASE_FIELD_KEYS = new Set([
  'companyName',
  'brandName',
  'displayName',
]);

export interface DynamicFieldProps {
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, error, disabled }: DynamicFieldProps) {
  const id = `field-${field.key}`;
  const ui = getCustomFieldUi(field.key);

  if (field.key === 'capabilities') {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <DigitalAiCapabilityPicker
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <FieldControl
        id={id}
        field={field}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        ui={ui}
      />
    </div>
  );
}

function FieldControl({
  id,
  field,
  value,
  onChange,
  disabled,
  error,
  ui,
}: {
  id: string;
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
  ui: ReturnType<typeof getCustomFieldUi>;
}) {
  const stringValue = String(value ?? '');
  const stringLength = stringValue.length;

  function applyTitleCaseIfNeeded() {
    if (!TITLE_CASE_FIELD_KEYS.has(field.key) || !stringValue.trim()) return;
    const next = normalizeListingTitle(stringValue);
    if (next !== stringValue) onChange(next);
  }

  switch (field.type) {
    case 'string':
      return (
        <>
          <Input
            id={id}
            lang="tr"
            spellCheck
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            onBlur={applyTitleCaseIfNeeded}
            disabled={disabled}
            placeholder={ui.placeholder ?? `${field.label} girin`}
            maxLength={ui.maxLength}
            className={formControlErrorClass(error)}
          />
          <FormFieldFooter
            helperText={
              TITLE_CASE_FIELD_KEYS.has(field.key)
                ? (ui.helperText
                    ? `${ui.helperText} Her kelimenin ilk harfi büyük olur.`
                    : 'Her kelimenin ilk harfi büyük olmalıdır. Alanı terk edince otomatik düzeltilir.')
                : ui.helperText
            }
            error={error}
            currentLength={ui.maxLength ? stringLength : undefined}
            maxLength={ui.maxLength}
          />
        </>
      );

    case 'number':
    case 'percentage':
      return (
        <>
          <Input
            id={id}
            type="number"
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.type === 'percentage' ? 0.1 : 'any'}
            placeholder={
              ui.placeholder
              ?? (field.type === 'percentage' ? '0-100' : `${field.label} girin`)
            }
            className={formControlErrorClass(error)}
          />
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );

    case 'currency':
      return (
        <CurrencyInput
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={error}
          placeholder={ui.placeholder ?? '0 TL'}
          min={field.min}
          max={field.max}
        />
      );

    case 'boolean':
      return (
        <>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );

    case 'date':
      return (
        <>
          <Input
            id={id}
            type="date"
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={ui.placeholder}
            className={formControlErrorClass(error)}
          />
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );

    case 'enum':
      return (
        <>
          <Select
            value={value ? String(value) : ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger id={id} className={formControlErrorClass(error)}>
              <SelectValue placeholder={ui.placeholder ?? `${field.label} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );

    case 'multi-enum': {
      const selected = Array.isArray(value) ? value.map(String) : [];
      const options = field.options ?? [];

      function toggleOption(option: string, checked: boolean) {
        const next = checked
          ? [...selected, option]
          : selected.filter((item) => item !== option);
        onChange(next);
      }

      return (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  htmlFor={`${id}-${option}`}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/80 px-3 py-2.5 text-sm transition-colors hover:bg-muted/30"
                >
                  <Checkbox
                    id={`${id}-${option}`}
                    checked={checked}
                    onCheckedChange={(next) => toggleOption(option, next === true)}
                    disabled={disabled}
                  />
                  <span className="leading-snug text-foreground">{option}</span>
                </label>
              );
            })}
          </div>
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );
    }

    default:
      return (
        <>
          <Textarea
            id={id}
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={ui.placeholder ?? `${field.label} girin`}
            maxLength={ui.maxLength}
            className={formControlErrorClass(error)}
          />
          <FormFieldFooter
            helperText={ui.helperText}
            error={error}
            currentLength={ui.maxLength ? stringLength : undefined}
            maxLength={ui.maxLength}
          />
        </>
      );
  }
}
