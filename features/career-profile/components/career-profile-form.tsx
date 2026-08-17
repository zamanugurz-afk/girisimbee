'use client';

import { useMemo, useState, type ReactNode, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareerProfilePreview } from '@/features/candidates/components/CareerProfilePreview';
import {
  EXPERIENCE_LEVEL_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  getExperienceLevelLabel,
  getAllTaxonomyPositions,
  getPositionsForSector,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
  CAREER_LANGUAGE_OPTIONS,
  CAREER_LANGUAGE_LEVEL_OPTIONS,
} from '@/features/candidates/taxonomy/career-taxonomy';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_EDUCATION_LEVELS,
  CAREER_WORK_TYPE_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_SECTOR_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { presentCareerJourney } from '@/features/career-profile/journey';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues, CareerProfileRecord } from '@/features/career-profile/types';
import {
  Briefcase,
  Layers,
  Sparkles,
  Award,
  MapPin,
  Clock,
  GraduationCap,
  Languages,
  DollarSign,
  FileText,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const fieldClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900';
const selectClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900';
const areaClass =
  'min-h-[100px] w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 leading-relaxed';

function FormSection({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border/60 pb-4 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground/85 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function CareerProfileForm({
  record,
  displayName,
}: {
  record: CareerProfileRecord;
  displayName?: string | null;
}) {
  // Extract initial multi-select values or fallback from comma-delimited strings
  const initialRoles = useMemo(() => {
    if (record.values.roles && record.values.roles.length > 0) return record.values.roles;
    if (record.values.role) {
      return record.values.role
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [record.values.roles, record.values.role]);

  const initialSectors = useMemo(() => {
    if (record.values.sectors && record.values.sectors.length > 0) return record.values.sectors;
    if (record.values.sector) {
      return record.values.sector
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [record.values.sectors, record.values.sector]);

  const initialProfSkills = useMemo(() => {
    if (record.values.professionalSkillsList && record.values.professionalSkillsList.length > 0) {
      return record.values.professionalSkillsList;
    }
    if (record.values.professionalSkills) {
      return record.values.professionalSkills
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [record.values.professionalSkillsList, record.values.professionalSkills]);

  const initialTechSkills = useMemo(() => {
    if (record.values.technicalSkillsList && record.values.technicalSkillsList.length > 0) {
      return record.values.technicalSkillsList;
    }
    if (record.values.technicalSkills) {
      return record.values.technicalSkills
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [record.values.technicalSkillsList, record.values.technicalSkills]);

  // Form States
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const [roleInput, setRoleInput] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSectors);
  const [selectedProfSkills, setSelectedProfSkills] = useState<string[]>(initialProfSkills);
  const [profSkillInput, setProfSkillInput] = useState('');
  const [selectedTechSkills, setSelectedTechSkills] = useState<string[]>(initialTechSkills);
  const [techSkillInput, setTechSkillInput] = useState('');

  const [experienceLevel, setExperienceLevel] = useState(record.values.experienceLevel || '');
  const [workType, setWorkType] = useState(record.values.workType || '');
  const [workplacePreference, setWorkplacePreference] = useState(record.values.workplacePreference || '');
  const [city, setCity] = useState(record.values.city || '');
  const [educationLevel, setEducationLevel] = useState(record.values.educationLevel || '');
  const [availability, setAvailability] = useState(record.values.availability || '');
  const [languages, setLanguages] = useState(record.values.languages || '');
  const [candidateTraits, setCandidateTraits] = useState(record.values.candidateTraits || '');
  const [salaryMin, setSalaryMin] = useState<number | undefined>(record.values.salaryMin || undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(record.values.salaryMax || undefined);

  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState(record.completion);

  // All taxonomy positions for auto-suggestions
  const allPositions = useMemo(() => getAllTaxonomyPositions(), []);

  // Filtered positions based on typing and selected sectors
  const suggestedRoles = useMemo(() => {
    let list: string[] = [];
    if (selectedSectors.length > 0) {
      for (const sec of selectedSectors) {
        list.push(...getPositionsForSector(sec));
      }
    }
    if (list.length === 0) {
      list = allPositions;
    }
    const query = roleInput.trim().toLowerCase();
    const filtered = list.filter(
      (p) =>
        !selectedRoles.includes(p) &&
        (query ? p.toLowerCase().includes(query) : true),
    );
    return Array.from(new Set(filtered)).slice(0, 10);
  }, [allPositions, selectedSectors, selectedRoles, roleInput]);

  // Smart suggestions for skills based on selected positions and sectors
  const smartProfSkillSuggestions = useMemo(() => {
    const primarySector = selectedSectors[0] || '';
    const desiredRole = selectedRoles[0] || '';
    const suggestions = suggestProfessionalSkills({
      sector: primarySector,
      role: desiredRole,
    });
    return suggestions.filter((s) => !selectedProfSkills.includes(s)).slice(0, 8);
  }, [selectedSectors, selectedRoles, selectedProfSkills]);

  const smartTechSkillSuggestions = useMemo(() => {
    const primarySector = selectedSectors[0] || '';
    const desiredRole = selectedRoles[0] || '';
    const suggestions = suggestTechnicalSkills({
      sector: primarySector,
      role: desiredRole,
    });
    return suggestions.filter((s) => !selectedTechSkills.includes(s)).slice(0, 8);
  }, [selectedSectors, selectedRoles, selectedTechSkills]);

  // Handlers for Role Chips
  const handleAddRole = (roleToAdd: string) => {
    const trimmed = roleToAdd.trim();
    if (!trimmed || selectedRoles.includes(trimmed)) return;
    setSelectedRoles((prev) => [...prev, trimmed]);
    setRoleInput('');
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleToRemove));
  };

  // Handlers for Sector Chips
  const handleToggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    );
  };

  // Handlers for Skill Chips
  const handleAddProfSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || selectedProfSkills.includes(trimmed)) return;
    setSelectedProfSkills((prev) => [...prev, trimmed]);
    setProfSkillInput('');
  };

  const handleRemoveProfSkill = (skill: string) => {
    setSelectedProfSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddTechSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || selectedTechSkills.includes(trimmed)) return;
    setSelectedTechSkills((prev) => [...prev, trimmed]);
    setTechSkillInput('');
  };

  const handleRemoveTechSkill = (skill: string) => {
    setSelectedTechSkills((prev) => prev.filter((s) => s !== skill));
  };

  // Live Career Preview Object
  const preview = useMemo(
    () =>
      toSafeCareerPreviewInput({
        kind: record.kind,
        displayName,
        source: {
          city,
          customFields: {
            desiredRole: selectedRoles[0] || '',
            preferredRoles: selectedRoles.join(', '),
            primarySector: selectedSectors[0] || '',
            preferredSectors: selectedSectors.join(', '),
            experienceLevel,
            professionalSkills: selectedProfSkills.join(', '),
            technicalSkills: selectedTechSkills.join(', '),
            workType,
            workplacePreference,
            preferredCity: city,
            educationLevel,
            languages,
            availability,
            requiredResponsibilities: candidateTraits,
            salaryMin,
            salaryMax,
          },
        },
      }),
    [
      displayName,
      record.kind,
      city,
      selectedRoles,
      selectedSectors,
      experienceLevel,
      selectedProfSkills,
      selectedTechSkills,
      workType,
      workplacePreference,
      educationLevel,
      languages,
      availability,
      candidateTraits,
      salaryMin,
      salaryMax,
    ],
  );

  // Dynamic Live Completion Score
  const currentCompletionPercent = useMemo(() => {
    let score = 0;
    if (selectedRoles.length > 0) score += 20;
    if (selectedSectors.length > 0) score += 15;
    if (experienceLevel) score += 10;
    if (selectedProfSkills.length > 0) score += 15;
    if (selectedTechSkills.length > 0) score += 15;
    if (workType) score += 5;
    if (workplacePreference) score += 5;
    if (city) score += 5;
    if (educationLevel) score += 5;
    if (languages) score += 5;
    if (availability || candidateTraits) score += 5;
    return Math.min(score, 100);
  }, [
    selectedRoles,
    selectedSectors,
    experienceLevel,
    selectedProfSkills,
    selectedTechSkills,
    workType,
    workplacePreference,
    city,
    educationLevel,
    languages,
    availability,
    candidateTraits,
  ]);

  // Save handler
  async function handleSave() {
    setSaving(true);
    try {
      const payloadValues: CareerProfileFormValues = {
        role: selectedRoles[0] || '',
        roles: selectedRoles,
        sector: selectedSectors[0] || '',
        sectors: selectedSectors,
        experienceLevel,
        professionalSkills: selectedProfSkills.join(', '),
        professionalSkillsList: selectedProfSkills,
        technicalSkills: selectedTechSkills.join(', '),
        technicalSkillsList: selectedTechSkills,
        workType,
        workplacePreference,
        city,
        educationLevel,
        languages,
        availability,
        candidateTraits,
        salaryMin,
        salaryMax,
      };

      const res = await fetch('/api/career/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: record.listingId, values: payloadValues }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kariyer profili kaydedilemedi.');
      }

      const body = (await res.json()) as { profile: CareerProfileRecord };
      if (body.profile) {
        setCompletion(body.profile.completion);
      }
      toast.success('Kariyer profiliniz ve hedef tercihleriniz başarıyla güncellendi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  const journey = presentCareerJourney(record.kind, completion);

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Left Column: Form Elements (7 cols) */}
      <div className="space-y-6 lg:col-span-7">
        {/* Profile Completion Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Profil Gücü
              </span>
              <h4 className="font-display text-lg font-bold text-foreground">
                %{currentCompletionPercent} Tamamlandı
              </h4>
            </div>
            <div className="text-right">
              {currentCompletionPercent >= 80 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Mükemmel Eşleşme Potansiyeli
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Eksik alanları doldurarak eşleşme oranınızı artırın
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${currentCompletionPercent}%` }}
            />
          </div>
        </div>

        {/* Section 1: Target Positions (Multi-Select) */}
        <FormSection
          title="Hedef Pozisyonlar & Meslekler"
          icon={Briefcase}
          description="Aramak istediğiniz veya uzmanı olduğunuz tüm pozisyonları ekleyin. Birden fazla pozisyon seçebilirsiniz."
        >
          <Field label="Hedef Pozisyonlarınız" required hint="Enter ile ekleyin veya listeden seçin">
            {/* Selected Chips */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2.5">
              {selectedRoles.length === 0 ? (
                <span className="text-xs text-muted-foreground px-1">
                  Henüz hedef pozisyon eklenmedi. Aşağıdan seçin veya yazarak ekleyin.
                </span>
              ) : (
                selectedRoles.map((r) => (
                  <Badge
                    key={r}
                    variant="secondary"
                    className="gap-1.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 text-xs font-medium rounded-lg"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r)}
                      className="text-amber-700 hover:text-rose-600 dark:text-amber-400 dark:hover:text-rose-400"
                      aria-label="Kaldır"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* Input Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRole(roleInput);
                  }
                }}
                placeholder="Pozisyon ara veya kendin yaz (örn: Full Stack Developer, Satış Uzmanı)..."
                className={fieldClass}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddRole(roleInput)}
                disabled={!roleInput.trim()}
                className="shrink-0 rounded-xl gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Ekle</span>
              </Button>
            </div>

            {/* Suggested Roles */}
            {suggestedRoles.length > 0 && (
              <div className="mt-2.5">
                <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                  Önerilen Pozisyonlar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedRoles.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddRole(sug)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-foreground/80 hover:border-amber-500 hover:text-amber-600 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Field>
        </FormSection>

        {/* Section 2: Target Sectors (Multi-Select) */}
        <FormSection
          title="Hedef Sektörler"
          icon={Layers}
          description="İlgilendiğiniz veya deneyim sahibi olduğunuz sektörleri seçin."
        >
          <Field label="Sektörler" required hint="Birden fazla sektör seçebilirsiniz">
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
              {JOB_SECTOR_OPTIONS.map((sec) => {
                const isSelected = selectedSectors.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleToggleSector(sec)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'border border-slate-200 bg-white text-muted-foreground hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sec}
                  </button>
                );
              })}
            </div>
          </Field>
        </FormSection>

        {/* Section 3: Skills & Competencies (Multi-Select) */}
        <FormSection
          title="Yetkinlikler & Beceriler"
          icon={Sparkles}
          description="Mesleğinize özel teknik araçlar ve profesyonel yetkinliklerinizi belirleyin."
        >
          {/* Technical Skills */}
          <Field label="Teknik Yetkinlikler & Araçlar" hint="Yazılımlar, diller, araçlar, metodolojiler">
            <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
              {selectedTechSkills.length === 0 ? (
                <span className="text-xs text-muted-foreground px-1">
                  Teknik beceri eklenmedi. Önerilenlerden seçin veya yazın.
                </span>
              ) : (
                selectedTechSkills.map((sk) => (
                  <Badge
                    key={sk}
                    variant="secondary"
                    className="gap-1.5 bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 text-xs font-medium rounded-lg"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechSkill(sk)}
                      className="text-blue-700 hover:text-rose-600 dark:text-blue-400 dark:hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={techSkillInput}
                onChange={(e) => setTechSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTechSkill(techSkillInput);
                  }
                }}
                placeholder="Teknik beceri yaz (örn: React, SQL, Photoshop, Excel, SAP)..."
                className={fieldClass}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTechSkill(techSkillInput)}
                disabled={!techSkillInput.trim()}
                className="shrink-0 rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {smartTechSkillSuggestions.length > 0 && (
              <div className="mt-2">
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Önerilen Teknik Beceriler:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {smartTechSkillSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddTechSkill(sug)}
                      className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-2.5 py-0.5 text-xs text-blue-600 hover:bg-blue-500/15 dark:text-blue-400 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Field>

          {/* Professional Skills */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <Field label="Profesyonel & Sektörel Yetkinlikler" hint="Liderlik, bütçe yönetimi, müzakere vb.">
              <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                {selectedProfSkills.length === 0 ? (
                  <span className="text-xs text-muted-foreground px-1">
                    Profesyonel yetkinlik eklenmedi.
                  </span>
                ) : (
                  selectedProfSkills.map((sk) => (
                    <Badge
                      key={sk}
                      variant="secondary"
                      className="gap-1.5 bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 px-2.5 py-1 text-xs font-medium rounded-lg"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProfSkill(sk)}
                        className="text-purple-700 hover:text-rose-600 dark:text-purple-400 dark:hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={profSkillInput}
                  onChange={(e) => setProfSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProfSkill(profSkillInput);
                    }
                  }}
                  placeholder="Profesyonel beceri yaz (örn: Ekip Yönetimi, Proje Yönetimi)..."
                  className={fieldClass}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddProfSkill(profSkillInput)}
                  disabled={!profSkillInput.trim()}
                  className="shrink-0 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {smartProfSkillSuggestions.length > 0 && (
                <div className="mt-2">
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Önerilen Yetkinlikler:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {smartProfSkillSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddProfSkill(sug)}
                        className="rounded-lg border border-purple-500/30 bg-purple-500/5 px-2.5 py-0.5 text-xs text-purple-600 hover:bg-purple-500/15 dark:text-purple-400 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Field>
          </div>
        </FormSection>

        {/* Section 4: Work Rules & Experience Settings */}
        <FormSection
          title="Çalışma Tercihleri ve Deneyim"
          icon={Award}
          description="Eşleşme kurallarında kullanılacak çalışma modeli ve deneyim detayları."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Experience Level */}
            <Field label="Deneyim Seviyesi" required>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçiniz</option>
                {EXPERIENCE_LEVEL_VALUES.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {EXPERIENCE_LEVEL_LABELS[lvl] || lvl}
                  </option>
                ))}
              </select>
            </Field>

            {/* Workplace Preference */}
            <Field label="Çalışma Modeli" required>
              <select
                value={workplacePreference}
                onChange={(e) => setWorkplacePreference(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçiniz</option>
                {CAREER_WORKPLACE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            {/* Work Type */}
            <Field label="Çalışma Tipi" required>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçiniz</option>
                {CAREER_WORK_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            {/* City */}
            <Field label="Tercih Edilen Şehir" required>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={selectClass}
              >
                <option value="">Şehir Seçiniz</option>
                {TURKISH_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Education Level */}
            <Field label="Eğitim Seviyesi">
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçiniz</option>
                {CAREER_EDUCATION_LEVELS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            {/* Availability */}
            <Field label="İşe Başlama Uygunluğu">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçiniz</option>
                {CAREER_AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Salary Expectations */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <Field label="Aylık Net Maaş Beklentisi (TL)" hint="İsteğe bağlı aralık">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Min:</span>
                  <input
                    type="number"
                    value={salaryMin || ''}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="40.000"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Max:</span>
                  <input
                    type="number"
                    value={salaryMax || ''}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="65.000"
                    className={`${fieldClass} pl-11`}
                  />
                </div>
              </div>
            </Field>
          </div>

          {/* Languages */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <Field label="Yabancı Diller" hint="Örn: İngilizce (İleri), Almanca (Orta)">
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Örn: İngilizce (İleri Düzey), Almanca (Başlangıç)..."
                className={fieldClass}
              />
            </Field>
          </div>

          {/* About / Candidate Traits */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <Field
              label={record.kind === 'hire' ? 'Aranan Aday Nitelikleri' : 'Hakkımda & Kariyer Özeti'}
              hint="Profilinizin ve eşleşmelerinizin en üstünde görünür"
            >
              <textarea
                value={candidateTraits}
                onChange={(e) => setCandidateTraits(e.target.value)}
                placeholder="Kariyer hedefleriniz, uzmanlık alanlarınız ve şirkete katabileceğiniz değerleri kısaca anlatın..."
                className={areaClass}
              />
            </Field>
          </div>
        </FormSection>

        {/* Save Button Bar */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="text-xs text-muted-foreground">
            Değişiklikler anında eşleşme motoruna yansır.
          </div>
          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl px-6 font-medium gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Kaydediliyor…' : 'Kariyer Profilini Kaydet'}</span>
          </Button>
        </div>
      </div>

      {/* Right Column: Sticky Live Candidate Preview (5 cols) */}
      <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="font-display text-sm font-bold text-foreground">Canlı Kart Önizlemesi</span>
            </div>
            <Link
              href={record.editHref}
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <span>İlanı Düzenle</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            İşverenler ve girişimciler kariyer kartınızı aramalarda ve eşleşmelerde bu şekilde görecek:
          </p>

          <CareerProfilePreview data={preview} />
        </div>

        {/* Journey Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h4 className="font-display text-sm font-bold text-foreground mb-2">
            {journey.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {journey.description}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl justify-between text-xs">
              <Link href="/dashboard/eslesmeler">
                <span>Eşleşen İlanları Gör</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
