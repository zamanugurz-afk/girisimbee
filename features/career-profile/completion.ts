import { extractCareerMatchProfile, normalizeCareerSource } from '@/features/career-profile/normalize';
import type { CareerFieldSource } from '@/features/career-profile/normalize';
import type { CareerListingKind } from '@/features/matching-engine/types';
import type {
  CareerProfileCompletion,
  CareerProfileFieldKey,
  CareerProfileFieldState,
  CareerProfileFormValues,
} from '@/features/career-profile/types';

export const CAREER_PROFILE_FIELD_WEIGHTS: Record<CareerProfileFieldKey, number> = {
  role: 20,
  sector: 15,
  experience: 10,
  professionalSkills: 15,
  technicalSkills: 15,
  workType: 5,
  workplacePreference: 5,
  location: 5,
  education: 3,
  languages: 4,
  availability: 3,
  candidateTraits: 3,
};

const SEEKER_KEYS: CareerProfileFieldKey[] = [
  'role',
  'sector',
  'experience',
  'professionalSkills',
  'technicalSkills',
  'workType',
  'workplacePreference',
  'location',
  'education',
  'languages',
  'availability',
];

const HIRE_KEYS: CareerProfileFieldKey[] = [
  'role',
  'sector',
  'experience',
  'professionalSkills',
  'technicalSkills',
  'workType',
  'workplacePreference',
  'location',
  'education',
  'languages',
  'candidateTraits',
];

export const CAREER_PROFILE_FIELD_LABELS: Record<CareerListingKind, Record<CareerProfileFieldKey, string>> = {
  seek: {
    role: 'Hedef pozisyon',
    sector: 'Sektör',
    experience: 'Deneyim seviyesi',
    professionalSkills: 'Profesyonel yetkinlikler',
    technicalSkills: 'Teknik yetkinlikler',
    workType: 'Çalışma modeli',
    workplacePreference: 'Çalışma tercihi',
    location: 'Tercih edilen şehir',
    education: 'Eğitim seviyesi',
    languages: 'Diller',
    availability: 'İşe başlama uygunluğu',
    candidateTraits: 'Aranan aday özellikleri',
  },
  hire: {
    role: 'Pozisyon',
    sector: 'Sektör',
    experience: 'Aranan deneyim seviyesi',
    professionalSkills: 'Profesyonel yetkinlikler',
    technicalSkills: 'Teknik yetkinlikler',
    workType: 'Çalışma modeli',
    workplacePreference: 'Çalışma tercihi',
    location: 'Lokasyon',
    education: 'Eğitim seviyesi',
    languages: 'Dil beklentileri',
    availability: 'İşe başlama uygunluğu',
    candidateTraits: 'Aranan aday özellikleri',
  },
};

function displayList(values: string[]): string | null {
  return values.length ? values.join(' · ') : null;
}

export function careerProfileKeysFor(kind: CareerListingKind): CareerProfileFieldKey[] {
  return kind === 'hire' ? HIRE_KEYS : SEEKER_KEYS;
}

export function emptyCareerProfileValues(): CareerProfileFormValues {
  return {
    role: '',
    sector: '',
    experienceLevel: '',
    professionalSkills: '',
    technicalSkills: '',
    workType: '',
    workplacePreference: '',
    city: '',
    educationLevel: '',
    languages: '',
    availability: '',
    candidateTraits: '',
    salary: '',
  };
}

export function valuesFromCareerSource(source: CareerFieldSource): CareerProfileFormValues {
  const profile = normalizeCareerSource(source);
  const cf = (source.customFields ?? {}) as Record<string, unknown>;
  return {
    role: profile.role ?? '',
    roles: profile.roles && profile.roles.length > 0 ? profile.roles : profile.role ? [profile.role] : [],
    sector: profile.sector ?? '',
    sectors: profile.sectors && profile.sectors.length > 0 ? profile.sectors : profile.sector ? [profile.sector] : [],
    experienceLevel: profile.experienceLevel ?? '',
    professionalSkills: displayList(profile.professionalSkills) ?? '',
    professionalSkillsList: profile.professionalSkills ?? [],
    technicalSkills: displayList(profile.technicalSkills) ?? '',
    technicalSkillsList: profile.technicalSkills ?? [],
    workType: profile.workType ?? '',
    workplacePreference: profile.workplacePreference ?? '',
    city: profile.city ?? '',
    educationLevel: profile.educationLevel ?? '',
    languages: typeof cf.languages === 'string' ? cf.languages : displayList(profile.languages) ?? '',
    availability: profile.availability ?? '',
    candidateTraits: profile.requiredResponsibilities ?? '',
    salary: profile.salary ?? '',
    salaryMin: profile.salaryMin,
    salaryMax: profile.salaryMax,
    experiences: Array.isArray(cf.experiences) ? (cf.experiences as any) : undefined,
    educationHistory: Array.isArray(cf.educationHistory) ? (cf.educationHistory as any) : undefined,
    educationField: typeof cf.educationField === 'string' ? cf.educationField : '',
    certificates: typeof cf.certificates === 'string' ? cf.certificates : '',
    tools: typeof cf.tools === 'string' ? cf.tools : '',
    toolsList: Array.isArray(cf.toolsList) ? (cf.toolsList as string[]) : typeof cf.tools === 'string' && cf.tools ? (cf.tools as string).split(/[·,]/).map((s) => s.trim()).filter(Boolean) : undefined,
    profileGender: typeof cf.profileGender === 'string' ? cf.profileGender : '',
    birthDate: typeof cf.birthDate === 'string' ? cf.birthDate : '',
    residenceCity: typeof cf.residenceCity === 'string' ? cf.residenceCity : '',
    residenceDistrict: typeof cf.residenceDistrict === 'string' ? cf.residenceDistrict : '',
    preferredDistrict: typeof cf.preferredDistrict === 'string' ? cf.preferredDistrict : '',
    companyName: typeof cf.companyName === 'string' ? cf.companyName : '',
    requiredAchievements: typeof cf.requiredAchievements === 'string' ? cf.requiredAchievements : '',
    cvFileName: typeof cf.cvFileName === 'string' ? cf.cvFileName : undefined,
    cvDocumentId: typeof cf.cvDocumentId === 'string' ? cf.cvDocumentId : undefined,
    cvUploadedAt: typeof cf.cvUploadedAt === 'string' ? cf.cvUploadedAt : undefined,
    stage: typeof cf.stage === 'string' ? cf.stage : '',
    businessModel: typeof cf.businessModel === 'string' ? cf.businessModel : '',
    capitalContribution: typeof cf.capitalContribution === 'string' ? cf.capitalContribution : '',
    equityOffered: typeof cf.equityOffered === 'string' ? cf.equityOffered : '',
  };
}

export function calculateCareerProfileCompletion(input: {
  kind: CareerListingKind;
  listingId?: string | null;
  source?: CareerFieldSource | null;
}): CareerProfileCompletion {
  const source = input.source ?? {};
  const profile = extractCareerMatchProfile(source);
  const values = valuesFromCareerSource(source);
  const labels = CAREER_PROFILE_FIELD_LABELS[input.kind];
  const keys = careerProfileKeysFor(input.kind);

  const filledByKey: Record<CareerProfileFieldKey, { filled: boolean; value: string | null }> = {
    role: { filled: Boolean(profile.role), value: profile.role },
    sector: { filled: Boolean(profile.sector), value: profile.sector },
    experience: { filled: Boolean(profile.experienceLevel), value: profile.experienceLevel },
    professionalSkills: {
      filled: profile.professionalSkills.length > 0,
      value: displayList(profile.professionalSkills),
    },
    technicalSkills: {
      filled: profile.technicalSkills.length > 0,
      value: displayList(profile.technicalSkills),
    },
    workType: { filled: Boolean(profile.workType), value: profile.workType },
    workplacePreference: { filled: Boolean(profile.workplacePreference), value: profile.workplacePreference },
    location: { filled: Boolean(profile.city), value: profile.city },
    education: { filled: Boolean(profile.educationLevel), value: profile.educationLevel },
    languages: { filled: profile.languages.length > 0, value: displayList(profile.languages) },
    availability: { filled: Boolean(values.availability), value: values.availability || null },
    candidateTraits: { filled: Boolean(values.candidateTraits), value: values.candidateTraits || null },
  };

  const fields: CareerProfileFieldState[] = keys.map((key) => ({
    key,
    label: labels[key],
    weight: CAREER_PROFILE_FIELD_WEIGHTS[key],
    filled: filledByKey[key].filled,
    value: filledByKey[key].value,
  }));

  const usedWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  const earned = fields.reduce((sum, field) => sum + (field.filled ? field.weight : 0), 0);
  const percent = usedWeight <= 0 ? 0 : Math.round((earned / usedWeight) * 100);

  return {
    kind: input.kind,
    listingId: input.listingId ?? '',
    percent,
    complete: percent >= 100,
    fields,
    missingLabels: fields.filter((field) => !field.filled).map((field) => field.label),
  };
}
