'use client';

import { useMemo, useState, type ReactNode, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareerProfilePreview } from '@/features/candidates/components/CareerProfilePreview';
import { CareerExperienceEditor } from '@/features/candidates/components/CareerExperienceEditor';
import { CareerManualAssist } from '@/features/candidates/components/CareerManualAssist';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  EXPERIENCE_LEVEL_VALUES,
  EXPERIENCE_LEVEL_LABELS,
  getAllTaxonomyPositions,
  getPositionsForSector,
  isManualCareerOption,
  MANUAL_OPTION,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import {
  suggestTitleCaseTr,
  formatTurkishSentence,
} from '@/features/candidates/lib/career-text-quality';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_EDUCATION_LEVELS,
  CAREER_WORK_TYPE_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_SECTOR_OPTIONS,
  STARTUP_STAGES,
  BUSINESS_MODEL_OPTIONS,
  PARTNER_EXPERTISE_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
import { presentCareerJourney } from '@/features/career-profile/journey';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues, CareerProfileRecord } from '@/features/career-profile/types';
import type { CareerPersonaKind } from '@/features/career-profile/components/career-persona-selector';
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
  Building2,
  Handshake,
  User,
  History,
  Target,
  Wrench,
  PieChart,
  Rocket,
  Wand2,
} from 'lucide-react';

const fieldClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900';
const selectClass =
  'h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900';
const areaClass =
  'min-h-[110px] w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm text-foreground transition-colors focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 leading-relaxed';

const POPULAR_TOOLS_CATALOG = [
  'Jira',
  'Figma',
  'Slack',
  'Notion',
  'Postman',
  'Git / GitHub',
  'Docker',
  'Google Analytics',
  'Excel (İleri)',
  'SAP',
  'Salesforce',
  'Canva',
  'Trello',
  'VS Code',
  'Photoshop',
  'Premiere Pro',
  'Power BI',
  'Tableau',
  'SQL Server',
  'MongoDB',
  'AWS',
  'HubSpot',
  'Shopify',
  'Zendesk',
];

function FormSection({
  stepNumber,
  title,
  icon: Icon,
  description,
  children,
}: {
  stepNumber: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-7">
      <div className="flex items-start gap-3.5 border-b border-border/60 pb-4 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-display font-bold text-sm shrink-0">
          {stepNumber}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-amber-500" />
            <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
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
  persona = 'seek',
  displayName,
}: {
  record: CareerProfileRecord;
  persona?: CareerPersonaKind;
  displayName?: string | null;
}) {
  // Initial multi-select values
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

  const initialTools = useMemo(() => {
    if (record.values.tools) {
      return record.values.tools
        .split(/[·,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [record.values.tools]);

  // Primary Basics
  const [primaryRole, setPrimaryRole] = useState(record.values.role || initialRoles[0] || '');
  const [primarySector, setPrimarySector] = useState(record.values.sector || initialSectors[0] || '');
  const [experienceLevel, setExperienceLevel] = useState(record.values.experienceLevel || '');
  const [workType, setWorkType] = useState(record.values.workType || '');
  const [workplacePreference, setWorkplacePreference] = useState(record.values.workplacePreference || '');
  const [city, setCity] = useState(record.values.city || '');
  const [residenceDistrict, setResidenceDistrict] = useState(record.values.residenceDistrict || '');
  const [birthDate, setBirthDate] = useState(record.values.birthDate || '');
  const [profileGender, setProfileGender] = useState(record.values.profileGender || '');

  // Career Experience History (Job seeker without company name)
  const [experiences, setExperiences] = useState<CareerExperience[]>(
    record.values.experiences && record.values.experiences.length > 0
      ? record.values.experiences
      : [],
  );

  // Preferred Roles & Sectors (Multi-select)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const [roleInput, setRoleInput] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSectors);

  // Skills & Tools
  const [selectedProfSkills, setSelectedProfSkills] = useState<string[]>(initialProfSkills);
  const [profSkillInput, setProfSkillInput] = useState('');
  const [selectedTechSkills, setSelectedTechSkills] = useState<string[]>(initialTechSkills);
  const [techSkillInput, setTechSkillInput] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(initialTools);
  const [toolInput, setToolInput] = useState('');

  // Education & Languages & Certificates
  const [educationLevel, setEducationLevel] = useState(record.values.educationLevel || '');
  const [educationField, setEducationField] = useState(record.values.educationField || '');
  const [certificates, setCertificates] = useState(record.values.certificates || '');
  const [languages, setLanguages] = useState(record.values.languages || '');

  // Preferences & Salary
  const [preferredDistrict, setPreferredDistrict] = useState(record.values.preferredDistrict || '');
  const [availability, setAvailability] = useState(record.values.availability || '');
  const [salaryMin, setSalaryMin] = useState<number | undefined>(record.values.salaryMin || undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(record.values.salaryMax || undefined);
  const [candidateTraits, setCandidateTraits] = useState(record.values.candidateTraits || '');

  // Employer / Partner specific
  const [companyName, setCompanyName] = useState(record.values.companyName || '');
  const [requiredAchievements, setRequiredAchievements] = useState(record.values.requiredAchievements || '');
  const [partnerType, setPartnerType] = useState(record.values.partnerType || 'seeking_partner');
  const [stage, setStage] = useState(record.values.stage || '');
  const [businessModel, setBusinessModel] = useState(record.values.businessModel || '');
  const [capitalContribution, setCapitalContribution] = useState(record.values.capitalContribution || '');
  const [equityOffered, setEquityOffered] = useState(record.values.equityOffered || '');

  const [saving, setSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [completion, setCompletion] = useState(record.completion);

  // Dynamic Districts for chosen City
  const availableDistricts = useMemo(() => {
    if (!city) return [];
    return getDistrictsForCity(city);
  }, [city]);

  // Sector-filtered roles
  const sectorPositions = useMemo(() => {
    if (!primarySector) return [];
    return getPositionsForSector(primarySector);
  }, [primarySector]);

  // Custom role mode state
  const [isCustomRoleMode, setIsCustomRoleMode] = useState<boolean>(() => {
    const role = record.values.role || initialRoles[0] || '';
    if (!role) return false;
    const sec = record.values.sector || initialSectors[0] || '';
    if (sec) {
      const list = getPositionsForSector(sec);
      return !list.includes(role) || isManualCareerOption(role);
    }
    return false;
  });

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setResidenceDistrict('');
    setPreferredDistrict('');
  };

  const handleSectorChange = (newSector: string) => {
    setPrimarySector(newSector);
    if (newSector) {
      const list = getPositionsForSector(newSector);
      if (!isCustomRoleMode && primaryRole && !list.includes(primaryRole)) {
        setPrimaryRole('');
      }
    }
  };

  const handleRoleSelectChange = (val: string) => {
    if (val === MANUAL_OPTION || val === '__CUSTOM__') {
      setIsCustomRoleMode(true);
      setPrimaryRole('');
    } else {
      setIsCustomRoleMode(false);
      setPrimaryRole(val);
    }
  };

  // All taxonomy positions for auto-suggestions
  const allPositions = useMemo(() => getAllTaxonomyPositions(), []);

  // Filtered positions based on typing and selected sectors
  const suggestedRoles = useMemo(() => {
    let list: string[] = [];
    if (primarySector) {
      list.push(...getPositionsForSector(primarySector));
    }
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
  }, [allPositions, primarySector, selectedSectors, selectedRoles, roleInput]);

  // Smart suggestions for skills based on selected positions and sectors
  const smartProfSkillSuggestions = useMemo(() => {
    const sec = primarySector || selectedSectors[0] || '';
    const role = primaryRole || selectedRoles[0] || '';
    const suggestions = suggestProfessionalSkills({ sector: sec, role, experienceLevel });
    return suggestions.filter((s) => !selectedProfSkills.includes(s)).slice(0, 10);
  }, [primarySector, selectedSectors, primaryRole, selectedRoles, selectedProfSkills, experienceLevel]);

  const smartTechSkillSuggestions = useMemo(() => {
    const sec = primarySector || selectedSectors[0] || '';
    const role = primaryRole || selectedRoles[0] || '';
    const suggestions = suggestTechnicalSkills({ sector: sec, role });
    return suggestions.filter((s) => !selectedTechSkills.includes(s)).slice(0, 10);
  }, [primarySector, selectedSectors, primaryRole, selectedRoles, selectedTechSkills]);

  const suggestedTools = useMemo(() => {
    return POPULAR_TOOLS_CATALOG.filter((t) => !selectedTools.includes(t)).slice(0, 12);
  }, [selectedTools]);

  // Handlers for Role Chips
  const handleAddRole = (roleToAdd: string) => {
    const formatted = suggestTitleCaseTr(roleToAdd);
    if (!formatted || selectedRoles.includes(formatted)) return;
    setSelectedRoles((prev) => [...prev, formatted]);
    if (!primaryRole) setPrimaryRole(formatted);
    setRoleInput('');
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleToRemove));
    if (primaryRole === roleToRemove) {
      const remaining = selectedRoles.filter((r) => r !== roleToRemove);
      setPrimaryRole(remaining[0] || '');
    }
  };

  // Handlers for Sector Chips
  const handleToggleSector = (sector: string) => {
    setSelectedSectors((prev) => {
      const next = prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector];
      if (!primarySector && next.length > 0) setPrimarySector(next[0]);
      return next;
    });
  };

  // Handlers for Skill Chips
  const handleAddProfSkill = (skill: string) => {
    const formatted = suggestTitleCaseTr(skill);
    if (!formatted || selectedProfSkills.includes(formatted)) return;
    setSelectedProfSkills((prev) => [...prev, formatted]);
    setProfSkillInput('');
  };

  const handleRemoveProfSkill = (skill: string) => {
    setSelectedProfSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddTechSkill = (skill: string) => {
    const formatted = suggestTitleCaseTr(skill);
    if (!formatted || selectedTechSkills.includes(formatted)) return;
    setSelectedTechSkills((prev) => [...prev, formatted]);
    setTechSkillInput('');
  };

  const handleRemoveTechSkill = (skill: string) => {
    setSelectedTechSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleAddTool = (tool: string) => {
    const formatted = suggestTitleCaseTr(tool);
    if (!formatted || selectedTools.includes(formatted)) return;
    setSelectedTools((prev) => [...prev, formatted]);
    setToolInput('');
  };

  const handleRemoveTool = (tool: string) => {
    setSelectedTools((prev) => prev.filter((t) => t !== tool));
  };

  // AI Summary Generator
  async function handleGenerateAiSummary() {
    setIsGeneratingAi(true);
    try {
      const role = primaryRole || selectedRoles[0] || 'Profesyonel';
      const sector = primarySector || selectedSectors[0] || '';
      const expLevel = experienceLevel || 'Deneyimli';
      const topSkills = [...selectedTechSkills.slice(0, 4), ...selectedProfSkills.slice(0, 3)].join(', ');
      const topTools = selectedTools.slice(0, 4).join(', ');
      const edu = educationField || educationLevel || '';

      let promptIntro = '';
      if (persona === 'seek') {
        promptIntro = `${sector ? sector + ' sektöründe ' : ''}${expLevel} seviyesinde ${role} olarak kariyerime devam ediyorum. ${
          edu ? edu + ' eğitimi aldım. ' : ''
        }${topSkills ? 'Uzmanlık alanlarım: ' + topSkills + '. ' : ''}${
          topTools ? 'Kullandığım araçlar: ' + topTools + '. ' : ''
        }Yüksek sorumluluk bilinci ve ekip çalışmasıyla değer katabileceğim projelere odaklanıyorum.`;
      } else if (persona === 'hire') {
        promptIntro = `${companyName ? companyName + ' bünyesinde ' : 'Ekibimizde '}${
          sector ? sector + ' sektöründe ' : ''
        }${expLevel} seviyesinde ${role} arayışımız bulunmaktadır. ${
          topSkills ? 'Aranan temel yetkinlikler: ' + topSkills + '. ' : ''
        }Yenilikçi projelerimizde dinamik ve vizyoner çalışma arkadaşları ile büyümeyi hedefliyoruz.`;
      } else {
        promptIntro = `${companyName ? companyName + ' girişimi için ' : 'Girişimimiz bünyesinde '}${
          sector ? sector + ' sektöründe ' : ''
        }birlikte değer üreteceğimiz ${role} odağında kurucu ortak arıyoruz. ${
          topSkills ? 'Beklenen uzmanlıklar: ' + topSkills + '. ' : ''
        }Ortak vizyon ve hisse ortaklığı modeliyle girişimimizi ölçeklendirmeyi amaçlıyoruz.`;
      }

      // Try server AI polish or fallback to crafted synthesis
      let generated = promptIntro;
      try {
        const aiRes = await fetch('/api/candidates/career-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'polish',
            kind: 'summary',
            text: promptIntro,
            role,
            sector,
            experienceLevel: expLevel,
          }),
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          if (aiJson.data?.polished) {
            generated = aiJson.data.polished;
          }
        }
      } catch {
        // use synthesized grounded text
      }

      setCandidateTraits(generated);
      toast.success('✨ Yapay zeka ile profesyonel özet oluşturuldu!');
    } catch {
      toast.error('Özet oluşturulurken bir sorun oluştu.');
    } finally {
      setIsGeneratingAi(false);
    }
  }

  // Live Preview Object
  const preview = useMemo(
    () =>
      toSafeCareerPreviewInput({
        kind: persona === 'hire' ? 'hire' : 'seek',
        displayName: companyName || displayName,
        source: {
          city,
          customFields: {
            desiredRole: primaryRole || selectedRoles[0] || '',
            preferredRoles: selectedRoles.join(', '),
            primarySector: primarySector || selectedSectors[0] || '',
            preferredSectors: selectedSectors.join(', '),
            experienceLevel,
            experiences,
            professionalSkills: selectedProfSkills.join(', '),
            technicalSkills: selectedTechSkills.join(', '),
            tools: selectedTools.join(', '),
            workType,
            workplacePreference,
            preferredCity: city,
            preferredDistrict,
            educationLevel,
            educationField,
            certificates,
            languages,
            availability,
            requiredResponsibilities: candidateTraits,
            requiredAchievements,
            companyName,
            birthDate,
            gender: profileGender,
            residenceCity: city,
            residenceDistrict,
            salaryMin,
            salaryMax,
            salaryExpectation:
              salaryMin && salaryMax
                ? `${salaryMin.toLocaleString('tr-TR')} - ${salaryMax.toLocaleString('tr-TR')} TL`
                : salaryMin
                  ? `${salaryMin.toLocaleString('tr-TR')} TL+`
                  : undefined,
          },
        },
      }),
    [
      displayName,
      companyName,
      persona,
      city,
      primaryRole,
      primarySector,
      selectedRoles,
      selectedSectors,
      experienceLevel,
      experiences,
      selectedProfSkills,
      selectedTechSkills,
      selectedTools,
      workType,
      workplacePreference,
      preferredDistrict,
      educationLevel,
      educationField,
      certificates,
      languages,
      availability,
      candidateTraits,
      requiredAchievements,
      birthDate,
      profileGender,
      residenceDistrict,
      salaryMin,
      salaryMax,
    ],
  );

  // Dynamic Live Completion Score
  const currentCompletionPercent = useMemo(() => {
    let score = 0;
    if (primaryRole || selectedRoles.length > 0) score += 20;
    if (primarySector || selectedSectors.length > 0) score += 15;
    if (experienceLevel) score += 10;
    if (selectedProfSkills.length > 0) score += 15;
    if (selectedTechSkills.length > 0) score += 15;
    if (workType) score += 5;
    if (workplacePreference) score += 5;
    if (city) score += 5;
    if (educationLevel || companyName) score += 5;
    if (languages || capitalContribution || experiences.length > 0) score += 5;
    return Math.min(score, 100);
  }, [
    primaryRole,
    selectedRoles,
    primarySector,
    selectedSectors,
    experienceLevel,
    selectedProfSkills,
    selectedTechSkills,
    workType,
    workplacePreference,
    city,
    educationLevel,
    companyName,
    languages,
    capitalContribution,
    experiences,
  ]);

  // Save handler
  async function handleSave() {
    setSaving(true);
    try {
      const payloadValues: CareerProfileFormValues = {
        role: primaryRole || selectedRoles[0] || '',
        roles: selectedRoles.length > 0 ? selectedRoles : primaryRole ? [primaryRole] : [],
        sector: primarySector || selectedSectors[0] || '',
        sectors: selectedSectors.length > 0 ? selectedSectors : primarySector ? [primarySector] : [],
        experienceLevel,
        experiences,
        professionalSkills: selectedProfSkills.join(', '),
        professionalSkillsList: selectedProfSkills,
        technicalSkills: selectedTechSkills.join(', '),
        technicalSkillsList: selectedTechSkills,
        tools: selectedTools.join(', '),
        toolsList: selectedTools,
        workType,
        workplacePreference,
        city,
        residenceDistrict,
        preferredDistrict,
        birthDate,
        profileGender,
        educationLevel,
        educationField,
        certificates,
        languages,
        availability,
        candidateTraits,
        requiredAchievements,
        companyName,
        partnerType,
        stage,
        businessModel,
        capitalContribution,
        equityOffered,
        salaryMin,
        salaryMax,
      };

      const res = await fetch('/api/career/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: record.listingId.startsWith('draft') ? undefined : record.listingId,
          persona,
          values: payloadValues,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Kariyer profili kaydedilemedi.');
      }

      const body = (await res.json()) as { profile: CareerProfileRecord };
      if (body.profile) {
        setCompletion(body.profile.completion);
      }
      toast.success('Kariyer profiliniz başarıyla kaydedildi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  const journey = presentCareerJourney(record.kind, completion);

  return (
    <div className="w-full">
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Comprehensive Form Steps (7 cols) */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-7">
          {/* Profile Completion Bar */}
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Profil Gücü
                </span>
                <h4 className="font-display text-xl font-bold text-foreground">
                  %{currentCompletionPercent} Tamamlandı
                </h4>
              </div>
              <div className="text-right">
                {currentCompletionPercent >= 80 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Mükemmel Eşleşme Potansiyeli
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" /> Eksik adımları tamamlayarak eşleşme şansınızı artırın
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${currentCompletionPercent}%` }}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERSONA: SEEK (İş Bulmak İstiyorum) */}
          {/* ========================================================= */}
          {persona === 'seek' && (
            <>
              {/* Step 1: Temel Kariyer Bilgileri */}
              <FormSection
                stepNumber={1}
                title="Temel Kariyer Bilgileri"
                icon={User}
                description="Önce sektörünüzü seçin; ardından o sektöre ait meslekler otomatik listelenir veya kendiniz yazabilirsiniz."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 1. Ana Sektör (Önce Seçilir) */}
                  <Field label="Ana Sektör" required hint="Önce sektörünüzü seçin">
                    <select
                      value={primarySector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Sektör Seçiniz</option>
                      {JOB_SECTOR_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 2. Sektöre Göre Dinamik Meslek / Pozisyon Seçimi */}
                  <Field
                    label="Ana Pozisyon / Meslek"
                    required
                    hint={isCustomRoleMode ? 'Özel unvanınızı kendiniz yazıyorsunuz' : 'Sektöre göre otomatik listelenir'}
                  >
                    {isCustomRoleMode ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={primaryRole}
                            onChange={(e) => setPrimaryRole(e.target.value)}
                            onBlur={() => {
                              if (primaryRole.trim()) setPrimaryRole(suggestTitleCaseTr(primaryRole));
                            }}
                            placeholder="Örn: Çağrı Merkezi Satış Müdürü, Full Stack Developer..."
                            className={fieldClass}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCustomRoleMode(false);
                              setPrimaryRole('');
                            }}
                            className="shrink-0 rounded-xl text-xs"
                          >
                            Listeden Seç
                          </Button>
                        </div>
                        {primaryRole.trim().length >= 2 && (
                          <CareerManualAssist
                            kind="role"
                            text={primaryRole}
                            catalog={sectorPositions}
                            sector={primarySector}
                            experienceLevel={experienceLevel}
                            onAcceptCatalog={(items) => {
                              if (items[0]) {
                                setPrimaryRole(items[0]);
                                setIsCustomRoleMode(false);
                              }
                            }}
                          />
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          Listede olmayan unvanınızı kendiniz girdiniz. Dilerseniz &ldquo;Listeden Seç&rdquo; ile dönebilirsiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <select
                          value={primaryRole}
                          onChange={(e) => handleRoleSelectChange(e.target.value)}
                          disabled={!primarySector}
                          className={selectClass}
                        >
                          <option value="">
                            {primarySector ? 'Meslek / Pozisyon Seçiniz' : '← Önce Ana Sektör Seçiniz'}
                          </option>
                          {sectorPositions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos === MANUAL_OPTION ? '✍️ Listede yok, kendim yazacağım' : pos}
                            </option>
                          ))}
                          {!sectorPositions.includes(MANUAL_OPTION) && (
                            <option value="__CUSTOM__">✍️ Listede yok, kendim yazacağım</option>
                          )}
                        </select>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                          <span>Aradığınız unvan listede yoksa:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomRoleMode(true);
                            }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                          >
                            Kendim Gireceğim
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>

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

                  {/* Dynamic City & District Cascading Select */}
                  <Field label="İkamet Şehri" required>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
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

                  <Field label="İkamet İlçesi" hint={city ? 'Şehre göre listelenir (Gizli tutulur)' : 'Önce şehri seçiniz'}>
                    <select
                      value={residenceDistrict}
                      onChange={(e) => setResidenceDistrict(e.target.value)}
                      disabled={!city || availableDistricts.length === 0}
                      className={selectClass}
                    >
                      <option value="">{city ? 'İlçe Seçiniz' : '← Önce Şehir Seçiniz'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Doğum Tarihi" hint="Yalnızca yaş olarak gösterilir">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Cinsiyet" hint="İsteğe bağlı">
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Belirtmek İstemiyorum</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kadın</option>
                    </select>
                  </Field>
                </div>
              </FormSection>

              {/* Step 2: Kariyer Deneyimi (İş Geçmişi - Şirket adı olmadan) */}
              <FormSection
                stepNumber={2}
                title="Kariyer Deneyimi & İş Geçmişi"
                icon={History}
                description="Geçmiş deneyimlerinizi sektör, pozisyon, tarih ve başarılarınızla ekleyin. Şirket ismi girilmez, gizliliğiniz korunur."
              >
                <CareerExperienceEditor
                  value={experiences}
                  onChange={setExperiences}
                  experienceLevel={experienceLevel}
                />
              </FormSection>

              {/* Step 3: Uzmanlık, Yetkinlikler & Araçlar */}
              <FormSection
                stepNumber={3}
                title="Uzmanlık Alanları, Yetkinlikler & Araçlar"
                icon={Sparkles}
                description="Sektör ve pozisyonunuza göre önerilen teknik ve mesleki yetkinlikleri tek tıkla seçin veya kendiniz ekleyin."
              >
                {/* Technical Skills */}
                <Field label="Teknik Yetkinlikler" hint="Yazılımlar, programlama dilleri, sistemler">
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                    {selectedTechSkills.length === 0 ? (
                      <span className="text-xs text-muted-foreground px-1">
                        Teknik beceri eklenmedi. Aşağıdaki önerilerden tek tıkla seçin veya yazarak ekleyin.
                      </span>
                    ) : (
                      selectedTechSkills.map((sk) => (
                        <Badge
                          key={sk}
                          variant="secondary"
                          className="gap-1.5 bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
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
                      placeholder="Teknik beceri yaz (örn: React, SQL, Photoshop, Excel, SAP, Python)..."
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
                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                        Önerilen Teknik Beceriler ({primarySector || 'Genel'}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {smartTechSkillSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddTechSkill(sug)}
                            className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 transition-colors"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>

                {/* Professional Skills */}
                <div className="mt-5 pt-5 border-t border-border/50">
                  <Field label="Mesleki & Sektörel Yetkinlikler" hint="Liderlik, bütçe yönetimi, müzakere, kriz yönetimi">
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                      {selectedProfSkills.length === 0 ? (
                        <span className="text-xs text-muted-foreground px-1">
                          Mesleki yetkinlik eklenmedi. Önerilerden seçin veya yazın.
                        </span>
                      ) : (
                        selectedProfSkills.map((sk) => (
                          <Badge
                            key={sk}
                            variant="secondary"
                            className="gap-1.5 bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
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
                        placeholder="Mesleki beceri yaz (örn: Ekip Yönetimi, Proje Yönetimi, Müzakere)..."
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
                      <div className="mt-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                          Önerilen Mesleki Yetkinlikler:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {smartProfSkillSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddProfSkill(sug)}
                              className="rounded-xl border border-purple-500/30 bg-purple-500/5 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-500/20 dark:text-purple-300 transition-colors"
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Field>
                </div>

                {/* Tools & Softwares */}
                <div className="mt-5 pt-5 border-t border-border/50">
                  <Field label="Kullanılan Araçlar & Yazılımlar" hint="Popüler araçlardan tek tıkla seçin veya kendiniz ekleyin">
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                      {selectedTools.length === 0 ? (
                        <span className="text-xs text-muted-foreground px-1">
                          Araç eklenmedi. Aşağıdaki popüler araçlardan seçebilir veya yazabilirsiniz.
                        </span>
                      ) : (
                        selectedTools.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="gap-1.5 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
                          >
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTool(t)}
                              className="text-emerald-700 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400"
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
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTool(toolInput);
                          }
                        }}
                        placeholder="Araç yaz (örn: Jira, Figma, Excel, SAP, Slack, Notion, Docker)..."
                        className={fieldClass}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddTool(toolInput)}
                        disabled={!toolInput.trim()}
                        className="shrink-0 rounded-xl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {suggestedTools.length > 0 && (
                      <div className="mt-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                          Popüler Araçlar & Yazılımlar:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedTools.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddTool(sug)}
                              className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 transition-colors"
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

              {/* Step 4: Eğitim, Sertifikalar & Diller */}
              <FormSection
                stepNumber={4}
                title="Eğitim, Sertifikalar & Yabancı Diller"
                icon={GraduationCap}
                description="Mezuniyet dereceniz, bitirdiğiniz bölüm, yabancı dilleriniz ve sertifikalarınız."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Eğitim Seviyesi" required>
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

                  <Field label="Üniversite / Bölüm" hint="Örn: Bilgisayar Mühendisliği">
                    <input
                      type="text"
                      value={educationField}
                      onChange={(e) => setEducationField(e.target.value)}
                      placeholder="Örn: Endüstri Mühendisliği, İktisat, İletişim..."
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Yabancı Diller" hint="Dil ve seviye belirtin">
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="Örn: İngilizce (İleri), Almanca (Orta)..."
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Sertifikalar" hint="Örn: PMP, AWS Certified, Scrum Master">
                    <input
                      type="text"
                      value={certificates}
                      onChange={(e) => setCertificates(e.target.value)}
                      placeholder="Örn: AWS Certified Developer, PMP, Six Sigma..."
                      className={fieldClass}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Step 5: Kariyer Tercihleri & Hedefler */}
              <FormSection
                stepNumber={5}
                title="Kariyer Tercihleri & Hedef Pozisyonlar"
                icon={Target}
                description="Açık olduğunuz diğer pozisyonlar, ilgilendiğiniz sektörler ve çalışma koşulları."
              >
                {/* Target Positions Multi-select */}
                <Field label="Açık Olduğum Hedef Pozisyonlar" hint="Birden fazla pozisyon seçebilirsiniz">
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                    {selectedRoles.length === 0 ? (
                      <span className="text-xs text-muted-foreground px-1">
                        Pozisyon eklenmedi. Aşağıdaki önerilerden seçin veya yazın.
                      </span>
                    ) : (
                      selectedRoles.map((r) => (
                        <Badge
                          key={r}
                          variant="secondary"
                          className="gap-1.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
                        >
                          <span>{r}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(r)}
                            className="text-amber-700 hover:text-rose-600 dark:text-amber-400 dark:hover:text-rose-400"
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
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRole(roleInput);
                        }
                      }}
                      placeholder="Pozisyon ara veya kendin yaz..."
                      className={fieldClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddRole(roleInput)}
                      disabled={!roleInput.trim()}
                      className="shrink-0 rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {suggestedRoles.length > 0 && (
                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                        Önerilen Hedef Pozisyonlar:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedRoles.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddRole(sug)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-foreground/80 hover:border-amber-500 hover:text-amber-600 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>

                {/* Target Sectors Multi-select */}
                <div className="mt-5 pt-5 border-t border-border/50">
                  <Field label="İlgilenilen Hedef Sektörler" hint="Birden fazla sektör seçebilirsiniz">
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                      {JOB_SECTOR_OPTIONS.map((sec) => {
                        const isSelected = selectedSectors.includes(sec);
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => handleToggleSector(sec)}
                            className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
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
                </div>

                {/* Work Conditions */}
                <div className="grid gap-4 sm:grid-cols-2 mt-5 pt-5 border-t border-border/50">
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

                  <Field label="İşe Başlama Uygunluğu" required>
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

                {/* Salary Expectation */}
                <div className="mt-5 pt-5 border-t border-border/50">
                  <Field label="Aylık Net Maaş Beklentisi (TL)" hint="İsteğe bağlı aralık">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Min:</span>
                        <input
                          type="number"
                          value={salaryMin || ''}
                          onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="45.000"
                          className={`${fieldClass} pl-11`}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Max:</span>
                        <input
                          type="number"
                          value={salaryMax || ''}
                          onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="70.000"
                          className={`${fieldClass} pl-11`}
                        />
                      </div>
                    </div>
                  </Field>
                </div>
              </FormSection>

              {/* Step 6: Kariyer Özeti (AI Destekli) */}
              <FormSection
                stepNumber={6}
                title="Kariyer Özeti & Hakkımda"
                icon={FileText}
                description="Profilinizin ve eşleşmelerinizin en üstünde yer alacak profesyonel özetiniz."
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/85">Kariyer Özeti</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAiSummary}
                      className="h-8 gap-1.5 rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 font-medium text-xs shadow-2xs"
                    >
                      {isGeneratingAi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>
                        {candidateTraits
                          ? '✨ Yapay Zeka ile Yeniden Düzenle'
                          : '✨ Yapay Zeka ile Otomatik Oluştur'}
                      </span>
                    </Button>
                  </div>
                  <textarea
                    value={candidateTraits}
                    onChange={(e) => setCandidateTraits(e.target.value)}
                    placeholder="Kariyer hedefleriniz, temel uzmanlık alanlarınız, şirkete ve ekibe katabileceğiniz değerler hakkında bilgi verin veya yukarıdaki '✨ Yapay Zeka ile Oluştur' butonuna basın..."
                    className={areaClass}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    💡 İpucu: Formdaki alanları doldurduktan sonra Yapay Zeka butonuna basarak 1 saniyede profesyonel özet üretebilirsiniz.
                  </p>
                </div>
              </FormSection>
            </>
          )}

          {/* ========================================================= */}
          {/* PERSONA: HIRE (İşe Almak İstiyorum) */}
          {/* ========================================================= */}
          {persona === 'hire' && (
            <>
              {/* Step 1: Firma Bilgisi */}
              <FormSection
                stepNumber={1}
                title="Firma & Şirket Bilgileri"
                icon={Building2}
                description="İlan kartlarında açıkça gösterilecek ve adayların güvenini artıracak şirket bilgileri."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Şirket / Girişim İsmi" hint="İlan kartında açıkça görüntülenir">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Örn: Trendyol Tech, ABC Yazılım A.Ş., Hive FinTech..."
                        className={`${fieldClass} pl-10`}
                      />
                    </div>
                  </Field>

                  <Field label="Şirket Sektörü" required hint="Önce sektör seçiniz">
                    <select
                      value={primarySector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Sektör Seçiniz</option>
                      {JOB_SECTOR_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Çalışma İli / Lokasyon" required>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
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

                  <Field label="İlçe" hint={city ? 'Şehre göre listelenir' : 'Önce şehri seçiniz'}>
                    <select
                      value={preferredDistrict}
                      onChange={(e) => setPreferredDistrict(e.target.value)}
                      disabled={!city || availableDistricts.length === 0}
                      className={selectClass}
                    >
                      <option value="">{city ? 'İlçe Seçiniz' : '← Önce Şehir Seçiniz'}</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </FormSection>

              {/* Step 2: Pozisyon & Şartlar */}
              <FormSection
                stepNumber={2}
                title="Açık Pozisyon & Temel Koşullar"
                icon={Briefcase}
                description="Aranan açık pozisyon, deneyim seviyesi ve çalışma şartları."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Açık Pozisyon Unvanı"
                    required
                    hint={isCustomRoleMode ? 'Özel unvanınızı kendiniz yazıyorsunuz' : 'Sektöre göre otomatik listelenir'}
                  >
                    {isCustomRoleMode ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={primaryRole}
                            onChange={(e) => setPrimaryRole(e.target.value)}
                            onBlur={() => {
                              if (primaryRole.trim()) setPrimaryRole(suggestTitleCaseTr(primaryRole));
                            }}
                            placeholder="Örn: Senior Frontend Developer, Satış Lideri..."
                            className={fieldClass}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCustomRoleMode(false);
                              setPrimaryRole('');
                            }}
                            className="shrink-0 rounded-xl text-xs"
                          >
                            Listeden Seç
                          </Button>
                        </div>
                        {primaryRole.trim().length >= 2 && (
                          <CareerManualAssist
                            kind="role"
                            text={primaryRole}
                            catalog={sectorPositions}
                            sector={primarySector}
                            experienceLevel={experienceLevel}
                            onAcceptCatalog={(items) => {
                              if (items[0]) {
                                setPrimaryRole(items[0]);
                                setIsCustomRoleMode(false);
                              }
                            }}
                          />
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          Listede olmayan pozisyon unvanını kendiniz girdiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <select
                          value={primaryRole}
                          onChange={(e) => handleRoleSelectChange(e.target.value)}
                          disabled={!primarySector}
                          className={selectClass}
                        >
                          <option value="">
                            {primarySector ? 'Meslek / Pozisyon Seçiniz' : '← Önce 1. Adımdan Şirket Sektörünü Seçiniz'}
                          </option>
                          {sectorPositions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos === MANUAL_OPTION ? '✍️ Listede yok, kendim yazacağım' : pos}
                            </option>
                          ))}
                          {!sectorPositions.includes(MANUAL_OPTION) && (
                            <option value="__CUSTOM__">✍️ Listede yok, kendim yazacağım</option>
                          )}
                        </select>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                          <span>Aradığınız unvan listede yoksa:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomRoleMode(true);
                            }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                          >
                            Kendim Gireceğim
                          </button>
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field label="Aranan Deneyim Seviyesi" required>
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
                </div>
              </FormSection>

              {/* Step 3: Sorumluluklar & Başarı */}
              <FormSection
                stepNumber={3}
                title="İş Tanımı & Başarı Beklentisi"
                icon={Award}
                description="Pozisyondan beklenen sorumluluklar ve başarı ölçütleri."
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/85">Temel Sorumluluklar *</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAiSummary}
                      className="h-8 gap-1.5 rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 font-medium text-xs shadow-2xs"
                    >
                      {isGeneratingAi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>✨ Yapay Zeka ile İş Tanımı Oluştur</span>
                    </Button>
                  </div>
                  <textarea
                    value={candidateTraits}
                    onChange={(e) => setCandidateTraits(e.target.value)}
                    placeholder="Adayın üstleneceği temel görev ve sorumluluklar..."
                    className={areaClass}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Field label="Başarı Beklentisi & Hedefler" hint="İlk 3-6 ayda beklenen çıktılar">
                    <textarea
                      value={requiredAchievements}
                      onChange={(e) => setRequiredAchievements(e.target.value)}
                      placeholder="Örn: Yeni mobil uygulamanın yayına alınması, satış hedeflerinin %20 artırılması..."
                      className={areaClass}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Step 4: Aranan Yetkinlikler */}
              <FormSection
                stepNumber={4}
                title="Aranan Yetkinlikler & Araçlar"
                icon={Sparkles}
                description="Adayda aranan teknik araçlar ve profesyonel yetkinlikler."
              >
                <Field label="Aranan Teknik Yetkinlikler" hint="Yazılımlar, diller, araçlar">
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                    {selectedTechSkills.length === 0 ? (
                      <span className="text-xs text-muted-foreground px-1">
                        Teknik beceri eklenmedi. Önerilerden seçin veya yazın.
                      </span>
                    ) : (
                      selectedTechSkills.map((sk) => (
                        <Badge
                          key={sk}
                          variant="secondary"
                          className="gap-1.5 bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
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
                      placeholder="Teknik beceri ekle (örn: Next.js, Node.js, PostgreSQL)..."
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
                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                        Önerilen Teknik Yetkinlikler:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {smartTechSkillSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddTechSkill(sug)}
                            className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 transition-colors"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>

                <div className="mt-5 pt-5 border-t border-border/50">
                  <Field label="Aranan Mesleki Yetkinlikler">
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 mb-2">
                      {selectedProfSkills.length === 0 ? (
                        <span className="text-xs text-muted-foreground px-1">
                          Mesleki yetkinlik eklenmedi.
                        </span>
                      ) : (
                        selectedProfSkills.map((sk) => (
                          <Badge
                            key={sk}
                            variant="secondary"
                            className="gap-1.5 bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
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
                        placeholder="Mesleki yetkinlik ekle..."
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
                      <div className="mt-2.5">
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                          Önerilen Mesleki Yetkinlikler:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {smartProfSkillSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddProfSkill(sug)}
                              className="rounded-xl border border-purple-500/30 bg-purple-500/5 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-500/20 dark:text-purple-300 transition-colors"
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

              {/* Step 5: Eğitim, Dil & Bütçe */}
              <FormSection
                stepNumber={5}
                title="Eğitim, Dil & Maaş Bütçesi"
                icon={DollarSign}
                description="Pozisyon bütçesi ve adaydan beklenen eğitim/dil kriterleri."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Aranan Eğitim Seviyesi">
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

                  <Field label="Yabancı Dil Beklentisi">
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="Örn: İngilizce (İleri Düzey)..."
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Field label="Aylık Net Bütçe / Maaş Aralığı (TL)" hint="İlan kartında gösterilir">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Min:</span>
                        <input
                          type="number"
                          value={salaryMin || ''}
                          onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="60.000"
                          className={`${fieldClass} pl-11`}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Max:</span>
                        <input
                          type="number"
                          value={salaryMax || ''}
                          onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="90.000"
                          className={`${fieldClass} pl-11`}
                        />
                      </div>
                    </div>
                  </Field>
                </div>
              </FormSection>
            </>
          )}

          {/* ========================================================= */}
          {/* PERSONA: PARTNER (Ortaklık Yapmak İstiyorum) */}
          {/* ========================================================= */}
          {persona === 'partner' && (
            <>
              {/* Step 1: Temel Ortaklık Bilgisi */}
              <FormSection
                stepNumber={1}
                title="Temel Ortaklık Bilgileri"
                icon={Handshake}
                description="Girişim adı, ortaklık türü ve ana sektör."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Girişim / Proje Adı" required>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: PayBee, HealthAI, B2B Lojistik..."
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Ortaklık Türü" required>
                    <select
                      value={partnerType}
                      onChange={(e) => setPartnerType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="seeking_partner">Girişimime Ortak Arıyorum</option>
                      <option value="become_partner">Bir Girişime Ortak Olmak İstiyorum</option>
                    </select>
                  </Field>

                  <Field label="Ana Sektör" required>
                    <select
                      value={primarySector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Sektör Seçiniz</option>
                      {JOB_SECTOR_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Şehir / Lokasyon" required>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
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
                </div>
              </FormSection>

              {/* Step 2: Girişim Aşaması & İş Modeli */}
              <FormSection
                stepNumber={2}
                title="Girişim Aşaması & İş Modeli"
                icon={Rocket}
                description="Girişimin mevcut gelişim aşaması ve gelir modeli."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Girişim Aşaması" required>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Aşama Seçiniz</option>
                      {STARTUP_STAGES.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="İş Modeli">
                    <select
                      value={businessModel}
                      onChange={(e) => setBusinessModel(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Model Seçiniz</option>
                      {BUSINESS_MODEL_OPTIONS.map((bm) => (
                        <option key={bm} value={bm}>
                          {bm}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </FormSection>

              {/* Step 3: Aranan / Sunulan Katkı & Yetkinlikler */}
              <FormSection
                stepNumber={3}
                title="Katkı Alanları & Aranan Uzmanlık"
                icon={Sparkles}
                description="Ortaktan beklenen veya girişime sunulan uzmanlık ve katkı alanları."
              >
                <Field label="Katkı Alanları">
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    {PARTNER_EXPERTISE_OPTIONS.map((exp) => {
                      const isSelected = selectedProfSkills.includes(exp);
                      return (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => handleAddProfSkill(exp)}
                          className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'border border-slate-200 bg-white text-muted-foreground hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {exp}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Field label="Aranan Teknik & Özel Yetkinlikler">
                    <div className="flex gap-2 mb-2">
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
                        placeholder="Örn: Mobil Geliştirme, B2B Satış, Dijital Pazarlama..."
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

                    {selectedTechSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTechSkills.map((sk) => (
                          <Badge
                            key={sk}
                            variant="secondary"
                            className="gap-1.5 bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 text-xs font-medium rounded-xl"
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
                        ))}
                      </div>
                    )}
                  </Field>
                </div>
              </FormSection>

              {/* Step 4: Sermaye & Hisse Yapısı */}
              <FormSection
                stepNumber={4}
                title="Sermaye & Ortaklık / Hisse Yapısı"
                icon={PieChart}
                description="Sermaye katkısı ve önerilen hisse paylaşımı."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sermaye Katkısı / İhtiyacı" hint="Örn: 250.000 TL / Efor Odaklı">
                    <input
                      type="text"
                      value={capitalContribution}
                      onChange={(e) => setCapitalContribution(e.target.value)}
                      placeholder="Örn: 250.000 TL veya Sermayesiz (Efor Odaklı)"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Önerilen / Beklenen Hisse Oranı (%)">
                    <input
                      type="text"
                      value={equityOffered}
                      onChange={(e) => setEquityOffered(e.target.value)}
                      placeholder="Örn: %15 - %30"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Zaman Taahhüdü">
                    <select
                      value={workType}
                      onChange={(e) => setWorkType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Seçiniz</option>
                      <option value="Tam Zamanlı">Tam Zamanlı</option>
                      <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                      <option value="Danışman / Mentor">Danışman / Mentor</option>
                    </select>
                  </Field>

                  <Field label="Çalışma Şekli">
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
                </div>
              </FormSection>

              {/* Step 5: Girişim Özeti (AI Destekli) */}
              <FormSection
                stepNumber={5}
                title="Girişim Vizyonu & Proje Özeti"
                icon={FileText}
                description="Girişiminizin çözdüğü problem, hedef pazar ve ortaktan beklentileriniz."
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/85">Proje Özeti & Vizyon</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingAi}
                      onClick={handleGenerateAiSummary}
                      className="h-8 gap-1.5 rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 font-medium text-xs shadow-2xs"
                    >
                      {isGeneratingAi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>✨ Yapay Zeka ile Vizyon Özeti Oluştur</span>
                    </Button>
                  </div>
                  <textarea
                    value={candidateTraits}
                    onChange={(e) => setCandidateTraits(e.target.value)}
                    placeholder="Girişim fikriniz, mevcut durumunuz, hedef pazarınız ve aradığınız ortaktan beklentilerinizi detaylandırın veya Yapay Zeka butonuna basın..."
                    className={areaClass}
                  />
                </div>
              </FormSection>
            </>
          )}

          {/* Save Button Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="text-xs text-muted-foreground">
              Değişiklikler anında eşleşme motoruna ve yeni ilanlarınıza yansır.
            </div>
            <Button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl px-7 font-medium gap-2 shadow-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Kaydediliyor…' : 'Kariyer Profilini Kaydet'}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Sticky Live Candidate Preview (5 cols) */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-display text-sm font-bold text-foreground">Canlı Kart Önizlemesi</span>
              </div>
              {!record.listingId.startsWith('draft') && (
                <Link
                  href={record.editHref}
                  className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  <span>İlanı Düzenle</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              İşverenler ve girişimciler kartınızı aramalarda ve eşleşmelerde bu şekilde görecek:
            </p>

            <CareerProfilePreview data={preview} />
          </div>

          {/* Journey Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
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
    </div>
  );
}
