'use client';

import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import {
  joinSelectedList,
  parseSelectedList,
  suggestAchievements,
  suggestResponsibilities,
} from '@/features/candidates/taxonomy/career-taxonomy';

export type HireRoleNeedsValue = {
  requiredResponsibilities: string;
  requiredResponsibilitiesOther?: string;
  requiredAchievements: string;
  requiredAchievementsOther?: string;
};

export function HireRoleNeedsEditor({
  value,
  onChange,
  disabled,
  sector,
  role,
  experienceLevel,
  errors,
}: {
  value: HireRoleNeedsValue;
  onChange: (patch: Partial<HireRoleNeedsValue>) => void;
  disabled?: boolean;
  sector?: string | null;
  role?: string | null;
  experienceLevel?: string | null;
  errors?: Partial<Record<keyof HireRoleNeedsValue, string>>;
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Seçenekler açık pozisyona göre dolar. Aday kariyer kartındaki yetkinliklerle aynı
        katalog kullanılır; eşleşme için aynı maddeleri işaretleyin.
      </p>
      <CareerMultiSelect
        label="Temel sorumluluklar"
        options={suggestResponsibilities({ sector, role, experienceLevel })}
        value={parseSelectedList(value.requiredResponsibilities)}
        onChange={(next) => onChange({ requiredResponsibilities: joinSelectedList(next) })}
        manualValue={value.requiredResponsibilitiesOther ?? ''}
        onManualChange={(next) => onChange({ requiredResponsibilitiesOther: next })}
        manualPlaceholder="Listede olmayan sorumluluğu yazın"
        disabled={disabled || !role}
        error={errors?.requiredResponsibilities}
      />
      <CareerMultiSelect
        label="Öne çıkan başarı beklentisi"
        options={suggestAchievements({ sector, role, experienceLevel })}
        value={parseSelectedList(value.requiredAchievements)}
        onChange={(next) => onChange({ requiredAchievements: joinSelectedList(next) })}
        manualValue={value.requiredAchievementsOther ?? ''}
        onManualChange={(next) => onChange({ requiredAchievementsOther: next })}
        manualPlaceholder="Listede olmayan başarı beklentisini yazın"
        disabled={disabled || !role}
        error={errors?.requiredAchievements}
      />
    </div>
  );
}
