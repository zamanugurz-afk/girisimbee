'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import {
  EDUCATION_FIELD_OPTIONS,
  joinSelectedList,
  MANUAL_OPTION,
  needsEducationField,
  parseSelectedList,
  suggestCertificates,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';

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
            <div className="mt-2 space-y-1.5 rounded-xl border border-amber-300/80 bg-amber-50/60 p-3 shadow-2xs dark:border-amber-700/60 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Kendi Bölümünüzü / Alanınızı Yazın:</span>
              </div>
              <Input
                className="bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800/60 focus-visible:ring-amber-500 placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40"
                value={educationFieldOther ?? ''}
                disabled={disabled}
                placeholder="Örn: Sermaye Piyasası ve Borsa"
                onKeyDown={(event) => event.stopPropagation()}
                onChange={(e) => onChange({ educationFieldOther: e.target.value })}
                onBlur={() => {
                  if (educationFieldOther?.trim()) {
                    onChange({ educationFieldOther: suggestTitleCaseTr(educationFieldOther) });
                  }
                }}
              />
              {!isHire ? (
                <CareerManualAssist
                  kind="education"
                  text={educationFieldOther ?? ''}
                  catalog={[...EDUCATION_FIELD_OPTIONS]}
                  disabled={disabled}
                  onAcceptCatalog={(items) => {
                    const first = items[0];
                    if (!first) return;
                    onChange({ educationField: first, educationFieldOther: '' });
                  }}
                />
              ) : null}
            </div>
          ) : null}
          {errors?.educationField ? (
            <p className="text-sm text-destructive">{errors.educationField}</p>
          ) : null}
        </div>
      ) : null}

      <CareerMultiSelect
        label={isHire ? 'Aranan sertifikalar' : 'Sertifikalar'}
        options={certificateOptions}
        value={parseSelectedList(certificates)}
        onChange={(next) => onChange({ certificates: joinSelectedList(next) })}
        manualValue={certificatesOther ?? ''}
        onManualChange={(next) => onChange({ certificatesOther: next })}
        manualPlaceholder="Listede olmayan sertifikayı yazın"
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
