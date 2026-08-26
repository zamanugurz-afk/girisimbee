'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';
import { CitySelect } from '@/features/listings/form/fields/city-select';
import { DistrictSelect } from '@/features/listings/form/fields/district-select';
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { FieldLabelWithTooltip } from '@/features/listings/form/field-label-with-tooltip';
import { getCoreFieldUi } from '@/features/listings/form/listing-field-metadata';
import {
  normalizeListingDescription,
  normalizeListingTitle,
} from '@/features/listings/lib/listing-content-quality';

const REMOTE_OPTIONS = ['onsite', 'hybrid', 'remote'] as const;

export interface CoreFieldsProps {
  values: CoreListingFieldsInput;
  onChange: (values: CoreListingFieldsInput) => void;
  errors?: Partial<Record<keyof CoreListingFieldsInput | string, string>>;
  disabled?: boolean;
  /** Show only these core fields — for step-based forms */
  include?: (keyof CoreListingFieldsInput)[];
  /** Use extended city list with Istanbul sub-regions */
  extendedCities?: boolean;
  /** Override labels for core fields (e.g. job seeker long description). */
  labels?: Partial<Record<keyof CoreListingFieldsInput, string>>;
  /** Override helper / placeholder text for core fields. */
  fieldUi?: Partial<Record<keyof CoreListingFieldsInput, { helperText?: string; placeholder?: string }>>;
  /** Show a required asterisk on city when the category validates it. */
  cityRequired?: boolean;
  /** Category theme color for select highlights */
  themeColor?: 'emerald' | 'sky' | 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'slate' | 'default' | string;
}

const ALL_CORE_FIELDS: (keyof CoreListingFieldsInput)[] = [
  'title',
  'shortDescription',
  'longDescription',
  'city',
  'district',
  'remotePolicy',
  'location',
  'country',
  'companyId',
];

export function CoreListingFields({
  values,
  onChange,
  errors,
  disabled,
  include,
  extendedCities,
  labels,
  fieldUi,
  cityRequired,
  themeColor,
}: CoreFieldsProps) {
  const fields = include ?? ALL_CORE_FIELDS;
  const show = (key: keyof CoreListingFieldsInput) => {
    if (key === 'district') {
      return fields.includes('district') || fields.includes('city');
    }
    return fields.includes(key);
  };
  const labelFor = (key: keyof CoreListingFieldsInput, fallback: string) =>
    labels?.[key] ?? fallback;
  const uiFor = (key: keyof CoreListingFieldsInput) => {
    const base = getCoreFieldUi(key);
    const override = fieldUi?.[key];
    return {
      ...base,
      ...(override?.placeholder !== undefined && { placeholder: override.placeholder }),
      ...(override?.helperText !== undefined && { helperText: override.helperText }),
    };
  };

  function set<K extends keyof CoreListingFieldsInput>(key: K, val: CoreListingFieldsInput[K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="space-y-4">
      {show('title') && (() => {
        const ui = uiFor('title');
        return (
          <div className="space-y-2">
            <FieldLabelWithTooltip htmlFor="core-title" label={labelFor('title', 'Başlık')} required />
            <Input
              id="core-title"
              lang="tr"
              spellCheck
              value={values.title}
              onChange={(e) => {
                set('title', e.target.value);
              }}
              onBlur={() => {
                if (values.title?.trim()) {
                  const normalized = normalizeListingTitle(values.title);
                  if (normalized && normalized !== values.title) {
                    set('title', normalized);
                  }
                }
              }}
              disabled={disabled}
              placeholder={ui.placeholder ?? 'Örn: İlan başlığınızı yazın'}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.title)}
            />
            <FormFieldFooter
              helperText={ui.helperText}
              error={errors?.title}
              currentLength={values.title.length}
              maxLength={ui.maxLength}
            />
          </div>
        );
      })()}

      {show('shortDescription') && (() => {
        const ui = uiFor('shortDescription');
        return (
          <div className="space-y-2">
            <FieldLabelWithTooltip
              htmlFor="core-short-desc"
              label={labelFor('shortDescription', 'Kısa Açıklama')}
              required
            />
            <Textarea
              id="core-short-desc"
              lang="tr"
              spellCheck
              value={values.shortDescription}
              onChange={(e) => {
                set('shortDescription', e.target.value);
              }}
              onBlur={() => {
                if (values.shortDescription?.trim()) {
                  const normalized = normalizeListingDescription(values.shortDescription);
                  if (normalized && normalized !== values.shortDescription) {
                    set('shortDescription', normalized);
                  }
                }
              }}
              disabled={disabled}
              placeholder={ui.placeholder ?? 'Örn: İlanınızı özetleyen kısa bir açıklama yazın'}
              rows={3}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.shortDescription)}
            />
            <FormFieldFooter
              helperText={ui.helperText}
              error={errors?.shortDescription}
              currentLength={values.shortDescription.length}
              maxLength={ui.maxLength}
            />
          </div>
        );
      })()}

      {show('longDescription') && (() => {
        const ui = uiFor('longDescription');
        const length = (values.longDescription ?? '').length;
        return (
          <div className="space-y-2">
            <FieldLabelWithTooltip
              htmlFor="core-long-desc"
              label={labelFor('longDescription', 'Detaylı Açıklama')}
              required
            />
            <Textarea
              id="core-long-desc"
              lang="tr"
              spellCheck
              value={values.longDescription ?? ''}
              onChange={(e) => {
                set('longDescription', e.target.value);
              }}
              onBlur={() => {
                if (values.longDescription?.trim()) {
                  const normalized = normalizeListingDescription(values.longDescription);
                  if (normalized && normalized !== values.longDescription) {
                    set('longDescription', normalized);
                  }
                }
              }}
              disabled={disabled}
              placeholder={ui.placeholder ?? 'Örn: İlanınızla ilgili tüm detayları buraya yazın'}
              rows={6}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.longDescription)}
            />
            <FormFieldFooter
              helperText={ui.helperText}
              error={errors?.longDescription}
              currentLength={length}
              maxLength={ui.maxLength}
            />
          </div>
        );
      })()}

      {(show('city') || show('district') || show('remotePolicy')) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 items-start">
          {show('city') && (() => {
            const ui = uiFor('city');
            return (
              <div className="space-y-2 w-full min-w-0">
                <FieldLabelWithTooltip htmlFor="core-city" label="İl" required={cityRequired} />
                <CitySelect
                  id="core-city"
                  value={values.city ?? null}
                  onChange={(city) => {
                    onChange({ ...values, city, district: null });
                  }}
                  disabled={disabled}
                  error={errors?.city}
                  placeholder={ui.placeholder ?? 'İl seçin'}
                  extended={extendedCities}
                  themeColor={themeColor}
                />
                <FormFieldFooter helperText={ui.helperText} error={errors?.city} />
              </div>
            );
          })()}
          {show('district') && (() => {
            return (
              <div className="space-y-2 w-full min-w-0">
                <FieldLabelWithTooltip htmlFor="core-district" label="İlçe" />
                <DistrictSelect
                  id="core-district"
                  city={values.city ?? ''}
                  value={values.district ?? null}
                  onChange={(district) => set('district', district)}
                  disabled={disabled || !values.city}
                  error={errors?.district}
                  placeholder="İlçe seçin"
                  themeColor={themeColor}
                />
                <FormFieldFooter error={errors?.district} />
              </div>
            );
          })()}
          {show('remotePolicy') && (() => {
            const ui = uiFor('remotePolicy');
            return (
              <div className="space-y-2 w-full min-w-0">
                <FieldLabelWithTooltip htmlFor="core-remote" label="Çalışma Modeli" />
                <Select
                  value={values.remotePolicy ?? ''}
                  onValueChange={(v) =>
                    set('remotePolicy', v as CoreListingFieldsInput['remotePolicy'])
                  }
                  disabled={disabled}
                >
                  <SelectTrigger
                    id="core-remote"
                    className={formControlErrorClass(errors?.remotePolicy)}
                  >
                    <SelectValue placeholder={ui.placeholder} />
                  </SelectTrigger>
                  <SelectContent themeColor={themeColor}>
                    {REMOTE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt === 'onsite' ? 'Ofis' : opt === 'hybrid' ? 'Hibrit' : 'Uzaktan'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormFieldFooter helperText={ui.helperText} error={errors?.remotePolicy} />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
