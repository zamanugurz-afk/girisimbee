'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import {
  CERTIFICATE_OPTIONS,
  EDUCATION_FIELD_OPTIONS,
  joinSelectedList,
  MANUAL_OPTION,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';

export function CareerEducationExtras({
  educationLevel,
  educationField,
  educationFieldOther,
  certificates,
  certificatesOther,
  onChange,
  disabled,
  errors,
  audience = 'seeker',
}: {
  educationLevel: string;
  educationField: string;
  educationFieldOther?: string;
  certificates: string;
  certificatesOther?: string;
  onChange: (patch: {
    educationLevel?: string;
    educationField?: string;
    educationFieldOther?: string;
    certificates?: string;
    certificatesOther?: string;
  }) => void;
  disabled?: boolean;
  errors?: {
    educationLevel?: string;
    educationField?: string;
    certificates?: string;
  };
  audience?: 'seeker' | 'hire';
}) {
  const isHire = audience === 'hire';
  const fieldIsManual =
    educationField === MANUAL_OPTION || educationField === 'Diğer / Kendim gireceğim';

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="educationLevel">
          {isHire ? 'Aranan eğitim seviyesi' : 'Eğitim seviyesi'}
        </Label>
        <select
          id="educationLevel"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={educationLevel}
          disabled={disabled}
          onChange={(e) => onChange({ educationLevel: e.target.value })}
        >
          <option value="">Seçin</option>
          {CAREER_EDUCATION_LEVELS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors?.educationLevel ? (
          <p className="text-sm text-destructive">{errors.educationLevel}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="educationField">
          {isHire ? 'Tercih edilen bölüm / alan' : 'Bölüm / alan'}
        </Label>
        <select
          id="educationField"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={educationField}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              educationField: e.target.value,
              educationFieldOther:
                e.target.value === MANUAL_OPTION ? educationFieldOther : '',
            })
          }
        >
          <option value="">Seçin</option>
          {EDUCATION_FIELD_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {fieldIsManual ? (
          <Input
            className="mt-2"
            value={educationFieldOther ?? ''}
            disabled={disabled}
            placeholder="Bölüm / alan yazın"
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(e) => onChange({ educationFieldOther: e.target.value })}
          />
        ) : null}
        {errors?.educationField ? (
          <p className="text-sm text-destructive">{errors.educationField}</p>
        ) : null}
      </div>

      <CareerMultiSelect
        label={isHire ? 'Aranan sertifikalar' : 'Sertifikalar'}
        options={[...CERTIFICATE_OPTIONS]}
        value={parseSelectedList(certificates)}
        onChange={(next) => onChange({ certificates: joinSelectedList(next) })}
        manualValue={certificatesOther ?? ''}
        onManualChange={(next) => onChange({ certificatesOther: next })}
        manualPlaceholder="Listede olmayan sertifikayı yazın"
        disabled={disabled}
        error={errors?.certificates}
      />
    </div>
  );
}
