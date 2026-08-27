'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, ChevronDown, ChevronUp, Briefcase, Sparkles, Building2, Calendar } from 'lucide-react';
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
  suggestTitleCaseTr,
  formatTurkishSentence,
} from '@/features/candidates/lib/career-text-quality';
import {
  getAllTaxonomyPositions,
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
import { SetMatchingPicker } from '@/features/shared/components/set-matching-picker';
import { cn } from '@/lib/utils';

export function CareerExperienceEditor({
  value,
  onChange,
  error,
  disabled,
  experienceLevel,
  themeColor = 'sky',
}: {
  value: CareerExperience[];
  onChange: (next: CareerExperience[]) => void;
  error?: string | null;
  disabled?: boolean;
  experienceLevel?: string | null;
  themeColor?: string;
}) {
  const rows = value.length > 0 ? value : [createEmptyCareerExperience()];
  const years = yearOptions();
  const overlapError = rows.length > 1 ? validateExperienceOverlaps(rows) : null;

  // Active expanded item state
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Ensure first experience is open initially when no review has been completed
  const currentActiveId =
    activeEditId !== null
      ? rows.some((r) => r.id === activeEditId)
        ? activeEditId
        : rows[0]?.id ?? null
      : reviewedIds.size === 0 && rows.length > 0
        ? rows[0].id
        : null;

  // Pulse "+ Yeni Deneyim Ekle" ONLY when all open cards are closed/saved AND at least 1 has been completed
  const shouldPulseAddButton = currentActiveId === null && reviewedIds.size > 0;

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
    const newExp = createEmptyCareerExperience();
    onChange([
      ...rows.map((row, index) => (index === 0 ? row : { ...row, isCurrent: false })),
      newExp,
    ]);
    setActiveEditId(newExp.id);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) {
      const empty = createEmptyCareerExperience();
      onChange([empty]);
      setActiveEditId(empty.id);
      return;
    }
    const nextRows = rows.filter((row) => row.id !== id);
    onChange(nextRows);
    if (activeEditId === id) {
      setActiveEditId(nextRows[0]?.id ?? null);
    }
  }

  function handleSaveAndNext(currentIndex: number) {
    const currentId = rows[currentIndex]?.id;
    if (currentId) {
      setReviewedIds((prev) => new Set([...prev, currentId]));
    }
    if (currentIndex < rows.length - 1) {
      setActiveEditId(rows[currentIndex + 1].id);
    } else {
      setActiveEditId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header bar with total counter and Add button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              İş Deneyimleri ({rows.length})
            </h3>
            {rows.length > 1 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {reviewedIds.size} / {rows.length} Kontrol Edildi
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            İş tecrübelerinizi ekleyin. Sektör ve pozisyonunuza uygun sorumlulukları tek tıkla seçebilirsiniz.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addRow}
          className={cn(
            'h-8.5 gap-1.5 rounded-xl border-primary/30 text-xs font-semibold text-primary hover:bg-primary/5 shadow-2xs self-start sm:self-auto transition-all',
            shouldPulseAddButton &&
              'ring-2 ring-primary/50 bg-primary/10 animate-pulse hover:animate-none font-bold',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Yeni Deneyim Ekle</span>
        </Button>
      </div>

      {/* Experience Cards / Accordion List */}
      <div className="space-y-3.5">
        {rows.map((row, index) => {
          const isExpanded = currentActiveId === row.id;
          const isReviewed = reviewedIds.has(row.id);
          const endYears = row.startYear ? years.filter((year) => year >= row.startYear!) : years;
          const positions = getPositionsForSector(row.sector);
          const roleIsManual = isManualCareerOption(row.role);
          const resolvedRole = roleIsManual ? row.roleOther : row.role;
          const displayCompany = row.company?.trim() || 'Şirket Adı Belirtilmemiş';
          const displayRole = resolvedRole?.trim() || 'Pozisyon Belirtilmemiş';

          // Date formatting string
          const startStr = row.startYear ? `${row.startMonth ? `${MONTH_OPTIONS.find((m) => m.value === row.startMonth)?.label} ` : ''}${row.startYear}` : '';
          const endStr = row.isCurrent ? 'Devam Ediyor' : row.endYear ? `${row.endMonth ? `${MONTH_OPTIONS.find((m) => m.value === row.endMonth)?.label} ` : ''}${row.endYear}` : '';
          const dateRangeStr = startStr ? `${startStr} - ${endStr || 'Bitiş Belirtilmemiş'}` : 'Tarih Belirtilmemiş';

          // Responsibilities snippet
          const respList = [
            ...(row.selectedResponsibilities || []).filter((r) => !isManualCareerOption(r)),
            ...(row.responsibilitiesOther ? [row.responsibilitiesOther] : []),
            ...(row.responsibilities && !row.selectedResponsibilities?.length ? [row.responsibilities] : []),
          ];

          if (!isExpanded) {
            // COMPACT SUMMARY CARD (Akbank Style)
            return (
              <div
                key={row.id}
                onClick={() => setActiveEditId(row.id)}
                className={cn(
                  'group relative cursor-pointer rounded-2xl border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm',
                  isReviewed
                    ? 'border-emerald-200/80 bg-linear-to-r from-emerald-50/20 via-card to-card dark:border-emerald-900/40'
                    : 'border-border/80',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors',
                      isReviewed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {displayCompany}
                        </h4>
                        <span className="text-muted-foreground/60 text-xs">•</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {displayRole}
                        </span>
                        {isReviewed && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/70 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Kontrol Edildi
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateRangeStr}
                        </span>
                        {row.sector && (
                          <>
                            <span>•</span>
                            <span>{row.sector} Sektörü</span>
                          </>
                        )}
                        {row.duration && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground/80">{row.duration}</span>
                          </>
                        )}
                      </div>

                      {respList.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {respList.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground group-hover:text-primary hover:bg-primary/10 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEditId(row.id);
                      }}
                      title="Düzenle"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRow(row.id);
                      }}
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          // EXPANDED EDITING FORM
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
              className="rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-md ring-4 ring-primary/5 transition-all space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      Deneyim {index + 1} Düzenleniyor
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Şirket adı, pozisyon, tarihler ve sorumlulukları belirleyin.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveEditId(null)}
                  >
                    <ChevronUp className="mr-1 h-3.5 w-3.5" />
                    Kapat
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    disabled={disabled}
                    onClick={() => removeRow(row.id)}
                    title="Deneyimi Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Company & Position Row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`company-${row.id}`} className="text-xs font-semibold">
                    Şirket / Kurum Adı *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`company-${row.id}`}
                      className="pl-9 h-10 text-sm"
                      value={row.company ?? ''}
                      disabled={disabled}
                      placeholder="Örn: Angel City İnşaat"
                      onChange={(e) => updateRow(row.id, { company: e.target.value })}
                      onBlur={() => {
                        if (row.company?.trim()) {
                          updateRow(row.id, { company: suggestTitleCaseTr(row.company) });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <SetMatchingPicker
                    id={`sector-${row.id}`}
                    label="Sektör *"
                    domain="sectors"
                    catalog={sortSectorsPopularThenAz(JOB_SECTOR_OPTIONS)}
                    mode="single"
                    themeColor={themeColor}
                    badgeColor={themeColor}
                    value={row.sector}
                    disabled={disabled}
                    searchPlaceholder="Sektör seçin veya arayın..."
                    onChange={(val) =>
                      updateRow(row.id, {
                        sector: val,
                        role: '',
                        roleOther: '',
                        selectedResponsibilities: [],
                        selectedAchievements: [],
                      })
                    }
                  />
                </div>
              </div>

              {/* Position & Type */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <SetMatchingPicker
                    id={`role-${row.id}`}
                    label="Pozisyon / Görev *"
                    mode="single"
                    catalog={positions.length > 0 ? positions : getAllTaxonomyPositions()}
                    themeColor={themeColor}
                    badgeColor={themeColor}
                    value={roleIsManual ? row.roleOther : row.role}
                    disabled={disabled}
                    searchPlaceholder={row.sector ? 'Pozisyon seçin veya yazın...' : 'Tüm Pozisyonlar / Seçin veya yazın...'}
                    onChange={(val) =>
                      updateRow(row.id, {
                        role: val,
                        roleOther: '',
                        selectedResponsibilities: [],
                        selectedAchievements: [],
                      })
                    }
                  />
                  {roleIsManual ? (
                    <div className="mt-2 space-y-1.5 rounded-xl border border-amber-300/80 bg-amber-50/60 p-3 shadow-2xs dark:border-amber-700/60 dark:bg-amber-950/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Kendi Pozisyonunuzu / Görevinizi Yazın:</span>
                      </div>
                      <Input
                        className="bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800/60 focus-visible:ring-amber-500 placeholder:text-amber-900/40 dark:placeholder:text-amber-100/40"
                        value={row.roleOther ?? ''}
                        disabled={disabled}
                        placeholder="Örn: Kıdemli Satış Uzmanı"
                        onKeyDown={(event) => event.stopPropagation()}
                        onChange={(e) => updateRow(row.id, { roleOther: e.target.value })}
                        onBlur={() => {
                          if (row.roleOther?.trim()) {
                            updateRow(row.id, { roleOther: suggestTitleCaseTr(row.roleOther) });
                          }
                        }}
                      />
                      <CareerManualAssist
                        kind="role"
                        text={row.roleOther ?? ''}
                        catalog={positions.length > 0 ? positions : getAllTaxonomyPositions()}
                        sector={row.sector}
                        experienceLevel={experienceLevel ?? undefined}
                        disabled={disabled}
                        onAcceptCatalog={(items) => {
                          const first = items[0];
                          if (!first) return;
                          updateRow(row.id, { role: first, roleOther: '' });
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Dates */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Çalışma Dönemi *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground">Başlangıç</span>
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-card px-2.5 text-sm font-normal text-foreground transition-colors"
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
                              {m.label.slice(0, 3)}
                            </option>
                          ))}
                        </select>
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-card px-2.5 text-sm font-normal text-foreground transition-colors"
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

                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground">Bitiş</span>
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-card px-2.5 text-sm font-normal text-foreground transition-colors disabled:opacity-50"
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
                              {m.label.slice(0, 3)}
                            </option>
                          ))}
                        </select>
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-card px-2.5 text-sm font-normal text-foreground transition-colors disabled:opacity-50"
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
                    </div>
                  </div>

                  {index === 0 && (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <Checkbox
                        checked={Boolean(row.isCurrent)}
                        disabled={disabled}
                        onCheckedChange={(next) =>
                          updateRow(row.id, {
                            isCurrent: next === true,
                          })
                        }
                      />
                      Halen bu görevde çalışıyorum
                    </label>
                  )}
                </div>
              </div>

              {/* Responsibilities */}
              <CareerMultiSelect
                label="Temel Sorumluluklar ve Görevler"
                catalog={[...responsibilities, ...skillCatalog]}
                options={responsibilities}
                value={row.selectedResponsibilities ?? []}
                onChange={(next) => updateRow(row.id, { selectedResponsibilities: next })}
                manualValue={row.responsibilitiesOther}
                onManualChange={(next) => updateRow(row.id, { responsibilitiesOther: next })}
                manualPlaceholder="Kendi sorumluluk açıklamanızı yazın veya listeden seçin..."
                disabled={disabled}
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

              {/* Bottom Action inside Expanded Form */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveEditId(null)}
                  className="text-xs h-9"
                >
                  Değişiklikleri Kapat
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleSaveAndNext(index)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {index < rows.length - 1 ? 'Kaydet ve Sıradakine Geç' : 'Kaydet ve Tamamla'}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {overlapError ? <p className="text-sm text-destructive font-medium">{overlapError}</p> : null}
      {error && error !== overlapError ? <p className="text-sm text-destructive font-medium">{error}</p> : null}
    </div>
  );
}

