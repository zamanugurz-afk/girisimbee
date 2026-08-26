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
import { Badge } from '@/components/ui/badge';
import { CurrencyInput } from '@/features/listings/form/fields/currency-input';
import { CitySelect } from '@/features/listings/form/fields/city-select';
import { DistrictSelect } from '@/features/listings/form/fields/district-select';
import { DigitalAiCapabilityPicker } from '@/features/listings/form/fields/digital-ai-capability-picker';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { getCustomFieldUi } from '@/features/listings/form/listing-field-metadata';
import { rankWorkplaceOptions, PARTNER_EXPERTISE_OPTIONS } from '@/features/listings/config/listing-field-options';
import { sortSectorsPopularThenAz } from '@/features/listings/lib/picker-sort';
import { MultiComboboxField } from '@/features/listings/form/fields/multi-combobox-field';
import { normalizeListingTitle, normalizeListingDescription } from '@/features/listings/lib/listing-content-quality';
import { ConditionalSectorPicker } from '@/features/listings/form/fields/conditional-sector-picker';
import { cn } from '@/lib/utils';
import {
  getExperienceLevelLabel,
  getPositionsForSector,
  MANUAL_OPTION,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { SmartCustomSelector } from '@/features/shared/components/smart-custom-selector';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';

/** Free-text name fields — Title Case on blur (İlk Harf Büyük). */
const TITLE_CASE_FIELD_KEYS = new Set([
  'fullName',
  'companyName',
  'brandName',
  'displayName',
  'productName',
  'businessName',
  'businessTypeOther',
  'preferredBusinessTypesOther',
  'positionTitle',
  'positionTitleOther',
  'desiredRole',
  'desiredRoleOther',
  'roleOther',
  'sectorOther',
  'preferredSectorsOther',
  'expertiseOther',
  'offeredSkillsOther',
  'technicalSkillsOther',
  'professionalSkillsOther',
  'toolsOther',
  'partnershipTypesOther',
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
    match: isManualOtherSelection,
  },
  roleOther: {
    parentKey: 'role',
    match: isManualOtherSelection,
  },
  businessTypeOther: {
    parentKey: 'businessType',
    match: isManualOtherSelection,
  },
  preferredBusinessTypesOther: {
    parentKey: 'preferredBusinessTypes',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => isManualOtherSelection(item)),
  },
  sectorOther: {
    parentKey: 'primarySector',
    match: (v) =>
      Array.isArray(v)
        ? v.map(String).some((item) => isManualOtherSelection(item))
        : isManualOtherSelection(v),
  },
  preferredSectorsOther: {
    parentKey: 'preferredSectors',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => isManualOtherSelection(item)),
  },
  preferredRolesOther: {
    parentKey: 'preferredRoles',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => isManualOtherSelection(item)),
  },
  preferredDistrictOther: {
    parentKey: 'preferredDistrict',
    match: isManualOtherSelection,
  },
  districtOther: {
    parentKey: 'district',
    match: isManualOtherSelection,
  },
  residenceDistrictOther: {
    parentKey: 'residenceDistrict',
    match: isManualOtherSelection,
  },
  educationFieldOther: {
    parentKey: 'educationField',
    match: isManualOtherSelection,
  },
  expertiseOther: {
    parentKey: 'expertise',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => isManualOtherSelection(item)),
  },
  offeredSkillsOther: {
    parentKey: 'offeredSkills',
    match: (v) =>
      Array.isArray(v) && v.map(String).some((item) => isManualOtherSelection(item)),
  },
};

export interface DynamicFieldContext {
  /** Sibling custom + core values for dependent fields (city → district). */
  values?: Record<string, unknown>;
  coreCity?: string | null;
  categoryId?: string | null;
  themeColor?: 'emerald' | 'sky' | 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'slate' | 'default' | string;
  onDismissPrunedNotice?: () => void;
}

export interface DynamicFieldProps {
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  context?: DynamicFieldContext;
  isCvFilled?: boolean;
}

export function DynamicField({
  field,
  value,
  onChange,
  error,
  disabled = false,
  context,
  isCvFilled,
}: DynamicFieldProps) {
  const id = `field-${field.key}`;
  const ui = getCustomFieldUi(field.key);

  const otherGate = OTHER_DETAIL_GATES[field.key];
  if (otherGate) {
    let parentValue = context?.values?.[otherGate.parentKey];
    if (field.key === 'sectorOther' && parentValue === undefined) {
      parentValue = context?.values?.['sectors'] ?? context?.values?.['sector'] ?? context?.values?.['primarySector'];
    }
    if (!otherGate.match(parentValue)) return null;
  }

  if (field.key === 'preferredSectors') {
    const rawTypes = context?.values?.preferredBusinessTypes;
    const selectedBusinessTypes = Array.isArray(rawTypes) ? rawTypes.map(String) : [];

    return (
      <ConditionalSectorPicker
        id={id}
        label={field.label}
        required={field.required}
        selectedBusinessTypes={selectedBusinessTypes}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helperText={ui.helperText}
        prunedNotice={Boolean(context?.values?.sectorsPrunedNotice)}
        onDismissPrunedNotice={context?.onDismissPrunedNotice}
      />
    );
  }

  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== '' &&
    !(Array.isArray(value) && value.length === 0);
  const showCvBadge = Boolean(isCvFilled && hasValue);

  if (field.key === 'fullName' || field.key === 'primarySector' || field.key === 'desiredRole') {
    console.log('[CV-STATE-TRACE]', {
      field: field.key,
      previousValue: undefined,
      nextValue: value,
      source: 'DynamicField',
      function: 'DynamicField:render',
      reason: 'controlled_prop_render',
      timestamp: new Date().toISOString(),
      cvImportCompleted: Boolean(isCvFilled),
      draftRestored: false,
      currentSector: (context?.values?.primarySector as string) || '',
    });
  }

  if (field.key === 'capabilities') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          {showCvBadge && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              ✨ CV&apos;den aktarıldı
            </span>
          )}
        </div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-xs font-semibold text-foreground">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          {field.type === 'multi-enum' && field.key !== 'sectors' && field.key !== 'preferredSectors' && Array.isArray(value) && value.length > 0 && (
            <Badge variant="secondary" className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20">
              {value.length} seçili
            </Badge>
          )}
        </div>
        {showCvBadge && (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            ✨ CV&apos;den aktarıldı
          </span>
        )}
      </div>

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
  const displayValue = stringValue;
  const stringLength = displayValue.length;

  if (field.key === 'fullName') {
    console.log('[CV-DYNAMIC-FIELD-TRACE]', {
      field: 'fullName',
      value,
      stringValue,
      displayValue,
      timestamp: new Date().toISOString(),
    });
  }

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
          themeColor={context?.themeColor}
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
          themeColor={context?.themeColor}
        />
        <FormFieldFooter helperText={ui.helperText} error={error} />
      </>
    );
  }

  switch (field.type) {
    case 'string': {
      const isOtherField = field.key.endsWith('Other') || field.key.includes('Other');
      if (isOtherField) {
        let domain: any = undefined;
        let catalog: string[] | undefined = undefined;

        if (field.key === 'sectorOther' || field.key === 'preferredSectorsOther') {
          domain = 'sectors';
        } else if (
          field.key === 'desiredRoleOther' ||
          field.key === 'positionTitleOther' ||
          field.key === 'preferredRolesOther' ||
          field.key === 'roleOther'
        ) {
          const currentSector = String(context?.values?.primarySector ?? context?.values?.sector ?? '');
          catalog = currentSector ? getPositionsForSector(currentSector) : undefined;
          if (!catalog || catalog.length === 0) domain = 'positions';
        } else if (field.key === 'districtOther' || field.key === 'preferredDistrictOther') {
          const currentCity = context?.coreCity ?? String(context?.values?.city ?? context?.values?.residenceCity ?? '');
          catalog = currentCity ? getDistrictsForCity(currentCity) : undefined;
        } else if (field.key === 'professionalSkillsOther' || field.key === 'skillsOther') {
          domain = 'professional-skills';
        } else if (field.key === 'technicalSkillsOther') {
          domain = 'technical-skills';
        } else if (field.key === 'toolsOther') {
          domain = 'tools';
        } else if (field.key === 'certificatesOther') {
          domain = 'certificates';
        } else if (field.key === 'expertiseOther' || field.key === 'offeredSkillsOther') {
          catalog = PARTNER_EXPERTISE_OPTIONS.filter((o) => o !== 'Diğer');
        }

        const activeThemeKey = (
          context?.themeColor ||
          (context?.categoryId === '44444444-4444-4000-8000-000000000004' || context?.categoryId === 'ise-al'
            ? 'emerald'
            : context?.categoryId === '33333333-3333-4000-8000-000000000003' || context?.categoryId === 'is-ariyorum'
              ? 'sky'
              : 'default')
        ).toLowerCase();

        const themeStyles: Record<string, { box: string; header: string; dot: string }> = {
          emerald: {
            box: 'border-emerald-300/90 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-950/20',
            header: 'text-emerald-800 dark:text-emerald-300',
            dot: 'bg-emerald-500',
          },
          sky: {
            box: 'border-sky-300/90 bg-sky-50/60 dark:border-sky-700/60 dark:bg-sky-950/20',
            header: 'text-sky-800 dark:text-sky-300',
            dot: 'bg-sky-500',
          },
          amber: {
            box: 'border-amber-300/90 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-950/20',
            header: 'text-amber-800 dark:text-amber-300',
            dot: 'bg-amber-500',
          },
          blue: {
            box: 'border-blue-300/90 bg-blue-50/60 dark:border-blue-700/60 dark:bg-blue-950/20',
            header: 'text-blue-800 dark:text-blue-300',
            dot: 'bg-blue-500',
          },
          purple: {
            box: 'border-purple-300/90 bg-purple-50/60 dark:border-purple-700/60 dark:bg-purple-950/20',
            header: 'text-purple-800 dark:text-purple-300',
            dot: 'bg-purple-500',
          },
          teal: {
            box: 'border-teal-300/90 bg-teal-50/60 dark:border-teal-700/60 dark:bg-teal-950/20',
            header: 'text-teal-800 dark:text-teal-300',
            dot: 'bg-teal-500',
          },
          rose: {
            box: 'border-rose-300/90 bg-rose-50/60 dark:border-rose-700/60 dark:bg-rose-950/20',
            header: 'text-rose-800 dark:text-rose-300',
            dot: 'bg-rose-500',
          },
          default: {
            box: 'border-primary/40 bg-primary/[0.04] dark:border-primary/40 dark:bg-primary/[0.08]',
            header: 'text-primary',
            dot: 'bg-primary',
          },
        };

        const activeBoxStyle = themeStyles[activeThemeKey] ?? themeStyles.default;

        return (
          <div className={cn('rounded-xl border p-3.5 shadow-2xs space-y-2', activeBoxStyle.box)}>
            <div className={cn('flex items-center gap-1.5 text-xs font-semibold', activeBoxStyle.header)}>
              <span className={cn('flex h-2 w-2 rounded-full animate-pulse', activeBoxStyle.dot)} />
              <span>Özel / Manuel Giriş Alanı:</span>
            </div>
            <SmartCustomSelector
              id={id}
              mode="single"
              domain={domain}
              catalog={catalog}
              value={displayValue}
              onChange={(val) => onChange(val)}
              disabled={disabled}
              themeColor={activeThemeKey}
              badgeColor={activeThemeKey}
              placeholder={ui.placeholder ?? `${field.label} girin veya sistemden seçin...`}
              helperText={ui.helperText}
              error={error}
              allowCustom
            />
          </div>
        );
      }

      return (
        <div>
          <Input
            id={id}
            lang="tr"
            spellCheck
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onBlur={applyTitleCaseIfNeeded}
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
        </div>
      );
    }

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
        console.log('[CV-DYNAMIC-FIELD-TRACE]', {
          field: 'primarySector',
          value,
          optionsCount: options.length,
          optionsIncludesValue: options.includes(String(value ?? '')),
          timestamp: new Date().toISOString(),
        });
      }
      if (field.key === 'desiredRole') {
        const sector = String(context?.values?.primarySector ?? '');
        const filtered = getPositionsForSector(sector || undefined);
        const current = value ? String(value) : '';
        options = current && !filtered.includes(current)
          ? [...filtered, current]
          : filtered;
        console.log('[CV-ROLE-TRACE]', {
          sector,
          rawValue: value,
          currentValue: current,
          allowedRoles: filtered,
          options,
          optionsIncludesCurrent: options.includes(current),
          resolvedValue: value ? String(value) : '',
          fallbackValue: ui.placeholder ?? `${field.label} seçin`,
          timestamp: new Date().toISOString(),
        });
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
            disabled={disabled}
          >
            <SelectTrigger id={id} className={cn('w-full min-w-0 truncate text-left', formControlErrorClass(error))}>
              <SelectValue
                placeholder={ui.placeholder ?? `${field.label} seçin`}
                className="truncate"
              />
            </SelectTrigger>
            <SelectContent themeColor={context?.themeColor}>
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
      let options = field.options ?? [];
      if (field.key === 'sectors' || field.key === 'preferredSectors') {
        options = sortSectorsPopularThenAz(options);
        return (
          <>
            <MultiComboboxField
              id={id}
              label={field.label}
              value={value}
              onChange={onChange}
              options={options}
              disabled={disabled}
              error={error}
              placeholder={ui.placeholder ?? `${field.label} seçin`}
              searchPlaceholder="Sektör ara…"
              themeColor={context?.themeColor}
            />
            <FormFieldFooter helperText={ui.helperText} error={error} />
          </>
        );
      }

      const selected = Array.isArray(value) ? value.map(String) : [];
      const isCompact = options.length > 12;

      function toggleOption(option: string, checked: boolean) {
        const next = checked
          ? [...selected, option]
          : selected.filter((item) => item !== option);
        onChange(next);
      }

      return (
        <>
          <div
            className={cn(
              'grid gap-2 sm:grid-cols-2 lg:grid-cols-3',
              isCompact && 'max-h-[280px] overflow-y-auto pr-1 py-0.5 scrollbar-thin',
            )}
          >
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  htmlFor={`${id}-${option}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-xs transition-all select-none',
                    checked
                      ? 'border-amber-500/60 bg-amber-500/8 font-medium text-foreground dark:border-amber-500/50 dark:bg-amber-500/10'
                      : 'border-border/80 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                    disabled && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <Checkbox
                    id={`${id}-${option}`}
                    checked={checked}
                    onCheckedChange={(next) => toggleOption(option, next === true)}
                    disabled={disabled}
                    className="mt-0.5 shrink-0 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 dark:data-[state=checked]:bg-amber-500"
                  />
                  <span className="leading-snug">{option}</span>
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
            lang="tr"
            spellCheck
            value={stringValue}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (stringValue.trim()) {
                const next = normalizeListingDescription(stringValue);
                if (next !== stringValue) onChange(next);
              }
            }}
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
