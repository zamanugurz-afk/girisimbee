'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import {
  EDUCATION_FIELD_OPTIONS,
  getAllTaxonomyCertificates,
  joinSelectedList,
  MANUAL_OPTION,
  needsEducationField,
  parseSelectedList,
  suggestCertificates,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import { SetMatchingPicker } from '@/features/shared/components/set-matching-picker';

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
  sector,
  role,
  roleOther,
  experienceLevel,
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
  sector?: string | null;
  role?: string | null;
  roleOther?: string | null;
  experienceLevel?: string | null;
}) {
  const isHire = audience === 'hire';
  const showEducationField = needsEducationField(educationLevel);
  const fieldIsManual =
    educationField === MANUAL_OPTION || educationField === 'Diğer / Kendim gireceğim';
  const certificateOptions = useMemo(
    () =>
      suggestCertificates({
        audience: isHire ? 'hire' : 'seeker',
        sector,
        role,
        roleOther,
        experienceLevel,
        educationLevel,
        educationField: fieldIsManual ? educationFieldOther : educationField,
        certificates,
      }),
    [isHire, sector, role, roleOther, experienceLevel, educationLevel, educationField, educationFieldOther, fieldIsManual, certificates],
  );

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
          onChange={(e) => {
            const nextLevel = e.target.value;
            onChange({
              educationLevel: nextLevel,
              ...(needsEducationField(nextLevel)
                ? {}
                : { educationField: '', educationFieldOther: '' }),
            });
          }}
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

      {showEducationField ? (
        <SetMatchingPicker
          id="educationField"
          label={isHire ? 'Tercih edilen bölüm / alan' : 'Bölüm / alan'}
          domain="education-fields"
          mode="single"
          value={fieldIsManual ? educationFieldOther : educationField}
          onChange={(val) =>
            onChange({
              educationField: val,
              educationFieldOther: '',
            })
          }
          disabled={disabled}
          error={errors?.educationField}
          searchPlaceholder="Bölüm seçin veya kendiniz yazın (örn: Bilgisayar Mühendisliği)..."
        />
      ) : null}

      <CareerMultiSelect
        label={isHire ? 'Aranan sertifikalar' : 'Sertifikalar'}
        domain="certificates"
        catalog={getAllTaxonomyCertificates()}
        options={certificateOptions}
        value={parseSelectedList(certificates)}
        onChange={(next) => onChange({ certificates: joinSelectedList(next) })}
        manualValue={certificatesOther ?? ''}
        onManualChange={(next) => onChange({ certificatesOther: next })}
        manualPlaceholder="Listede olmayan sertifikayı yazın (örn: SEGEM, PMP, AWS)..."
        disabled={disabled}
        error={errors?.certificates}
      />
      {!isHire && parseSelectedList(certificates).some((item) => item === MANUAL_OPTION) ? (
        <CareerManualAssist
          kind="certificate"
          text={certificatesOther ?? ''}
          catalog={certificateOptions}
          disabled={disabled}
          onAcceptCatalog={(items) => {
            const current = parseSelectedList(certificates);
            const next = [...current];
            for (const item of items) {
              if (!next.includes(item)) next.push(item);
            }
            onChange({ certificates: joinSelectedList(next) });
          }}
        />
      ) : null}
    </div>
  );
}
