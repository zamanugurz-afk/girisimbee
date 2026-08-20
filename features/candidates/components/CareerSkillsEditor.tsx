'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { useOccupationalSuggestionCatalog } from '@/features/candidates/hooks/use-occupational-suggestions';
import {
  isManualCareerOption,
  joinSelectedList,
  MANUAL_OPTION,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { resolveOccupationalSuggestions } from '@/features/candidates/taxonomy/occupational-suggestions';
import { estimateTotalExperienceYears } from '@/features/candidates/lib/career-experience-dates';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

type SkillsValue = {
  professionalSkills: string;
  professionalSkillsOther?: string;
  technicalSkills: string;
  technicalSkillsOther?: string;
  leadershipExperience: string;
  tools: string;
  toolsOther?: string;
};

function uniqKeepOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function CareerSkillsEditor({
  value,
  onChange,
  disabled,
  sector,
  role,
  roleOther,
  experienceLevel,
  errors,
  audience = 'seeker',
  experienceRoles,
  experiences,
}: {
  value: SkillsValue;
  onChange: (patch: Partial<SkillsValue>) => void;
  disabled?: boolean;
  sector?: string | null;
  role?: string | null;
  roleOther?: string | null;
  experienceLevel?: string | null;
  errors?: Partial<Record<keyof SkillsValue, string>>;
  audience?: 'seeker' | 'hire';
  experienceRoles?: string[];
  experiences?: CareerExperience[];
}) {
  const isHire = audience === 'hire';
  const suggestions = useMemo(
    () =>
      resolveOccupationalSuggestions({
        audience: isHire ? 'hire' : 'seeker',
        sector,
        role,
        roleOther,
        experienceLevel,
        totalExperienceYears: estimateTotalExperienceYears(experiences ?? []),
        experiences: experiences?.length
          ? experiences
          : (experienceRoles ?? []).map((item) => ({ role: item })),
        professionalSkills: value.professionalSkills,
        technicalSkills: value.technicalSkills,
        tools: value.tools,
      }),
    [
      isHire,
      sector,
      role,
      roleOther,
      experienceLevel,
      experiences,
      experienceRoles,
      value.professionalSkills,
      value.technicalSkills,
      value.tools,
    ],
  );
  const catalog = useOccupationalSuggestionCatalog(suggestions, {
    audience: isHire ? 'hire' : 'seeker',
    sector,
    role,
    roleOther,
    experienceLevel,
    experiences,
    totalExperienceYears: estimateTotalExperienceYears(experiences ?? []),
  });
  const professionalOptions = catalog.professionalSkills;
  const technicalOptions = catalog.technicalSkills;
  const toolOptions = catalog.tools;

  const wantsManualProfessional = parseSelectedList(value.professionalSkills).some((item) =>
    isManualCareerOption(item),
  );
  const wantsManualTechnical = parseSelectedList(value.technicalSkills).some((item) =>
    isManualCareerOption(item),
  );
  const experienceManualText = (experiences ?? [])
    .flatMap((exp) => [exp.responsibilitiesOther, exp.achievementsOther, exp.roleOther])
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-5">
      <CareerMultiSelect
        label={isHire ? 'Aranan mesleki yetkinlikler' : 'Mesleki yetkinlikler'}
        options={professionalOptions}
        value={parseSelectedList(value.professionalSkills)}
        onChange={(next) => onChange({ professionalSkills: joinSelectedList(next) })}
        manualValue={value.professionalSkillsOther ?? ''}
        onManualChange={(next) => onChange({ professionalSkillsOther: next })}
        manualPlaceholder="Listede olmayan yetkinliği yazın"
        disabled={disabled}
        error={errors?.professionalSkills}
      />
      {!isHire && (wantsManualProfessional || experienceManualText.length >= 8) ? (
        <CareerManualAssist
          kind="skill"
          text={value.professionalSkillsOther || experienceManualText}
          catalog={professionalOptions}
          sector={sector ?? undefined}
          role={role ?? undefined}
          experienceLevel={experienceLevel ?? undefined}
          disabled={disabled}
          onAcceptCatalog={(items) => {
            const current = parseSelectedList(value.professionalSkills);
            const merged = uniqKeepOrder([...current, ...items]);
            if (wantsManualProfessional && !merged.some((item) => isManualCareerOption(item))) {
              merged.push(MANUAL_OPTION);
            }
            onChange({ professionalSkills: joinSelectedList(merged) });
          }}
        />
      ) : null}

      <CareerMultiSelect
        label={isHire ? 'Aranan teknik yetkinlikler' : 'Teknik yetkinlikler'}
        options={technicalOptions}
        value={parseSelectedList(value.technicalSkills)}
        onChange={(next) => onChange({ technicalSkills: joinSelectedList(next) })}
        manualValue={value.technicalSkillsOther ?? ''}
        onManualChange={(next) => onChange({ technicalSkillsOther: next })}
        manualPlaceholder="Listede olmayan teknik yetkinliği yazın"
        disabled={disabled}
        error={errors?.technicalSkills}
      />
      {!isHire && wantsManualTechnical ? (
        <CareerManualAssist
          kind="skill"
          text={value.technicalSkillsOther ?? ''}
          catalog={technicalOptions}
          sector={sector ?? undefined}
          role={role ?? undefined}
          experienceLevel={experienceLevel ?? undefined}
          disabled={disabled}
          onAcceptCatalog={(items) => {
            const current = parseSelectedList(value.technicalSkills);
            onChange({
              technicalSkills: joinSelectedList(
                uniqKeepOrder([...current, ...items, MANUAL_OPTION]),
              ),
            });
          }}
        />
      ) : null}

      <CareerMultiSelect
        label={isHire ? 'Aranan araçlar / programlar' : 'Kullanılan araçlar / programlar'}
        options={toolOptions}
        value={parseSelectedList(value.tools)}
        onChange={(next) => onChange({ tools: joinSelectedList(next) })}
        manualValue={value.toolsOther ?? ''}
        onManualChange={(next) => onChange({ toolsOther: next })}
        manualPlaceholder="Listede olmayan aracı yazın"
        searchPlaceholder="Araç veya program ara..."
        disabled={disabled}
        error={errors?.tools}
      />
    </div>
  );
}
