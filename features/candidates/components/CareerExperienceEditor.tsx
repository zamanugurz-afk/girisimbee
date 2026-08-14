'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createEmptyCareerExperience,
  type CareerExperience,
} from '@/features/candidates/config/career-profile-fields';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import { rankCareerOptionsByLevel } from '@/features/candidates/ai/rank-options-by-level';
import {
  MONTH_OPTIONS,
  validateExperienceOverlaps,
  yearOptions,
} from '@/features/candidates/lib/career-experience-dates';
import {
  getPositionsForSector,
  isManualCareerOption,
  MANUAL_OPTION,
  suggestAchievements,
  suggestProfessionalSkills,
  suggestResponsibilities,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { sortSectorsPopularThenAz } from '@/features/listings/lib/picker-sort';
import { cn } from '@/lib/utils';

export function CareerExperienceEditor({
  value,
  onChange,
  error,
  disabled,
  experienceLevel,
}: {
  value: CareerExperience[];
  onChange: (next: CareerExperience[]) => void;
  error?: string | null;
  disabled?: boolean;
  experienceLevel?: string | null;
}) {
  const rows = value.length > 0 ? value : [createEmptyCareerExperience()];
  const years = yearOptions();
  const overlapError = rows.length > 1 ? validateExperienceOverlaps(rows) : null;

  function updateRow(id: string, patch: Partial<CareerExperience>) {
    onChange(
      rows.map((row, index) => {
        if (row.id !== id) {
          return index === 0 ? row : { ...row, isCurrent: false };
        }
        const nextCurrent = index === 0 && (patch.isCurrent ?? row.isCurrent);
        return {
          ...row,
          ...patch,
          isCurrent: Boolean(nextCurrent),
          ...(nextCurrent ? { endMonth: null, endYear: null } : {}),
        };
      }),
    );
  }

  function addRow() {
    onChange([
      ...rows.map((row, index) => (index === 0 ? row : { ...row, isCurrent: false })),
      createEmptyCareerExperience(),
    ]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) {
      onChange([createEmptyCareerExperience()]);
      return;
    }
    onChange(rows.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Şirket bilgisini kaydedebilirsiniz; kamu kariyer kartında şirket adı, logo ve URL
        gösterilmez. Deneyimleri yeniden eskiye yazın. “Halen çalışıyorum” yalnızca en son
        deneyimde seçilebilir. Deneyim tarihleri çakışamaz.
      </p>

      {rows.map((row, index) => {
        const endYears = row.startYear ? years.filter((year) => year >= row.startYear!) : years;
        const positions = getPositionsForSector(row.sector);
        const roleIsManual = isManualCareerOption(row.role);
        const resolvedRole = roleIsManual ? row.roleOther : row.role;
        const responsibilities = rankCareerOptionsByLevel(
          suggestResponsibilities({
            sector: row.sector,
            role: resolvedRole,
            experienceLevel,
          }),
          experienceLevel,
        );
        const achievements = rankCareerOptionsByLevel(
          suggestAchievements({
            sector: row.sector,
            role: resolvedRole,
            experienceLevel,
          }),
          experienceLevel,
        );
        const skillCatalog = [
          ...suggestProfessionalSkills({
            sector: row.sector,
            role: resolvedRole,
            experienceLevel,
          }),
          ...suggestTechnicalSkills({
            sector: row.sector,
            role: resolvedRole,
          }),
        ];
        const wantsManualResp = (row.selectedResponsibilities ?? []).some((item) =>
          isManualCareerOption(item),
        );
        const wantsManualAch = (row.selectedAchievements ?? []).some((item) =>
          isManualCareerOption(item),
        );

        return (
          <div
            key={row.id}
            className={cn(
              'space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4',
              error && 'border-destructive/40',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Deneyim {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-destructive"
                disabled={disabled}
                onClick={() => removeRow(row.id)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Sil
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`sector-${row.id}`}>Sektör</Label>
                <select
                  id={`sector-${row.id}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={row.sector}
                  disabled={disabled}
                  onChange={(e) =>
                    updateRow(row.id, {
                      sector: e.target.value,
                      role: '',
                      roleOther: '',
                      selectedResponsibilities: [],
                      selectedAchievements: [],
                    })
                  }
                >
                  <option value="">Seçin</option>
                  {sortSectorsPopularThenAz(JOB_SECTOR_OPTIONS).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`role-${row.id}`}>Pozisyon</Label>
                <select
                  id={`role-${row.id}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={row.role}
                  disabled={disabled || !row.sector}
                  onChange={(e) =>
                    updateRow(row.id, {
                      role: e.target.value,
                      roleOther: isManualCareerOption(e.target.value) ? row.roleOther : '',
                      selectedResponsibilities: [],
                      selectedAchievements: [],
                    })
                  }
                >
                  <option value="">{row.sector ? 'Seçin' : 'Önce sektör seçin'}</option>
                  {positions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {roleIsManual ? (
                  <>
                    <Input
                      className="mt-2"
                      value={row.roleOther ?? ''}
                      disabled={disabled}
                      placeholder="Pozisyonunuzu yazın"
                      onKeyDown={(event) => event.stopPropagation()}
                      onChange={(e) => updateRow(row.id, { roleOther: e.target.value })}
                    />
                    <CareerManualAssist
                      kind="role"
                      text={row.roleOther ?? ''}
                      catalog={positions}
                      sector={row.sector}
                      experienceLevel={experienceLevel ?? undefined}
                      disabled={disabled}
                      onAcceptCatalog={(items) => {
                        const first = items[0];
                        if (!first) return;
                        updateRow(row.id, { role: first, roleOther: '' });
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`company-${row.id}`}>Şirket (isteğe bağlı, kamuya kapalı)</Label>
              <Input
                id={`company-${row.id}`}
                value={row.company ?? ''}
                disabled={disabled}
                placeholder="Yalnızca sizin kaydınızda saklanır"
                onKeyDown={(event) => event.stopPropagation()}
                onChange={(e) => updateRow(row.id, { company: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Başlangıç tarihi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={row.startMonth ?? ''}
                    disabled={disabled}
                    onChange={(e) =>
                      updateRow(row.id, {
                        startMonth: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Ay</option>
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={row.startYear ?? ''}
                    disabled={disabled}
                    onChange={(e) =>
                      updateRow(row.id, {
                        startYear: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Yıl</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bitiş tarihi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={row.endMonth ?? ''}
                    disabled={disabled || row.isCurrent}
                    onChange={(e) =>
                      updateRow(row.id, {
                        endMonth: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Ay</option>
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={row.endYear ?? ''}
                    disabled={disabled || row.isCurrent}
                    onChange={(e) =>
                      updateRow(row.id, {
                        endYear: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Yıl</option>
                    {endYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {index === 0 ? (
                <label className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={Boolean(row.isCurrent)}
                    disabled={disabled}
                    onCheckedChange={(next) =>
                      updateRow(row.id, {
                        isCurrent: next === true,
                      })
                    }
                  />
                  Halen çalışıyorum
                </label>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Geçmiş deneyimde “Halen çalışıyorum” seçilemez.
                  </p>
                )}
              </div>
            </div>

            <CareerMultiSelect
              label="Temel sorumluluklar"
              options={responsibilities}
              value={row.selectedResponsibilities ?? []}
              onChange={(next) => updateRow(row.id, { selectedResponsibilities: next })}
              manualValue={row.responsibilitiesOther}
              onManualChange={(next) => updateRow(row.id, { responsibilitiesOther: next })}
              manualPlaceholder="Kendi sorumluluk açıklamanızı yazın (en az 20 karakter)"
              disabled={disabled || !row.sector}
            />
            {wantsManualResp ? (
              <CareerManualAssist
                kind="responsibility"
                text={row.responsibilitiesOther ?? ''}
                catalog={[...responsibilities, ...skillCatalog]}
                sector={row.sector}
                role={resolvedRole}
                experienceLevel={experienceLevel ?? undefined}
                disabled={disabled}
                onAcceptPolished={(next) => updateRow(row.id, { responsibilitiesOther: next })}
                onAcceptCatalog={(items) => {
                  const current = row.selectedResponsibilities ?? [];
                  const merged = [...current];
                  for (const item of items) {
                    if (!merged.includes(item)) merged.push(item);
                  }
                  if (!merged.some((item) => isManualCareerOption(item))) {
                    merged.push(MANUAL_OPTION);
                  }
                  updateRow(row.id, { selectedResponsibilities: merged });
                }}
              />
            ) : null}

            <CareerMultiSelect
              label="Öne çıkan başarılar"
              options={achievements}
              value={row.selectedAchievements ?? []}
              onChange={(next) => updateRow(row.id, { selectedAchievements: next })}
              manualValue={row.achievementsOther}
              onManualChange={(next) => updateRow(row.id, { achievementsOther: next })}
              manualPlaceholder="Kendi başarı açıklamanızı yazın"
              disabled={disabled || !row.sector}
            />
            {wantsManualAch ? (
              <CareerManualAssist
                kind="achievement"
                text={row.achievementsOther ?? ''}
                catalog={achievements}
                metric={row.achievementMetric}
                sector={row.sector}
                role={resolvedRole}
                experienceLevel={experienceLevel ?? undefined}
                disabled={disabled}
                onAcceptPolished={(next) => updateRow(row.id, { achievementsOther: next })}
                onAcceptCatalog={(items) => {
                  const current = row.selectedAchievements ?? [];
                  const merged = [...current];
                  for (const item of items) {
                    if (!merged.includes(item)) merged.push(item);
                  }
                  if (!merged.some((item) => isManualCareerOption(item))) {
                    merged.push(MANUAL_OPTION);
                  }
                  updateRow(row.id, { selectedAchievements: merged });
                }}
              />
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor={`metric-${row.id}`}>Sayısal ölçü (isteğe bağlı)</Label>
              <Input
                id={`metric-${row.id}`}
                value={row.achievementMetric ?? ''}
                disabled={disabled}
                placeholder='Örn: %35 satış artışı · 12 kişilik ekip · 250+ müşteri'
                onKeyDown={(event) => event.stopPropagation()}
                onChange={(e) => updateRow(row.id, { achievementMetric: e.target.value })}
              />
            </div>
          </div>
        );
      })}

      {overlapError ? <p className="text-sm text-destructive">{overlapError}</p> : null}
      {error && error !== overlapError ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addRow}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Deneyim ekle
      </Button>
    </div>
  );
}
