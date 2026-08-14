'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import {
  isManualCareerOption,
  joinSelectedList,
  MANUAL_OPTION,
  parseSelectedList,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { suggestTools } from '@/features/candidates/taxonomy/career-tools';
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
  experienceLevel?: string | null;
  errors?: Partial<Record<keyof SkillsValue, string>>;
  audience?: 'seeker' | 'hire';
  experienceRoles?: string[];
  experiences?: CareerExperience[];
}) {
  const isHire = audience === 'hire';
  const professionalOptions = useMemo(() => {
    const primary = suggestProfessionalSkills({ sector, role, experienceLevel });
    if (isHire || !experienceRoles?.length) return primary;
    const extra = experienceRoles.flatMap((expRole) =>
      suggestProfessionalSkills({ sector, role: expRole, experienceLevel }),
    );
    return uniqKeepOrder([...primary, ...extra]);
  }, [sector, role, experienceLevel, experienceRoles, isHire]);
  const technicalOptions = useMemo(() => {
    const primary = suggestTechnicalSkills({ sector, role });
    if (isHire || !experienceRoles?.length) return primary;
    const extra = experienceRoles.flatMap((expRole) =>
      suggestTechnicalSkills({ sector, role: expRole }),
    );
    return uniqKeepOrder([...primary, ...extra]);
  }, [sector, role, experienceRoles, isHire]);
  const toolOptions = useMemo(() => {
    const primary = suggestTools({ sector, role });
    if (isHire || !experienceRoles?.length) return primary;
    const extra = experienceRoles.flatMap((expRole) => suggestTools({ sector, role: expRole }));
    return uniqKeepOrder([...primary, ...extra]);
  }, [sector, role, experienceRoles, isHire]);

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

      <div className="space-y-1.5">
        <Label htmlFor="leadershipExperience">
          {isHire ? 'Yönetim / liderlik beklentisi' : 'Yönetim / liderlik deneyimi'}
        </Label>
        <p className="text-xs text-muted-foreground">
          {isHire
            ? 'Ekip, proje veya saha sorumluluğu bekliyorsanız kısaca yazın. Zorunlu değil.'
            : 'Kariyer seviyeniz ne olursa olsun gönüllü liderlik, proje sorumluluğu veya ekip çalışmasını yazabilirsiniz.'}
        </p>
        <Textarea
          id="leadershipExperience"
          rows={3}
          value={value.leadershipExperience}
          disabled={disabled}
          placeholder={
            isHire
              ? 'Örn: 5 kişilik saha ekibini yönetecek; hedef ve performans takibi yapacak.'
              : 'Örn: Öğrenci kulübünde proje ekibine liderlik ettim; 5 kişilik ekiple etkinlik organize ettim.'
          }
          onChange={(e) => onChange({ leadershipExperience: e.target.value })}
        />
        {errors?.leadershipExperience ? (
          <p className="text-sm text-destructive">{errors.leadershipExperience}</p>
        ) : null}
      </div>

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
