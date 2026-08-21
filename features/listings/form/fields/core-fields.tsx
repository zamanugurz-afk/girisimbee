'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import {
  normalizeListingDescription,
  normalizeListingTitle,
  type ListingQualityField,
} from '@/features/listings/lib/listing-content-quality';
import { isMeaningfulTextCorrection } from '@/features/listings/lib/turkish-text-autocorrect';

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

type SuggestionState = Partial<
  Record<ListingQualityField, { suggested: string; message: string }>
>;

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

  const [suggestions, setSuggestions] = useState<SuggestionState>({});

  function set<K extends keyof CoreListingFieldsInput>(key: K, val: CoreListingFieldsInput[K]) {
    onChange({ ...values, [key]: val });
  }

  function clearSuggestion(field: ListingQualityField) {
    setSuggestions((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function proposeCorrection(field: ListingQualityField) {
    const current = String(values[field] ?? '');
    if (!current.trim()) {
      clearSuggestion(field);
      return;
    }
    const suggested =
      field === 'title'
        ? normalizeListingTitle(current)
        : normalizeListingDescription(current);

    // No real wording/casing change — optionally apply cosmetic fixes silently
    // (e.g. trailing ".") so the banner never appears for identical-looking text.
    if (!isMeaningfulTextCorrection(current, suggested)) {
      if (suggested !== current) {
        set(field, suggested);
      }
      clearSuggestion(field);
      return;
    }

    setSuggestions((prev) => ({
      ...prev,
      [field]: {
        suggested,
        message:
          field === 'title'
            ? 'İlan başlığınızı daha okunabilir hale getirdik.'
            : 'Metniniz bazı yazım kurallarına göre düzenlendi.',
      },
    }));
  }

  function applySuggestion(field: ListingQualityField) {
    const item = suggestions[field];
    if (!item) return;
    set(field, item.suggested);
    clearSuggestion(field);
  }

  function SuggestionBanner({ field }: { field: ListingQualityField }) {
    const item = suggestions[field];
    if (!item) return null;
    const original = String(values[field] ?? '');
    return (
      <div className="rounded-lg border border-primary/25 bg-primary/[0.04] px-3 py-2 text-xs text-foreground">
        <p className="font-medium text-primary">{item.message}</p>
        <p className="mt-1 text-muted-foreground">
          <span className="line-through opacity-70">{original.slice(0, 160)}</span>
        </p>
        <p className="mt-0.5 font-medium">{item.suggested.slice(0, 180)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            disabled={disabled}
            // Prevent textarea blur from racing the apply click.
            onMouseDown={(e) => {
              e.preventDefault();
              applySuggestion(field);
            }}
          >
            Düzeltilmiş metni kullan
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              clearSuggestion(field);
            }}
          >
            Yok say
          </Button>
        </div>
      </div>
    );
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
                clearSuggestion('title');
              }}
              onBlur={() => proposeCorrection('title')}
              disabled={disabled}
              placeholder={ui.placeholder ?? 'Örn: İlan başlığınızı yazın'}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.title)}
            />
            <SuggestionBanner field="title" />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Alanı terk edince yazım önerisi gösterilir. Başlıkta emoji kullanmayın.'
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
              onChange={(e) => {
                set('shortDescription', e.target.value);
                clearSuggestion('shortDescription');
              }}
              onBlur={() => proposeCorrection('shortDescription')}
              disabled={disabled}
              rows={3}
              placeholder={ui.placeholder}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.shortDescription)}
            />
            <SuggestionBanner field="shortDescription" />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Alanı terk edince yazım ve noktalama önerisi gösterilir.'
              }
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
              htmlFor="core-long"
              label={labelFor('longDescription', 'Detaylı Açıklama')}
              required
            />
            <Textarea
              id="core-long"
              lang="tr"
              spellCheck
              value={values.longDescription ?? ''}
              onChange={(e) => {
                set('longDescription', e.target.value);
                clearSuggestion('longDescription');
              }}
              onBlur={() => proposeCorrection('longDescription')}
              disabled={disabled}
              rows={6}
              placeholder={ui.placeholder}
              maxLength={ui.maxLength}
              className={formControlErrorClass(errors?.longDescription)}
            />
            <SuggestionBanner field="longDescription" />
            <FormFieldFooter
              helperText={
                ui.helperText ??
                'Alanı terk edince yazım ve noktalama önerisi gösterilir.'
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
            const ui = uiFor('city');
            return (
              <div className="space-y-2">
                <FieldLabelWithTooltip htmlFor="core-city" label="Şehir" required={cityRequired} />
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
            const ui = uiFor('remotePolicy');
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
