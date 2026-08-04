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
import { formControlErrorClass } from '@/features/listings/form/field-error-styles';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { FieldLabelWithTooltip } from '@/features/listings/form/field-label-with-tooltip';
import { getCoreFieldUi } from '@/features/listings/form/listing-field-metadata';
import { autoCorrectTurkishText } from '@/features/listings/lib/turkish-text-autocorrect';
import { toast } from 'sonner';

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
}

const ALL_CORE_FIELDS: (keyof CoreListingFieldsInput)[] = [
  'title',
  'shortDescription',
  'longDescription',
  'city',
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
}: CoreFieldsProps) {
  const fields = include ?? ALL_CORE_FIELDS;
  const show = (key: keyof CoreListingFieldsInput) => fields.includes(key);
  const labelFor = (key: keyof CoreListingFieldsInput, fallback: string) =>
    labels?.[key] ?? fallback;
  const uiFor = (key: keyof CoreListingFieldsInput) => {
    const base = getCoreFieldUi(key);
    const override = fieldUi?.[key];
    return {
      ...base,
      ...override,
    };
  };

  function set<K extends keyof CoreListingFieldsInput>(key: K, val: CoreListingFieldsInput[K]) {
    onChange({ ...values, [key]: val });
  }

  function applyAutoCorrect(
    key: 'title' | 'shortDescription' | 'longDescription',
    mode: 'title' | 'body',
  ) {
    const current = String(values[key] ?? '');
    if (!current.trim()) return;
    const next = autoCorrectTurkishText(current, mode);
    if (next !== current) {
      set(key, next);
      toast.message('Yazım otomatik düzeltildi', {
        description: 'Türkçe yazım ve biçim kurallarına göre düzenlendi.',
        duration: 2200,
      });
    }
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
              onChange={(e) => set('title', e.target.value)}
              onBlur={() => applyAutoCorrect('title', 'title')}
              disabled={disabled}
              placeholder={ui.placeholder ?? 'Örn: İlan başlığınızı yazın'}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.title)}
            />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Her kelimenin ilk harfi büyük olmalıdır. Alanı terk edince yazım otomatik düzeltilir.'
              }
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
              htmlFor="core-short"
              label={labelFor('shortDescription', 'Kısa Açıklama')}
              required
            />
            <Textarea
              id="core-short"
              lang="tr"
              spellCheck
              value={values.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              onBlur={() => applyAutoCorrect('shortDescription', 'body')}
              disabled={disabled}
              rows={4}
              placeholder={ui.placeholder}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.shortDescription)}
            />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Alanı terk edince sık yazım hataları ve cümle başları otomatik düzeltilir.'
              }
              error={errors?.shortDescription}
              currentLength={values.shortDescription.length}
              maxLength={ui.maxLength}
            />
          </div>
        );
      })()}

      {show('longDescription') && (() => {
        const ui = getCoreFieldUi('longDescription');
        const length = (values.longDescription ?? '').length;
        return (
          <div className="space-y-2">
            <FieldLabelWithTooltip
              htmlFor="core-long"
              label={labelFor('longDescription', 'Detaylı Açıklama')}
              required
            />
            <Textarea
              id="core-long"
              lang="tr"
              spellCheck
              value={values.longDescription ?? ''}
              onChange={(e) => set('longDescription', e.target.value)}
              onBlur={() => applyAutoCorrect('longDescription', 'body')}
              disabled={disabled}
              rows={6}
              placeholder={ui.placeholder}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.longDescription)}
            />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Alanı terk edince sık yazım hataları ve cümle başları otomatik düzeltilir.'
              }
              error={errors?.longDescription}
              currentLength={length}
              maxLength={ui.maxLength}
            />
          </div>
        );
      })()}

      {(show('city') || show('remotePolicy')) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {show('city') && (() => {
            const ui = getCoreFieldUi('city');
            return (
              <div className="space-y-2">
                <FieldLabelWithTooltip htmlFor="core-city" label="Şehir" />
                <CitySelect
                  id="core-city"
                  value={values.city ?? null}
                  onChange={(city) => set('city', city)}
                  disabled={disabled}
                  error={errors?.city}
                  placeholder={ui.placeholder}
                  extended={extendedCities}
                />
                {!errors?.city && ui.helperText && (
                  <p className="text-xs text-muted-foreground">{ui.helperText}</p>
                )}
              </div>
            );
          })()}
          {show('remotePolicy') && (() => {
            const ui = getCoreFieldUi('remotePolicy');
            return (
              <div className="space-y-2">
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
                  <SelectContent>
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
