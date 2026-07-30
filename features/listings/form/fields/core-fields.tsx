'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CoreListingFieldsInput } from '@/features/listings/form/build-dynamic-schema';

const REMOTE_OPTIONS = ['onsite', 'hybrid', 'remote'] as const;

export interface CoreFieldsProps {
  values: CoreListingFieldsInput;
  onChange: (values: CoreListingFieldsInput) => void;
  errors?: Partial<Record<keyof CoreListingFieldsInput | string, string>>;
  disabled?: boolean;
  /** Show only these core fields — for step-based forms */
  include?: (keyof CoreListingFieldsInput)[];
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

export function CoreListingFields({ values, onChange, errors, disabled, include }: CoreFieldsProps) {
  const fields = include ?? ALL_CORE_FIELDS;
  const show = (key: keyof CoreListingFieldsInput) => fields.includes(key);
  function set<K extends keyof CoreListingFieldsInput>(key: K, val: CoreListingFieldsInput[K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="space-y-4">
      {show('title') && (
      <div className="space-y-2">
        <Label htmlFor="core-title">
          Başlık <span className="text-destructive">*</span>
        </Label>
        <Input
          id="core-title"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          disabled={disabled}
          placeholder="İlan başlığı"
        />
        {errors?.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>
      )}

      {show('shortDescription') && (
      <div className="space-y-2">
        <Label htmlFor="core-short">
          Kısa Açıklama <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="core-short"
          value={values.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="İlanınızı kısaca tanımlayın (min. 20 karakter)"
        />
        {errors?.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription}</p>}
      </div>
      )}

      {show('longDescription') && (
      <div className="space-y-2">
        <Label htmlFor="core-long">Detaylı Açıklama</Label>
        <Textarea
          id="core-long"
          value={values.longDescription ?? ''}
          onChange={(e) => set('longDescription', e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder="Detaylı açıklama, vizyon, beklentiler..."
        />
      </div>
      )}

      {(show('city') || show('remotePolicy')) && (
      <div className="grid gap-4 sm:grid-cols-2">
        {show('city') && (
        <div className="space-y-2">
          <Label htmlFor="core-city">Şehir</Label>
          <Input
            id="core-city"
            value={values.city ?? ''}
            onChange={(e) => set('city', e.target.value || null)}
            disabled={disabled}
            placeholder="İstanbul"
          />
        </div>
        )}
        {show('remotePolicy') && (
        <div className="space-y-2">
          <Label htmlFor="core-remote">Çalışma Modeli</Label>
          <Select
            value={values.remotePolicy ?? ''}
            onValueChange={(v) => set('remotePolicy', v as CoreListingFieldsInput['remotePolicy'])}
            disabled={disabled}
          >
            <SelectTrigger id="core-remote">
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              {REMOTE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt === 'onsite' ? 'Ofis' : opt === 'hybrid' ? 'Hibrit' : 'Uzaktan'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        )}
      </div>
      )}
    </div>
  );
}
