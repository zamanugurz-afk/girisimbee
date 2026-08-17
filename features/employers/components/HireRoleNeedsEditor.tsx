'use client';

import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { rankCareerOptionsByLevel } from '@/features/candidates/ai/rank-options-by-level';
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
  const respOptions = rankCareerOptionsByLevel(
    suggestResponsibilities({ sector, role, experienceLevel }),
    experienceLevel,
  );
  const achOptions = rankCareerOptionsByLevel(
    suggestAchievements({ sector, role, experienceLevel }),
    experienceLevel,
  );

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Seçenekler açık pozisyona göre otomatik listelenir. Aday kariyer kartındaki yetkinliklerle aynı
        katalog kullanılır; en doğru eşleşme için pozisyona uygun maddeleri seçebilir veya kendi ifadenizi yazabilirsiniz.
      </p>
      <div className="space-y-2">
        <CareerMultiSelect
          label="Aranan Temel Sorumluluklar"
          options={respOptions}
          value={parseSelectedList(value.requiredResponsibilities)}
          onChange={(next) => onChange({ requiredResponsibilities: joinSelectedList(next) })}
          manualValue={value.requiredResponsibilitiesOther ?? ''}
          onManualChange={(next) => onChange({ requiredResponsibilitiesOther: next })}
          manualPlaceholder="Listede olmayan sorumluluğu yazın (Örn: Ekip yönetimi ve haftalık KPI takibi)..."
          disabled={disabled || !role}
          error={errors?.requiredResponsibilities}
        />
        {value.requiredResponsibilitiesOther?.trim() ? (
          <CareerManualAssist
            kind="responsibility"
            text={value.requiredResponsibilitiesOther}
            catalog={respOptions}
            sector={sector}
            experienceLevel={experienceLevel ?? undefined}
            disabled={disabled}
            onAcceptCatalog={(items) => {
              const current = parseSelectedList(value.requiredResponsibilities);
              const next = [...current];
              for (const item of items) {
                if (!next.includes(item)) next.push(item);
              }
              onChange({
                requiredResponsibilities: joinSelectedList(next),
                requiredResponsibilitiesOther: '',
              });
            }}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <CareerMultiSelect
          label="Öne Çıkan Başarı Beklentisi"
          options={achOptions}
          value={parseSelectedList(value.requiredAchievements)}
          onChange={(next) => onChange({ requiredAchievements: joinSelectedList(next) })}
          manualValue={value.requiredAchievementsOther ?? ''}
          onManualChange={(next) => onChange({ requiredAchievementsOther: next })}
          manualPlaceholder="Listede olmayan başarı beklentisini yazın (Örn: SLA karşılama oranının %95 üzerine çıkarılması)..."
          disabled={disabled || !role}
          error={errors?.requiredAchievements}
        />
        {value.requiredAchievementsOther?.trim() ? (
          <CareerManualAssist
            kind="achievement"
            text={value.requiredAchievementsOther}
            catalog={achOptions}
            sector={sector}
            experienceLevel={experienceLevel ?? undefined}
            disabled={disabled}
            onAcceptCatalog={(items) => {
              const current = parseSelectedList(value.requiredAchievements);
              const next = [...current];
              for (const item of items) {
                if (!next.includes(item)) next.push(item);
              }
              onChange({
                requiredAchievements: joinSelectedList(next),
                requiredAchievementsOther: '',
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
