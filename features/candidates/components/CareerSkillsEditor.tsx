'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import {
  joinSelectedList,
  parseSelectedList,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';

type SkillsValue = {
  professionalSkills: string;
  professionalSkillsOther?: string;
  technicalSkills: string;
  technicalSkillsOther?: string;
  leadershipExperience: string;
  tools: string;
};

export function CareerSkillsEditor({
  value,
  onChange,
  disabled,
  sector,
  role,
  experienceLevel,
  errors,
}: {
  value: SkillsValue;
  onChange: (patch: Partial<SkillsValue>) => void;
  disabled?: boolean;
  sector?: string | null;
  role?: string | null;
  experienceLevel?: string | null;
  errors?: Partial<Record<keyof SkillsValue, string>>;
}) {
  return (
    <div className="space-y-5">
      <CareerMultiSelect
        label="Mesleki yetkinlikler"
        options={suggestProfessionalSkills({ sector, role, experienceLevel })}
        value={parseSelectedList(value.professionalSkills)}
        onChange={(next) => onChange({ professionalSkills: joinSelectedList(next) })}
        manualValue={value.professionalSkillsOther ?? ''}
        onManualChange={(next) => onChange({ professionalSkillsOther: next })}
        manualPlaceholder="Listede olmayan yetkinliği yazın"
        disabled={disabled}
        error={errors?.professionalSkills}
      />

      <CareerMultiSelect
        label="Teknik yetkinlikler"
        options={suggestTechnicalSkills({ sector, role })}
        value={parseSelectedList(value.technicalSkills)}
        onChange={(next) => onChange({ technicalSkills: joinSelectedList(next) })}
        manualValue={value.technicalSkillsOther ?? ''}
        onManualChange={(next) => onChange({ technicalSkillsOther: next })}
        manualPlaceholder="Listede olmayan teknik yetkinliği yazın"
        disabled={disabled}
        error={errors?.technicalSkills}
      />

      <div className="space-y-1.5">
        <Label htmlFor="leadershipExperience">Yönetim / liderlik deneyimi</Label>
        <p className="text-xs text-muted-foreground">
          Kariyer seviyeniz ne olursa olsun gönüllü liderlik, proje sorumluluğu veya ekip
          çalışmasını yazabilirsiniz.
        </p>
        <Textarea
          id="leadershipExperience"
          rows={3}
          value={value.leadershipExperience}
          disabled={disabled}
          placeholder="Örn: Öğrenci kulübünde proje ekibine liderlik ettim; 5 kişilik ekiple etkinlik organize ettim."
          onChange={(e) => onChange({ leadershipExperience: e.target.value })}
        />
        {errors?.leadershipExperience ? (
          <p className="text-sm text-destructive">{errors.leadershipExperience}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tools">Kullanılan araçlar / programlar</Label>
        <Input
          id="tools"
          value={value.tools}
          disabled={disabled}
          placeholder="Örn: Notion, Jira, Figma"
          onChange={(e) => onChange({ tools: e.target.value })}
        />
        {errors?.tools ? <p className="text-sm text-destructive">{errors.tools}</p> : null}
      </div>
    </div>
  );
}
