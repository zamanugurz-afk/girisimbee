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
import { CitySelect } from '@/features/listings/form/fields/city-select';
import { DistrictSelect } from '@/features/listings/form/fields/district-select';
import { DigitalAiCapabilityPicker } from '@/features/listings/form/fields/digital-ai-capability-picker';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { getCustomFieldUi } from '@/features/listings/form/listing-field-metadata';
import { rankWorkplaceOptions } from '@/features/listings/config/listing-field-options';
import { sortSectorsPopularThenAz } from '@/features/listings/lib/picker-sort';
import { normalizeListingTitle } from '@/features/listings/lib/listing-content-quality';
import {
  getExperienceLevelLabel,
  getPositionsForSector,
  MANUAL_OPTION,
} from '@/features/candidates/taxonomy/career-taxonomy';

/** Free-text name fields — Title Case on blur (İlk Harf Büyük). */
const TITLE_CASE_FIELD_KEYS = new Set([
  'companyName',
  'brandName',
  'displayName',
]);

const CITY_FIELD_KEYS = new Set(['preferredCity', 'residenceCity']);
const DISTRICT_FIELD_KEYS = new Set(['preferredDistrict', 'district', 'residenceDistrict']);
const DATE_FIELD_KEYS = new Set(['birthDate']);

function isManualOtherSelection(value: unknown): boolean {
  const v = String(value ?? '');
  return v === 'Diğer' || v === MANUAL_OPTION || v === 'Diğer / Kendim gireceğim';
}

/** Shown only when the related parent selection is "Diğer". */
const OTHER_DETAIL_GATES: Record<string, { parentKey: string; match: (v: unknown) => boolean }> = {
  desiredRoleOther: {
    parentKey: 'desiredRole',
    match: isManualOtherSelection,
  },
  positionTitleOther: {
    parentKey: 'positionTitle',
    match: (v) => String(v ?? '') === 'Diğer',
  },
  sectorOther: {
    parentKey: 'preferredSectors',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => item === 'Diğer' || item === MANUAL_OPTION),
  },
  preferredRolesOther: {
    parentKey: 'preferredRoles',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => item === 'Diğer' || item === MANUAL_OPTION),
  },
  preferredDistrictOther: {
    parentKey: 'preferredDistrict',
    match: (v) => String(v ?? '') === 'Diğer',
  },
  districtOther: {
    parentKey: 'district',
    match: (v) => String(v ?? '') === 'Diğer',
  },
};

export interface DynamicFieldContext {
  /** Sibling custom + core values for dependent fields (city → district). */
  values?: Record<string, unknown>;
  coreCity?: string | null;
}

export interface DynamicFieldProps {
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  context?: DynamicFieldContext;
}

export function DynamicField({
  field,
  value,
  onChange,
  error,
  disabled,
  context,
}: DynamicFieldProps) {
  const id = `field-${field.key}`;
  const ui = getCustomFieldUi(field.key);

  const otherGate = OTHER_DETAIL_GATES[field.key];
  if (otherGate) {
    const parentValue = context?.values?.[otherGate.parentKey];
    if (!otherGate.match(parentValue)) return null;
  }

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
        context={context}
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
  context,
}: {
  id: string;
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
  ui: ReturnType<typeof getCustomFieldUi>;
  context?: DynamicFieldContext;
}) {
  const stringValue = String(value ?? '');
  const stringLength = stringValue.length;

  function applyTitleCaseIfNeeded() {
    if (!TITLE_CASE_FIELD_KEYS.has(field.key) || !stringValue.trim()) return;
    const next = normalizeListingTitle(stringValue);
    if (next !== stringValue) onChange(next);
  }

  if (CITY_FIELD_KEYS.has(field.key)) {
    return (
      <>
        <CitySelect
          id={id}
          value={stringValue || null}
          onChange={(city) => onChange(city ?? '')}
          disabled={disabled}
          error={error}
          placeholder={ui.placeholder ?? 'İl seçin'}
          extended
        />
        <FormFieldFooter helperText={ui.helperText} error={error} />
      </>
    );
  }

  if (DATE_FIELD_KEYS.has(field.key)) {
    return (
      <>
        <Input
          id={id}
          type="date"
          lang="tr"
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          max={new Date().toISOString().slice(0, 10)}
          className={formControlErrorClass(error)}
        />
        <FormFieldFooter helperText={ui.helperText} error={error} />
      </>
    );
  }

  if (DISTRICT_FIELD_KEYS.has(field.key)) {
    const city =
      field.key === 'preferredDistrict'
        ? String(context?.values?.preferredCity ?? '')
        : field.key === 'residenceDistrict'
          ? String(context?.values?.residenceCity ?? '')
        : (context?.coreCity ?? String(context?.values?.city ?? ''));
    return (
      <>
        <DistrictSelect
          id={id}
          city={city || null}
          value={stringValue || null}
          onChange={(district) => onChange(district ?? '')}
          disabled={disabled}
          error={error}
          placeholder={ui.placeholder ?? 'İlçe seçin'}
        />
        <FormFieldFooter helperText={ui.helperText} error={error} />
      </>
    );
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

    case 'enum': {
      let options = field.options ?? [];
      if (field.key === 'primarySector') {
        options = sortSectorsPopularThenAz(options);
      }
      if (field.key === 'desiredRole') {
        const sector = String(context?.values?.primarySector ?? '');
        if (sector) {
          const filtered = getPositionsForSector(sector);
          const current = value ? String(value) : '';
          options = current && !filtered.includes(current)
            ? [...filtered, current]
            : filtered;
        }
      }
      if (field.key === 'workplacePreference') {
        const rawRole = String(context?.values?.desiredRole ?? '');
        const role = isManualOtherSelection(rawRole)
          ? String(context?.values?.desiredRoleOther ?? '')
          : rawRole;
        options = rankWorkplaceOptions(String(context?.values?.primarySector ?? ''), role);
      }
      const currentValue = value ? String(value) : '';
      if (currentValue && !options.includes(currentValue)) {
        options = [...options, currentValue];
      }
      return (
        <>
          <Select
            value={value ? String(value) : ''}
            onValueChange={onChange}
            disabled={disabled || (field.key === 'desiredRole' && !context?.values?.primarySector)}
          >
            <SelectTrigger id={id} className={formControlErrorClass(error)}>
              <SelectValue
                placeholder={
                  field.key === 'desiredRole' && !context?.values?.primarySector
                    ? 'Önce sektör seçin'
                    : (ui.placeholder ?? `${field.label} seçin`)
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {field.key === 'experienceLevel' ? getExperienceLevelLabel(opt) : opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldFooter helperText={ui.helperText} error={error} />
        </>
      );
    }

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
