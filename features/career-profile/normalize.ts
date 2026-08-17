import {
  isManualCareerOption,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { uniqueNormalized } from '@/features/matching-engine/scoring';
import type { CareerMatchProfile } from '@/features/matching-engine/types';

/**
 * Stored listing/profile field aliases that share one matching meaning.
 * This layer collapses them before scoring. It does not change weights.
 */
export const CAREER_FIELD_ALIASES = {
  role: ['desiredRole', 'desiredRoleOther', 'positionTitle', 'positionTitleOther', 'preferredRoles', 'preferredRolesOther'],
  sector: ['primarySector', 'sectorOther', 'preferredSectors'],
  professionalSkills: ['professionalSkills', 'professionalSkillsOther'],
  technicalSkills: ['technicalSkills', 'technicalSkillsOther'],
  experienceLevel: ['experienceLevel'],
  workType: ['workType', 'employmentType'],
  workplacePreference: ['workplacePreference'],
  location: ['preferredCity', 'city', 'location'],
  educationLevel: ['educationLevel'],
  languages: ['languages', 'languageEntries', 'languageTags'],
  availability: ['availability'],
  requiredResponsibilities: ['requiredResponsibilities'],
} as const;

export const CAREER_DATA_CONTRACT = [
  { canonical: 'role', seekForm: 'desiredRole', hireForm: 'desiredRole / positionTitle', profile: 'role', matching: 'role / roles', completion: 'role', publicCard: 'preview.desiredRole' },
  { canonical: 'sector', seekForm: 'primarySector / preferredSectors', hireForm: 'primarySector', profile: 'sector', matching: 'sector / sectors', completion: 'sector', publicCard: 'preview.primarySector' },
  { canonical: 'professionalSkills', seekForm: 'professionalSkills', hireForm: 'professionalSkills', profile: 'professionalSkills', matching: 'professionalSkills', completion: 'professionalSkills', publicCard: 'highlightSkills' },
  { canonical: 'technicalSkills', seekForm: 'technicalSkills', hireForm: 'technicalSkills', profile: 'technicalSkills', matching: 'technicalSkills', completion: 'technicalSkills', publicCard: 'highlightSkills' },
  { canonical: 'experienceLevel', seekForm: 'experienceLevel', hireForm: 'experienceLevel', profile: 'experienceLevel', matching: 'experienceLevel', completion: 'experience', publicCard: 'experienceLabel' },
  { canonical: 'workType', seekForm: 'workType', hireForm: 'workType / employmentType', profile: 'workType', matching: 'workType', completion: 'workType', publicCard: 'workModel' },
  { canonical: 'workplacePreference', seekForm: 'workplacePreference', hireForm: 'workplacePreference', profile: 'workplacePreference', matching: 'workplacePreference', completion: 'workplacePreference', publicCard: 'workModel' },
  { canonical: 'location', seekForm: 'preferredCity', hireForm: 'preferredCity / listing.city', profile: 'city', matching: 'city', completion: 'location', publicCard: 'location' },
  { canonical: 'educationLevel', seekForm: 'educationLevel', hireForm: 'educationLevel', profile: 'educationLevel', matching: 'educationLevel', completion: 'education', publicCard: 'preview.educationLevel' },
  { canonical: 'languages', seekForm: 'languages', hireForm: 'languages', profile: 'languages', matching: 'languages', completion: 'languages', publicCard: 'preview.languages' },
  { canonical: 'availability', seekForm: 'availability', hireForm: 'availability', profile: 'availability', matching: 'availability', completion: 'availability', publicCard: 'preview.availability' },
  { canonical: 'requiredResponsibilities', seekForm: false, hireForm: 'requiredResponsibilities', profile: 'candidateTraits', matching: false, completion: 'candidateTraits', publicCard: 'preview.requiredResponsibilities' },
] as const;

export interface CareerFieldSource {
  city?: string | null;
  location?: string | null;
  customFields?: Record<string, unknown> | null;
}

export interface CanonicalCareerFields {
  role: string | null;
  roles: string[];
  sector: string | null;
  sectors: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  experienceLevel: string | null;
  workType: string | null;
  workplacePreference: string | null;
  city: string | null;
  languages: string[];
  educationLevel: string | null;
  availability: string | null;
  requiredResponsibilities: string | null;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
}

function readCustomFields(source?: CareerFieldSource | null): Record<string, unknown> {
  const cf = source?.customFields;
  if (!cf || typeof cf !== 'object' || Array.isArray(cf)) return {};
  return cf;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    const text = readString(value);
    if (text) return text;
  }
  return null;
}

function parseSalaryNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatSalaryDisplay(min: number | null, max: number | null, raw?: string | null): string | null {
  if (min && max) {
    return `${min.toLocaleString('tr-TR')} – ${max.toLocaleString('tr-TR')} TL`;
  }
  if (min) {
    return `${min.toLocaleString('tr-TR')} TL'den başlayan`;
  }
  if (max) {
    return `${max.toLocaleString('tr-TR')} TL'ye kadar`;
  }
  if (raw && typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

function resolveManualValue(primary: unknown, other: unknown): string | null {
  const main = readString(primary);
  const extra = readString(other);
  if (main && isManualCareerOption(main)) return extra ?? null;
  return main ?? extra;
}

function collectList(...values: unknown[]): string[] {
  const items: string[] = [];
  for (const value of values) {
    if (value == null) continue;
    items.push(...parseSelectedList(value));
  }
  return uniqueNormalized(items.filter((item) => !isManualCareerOption(item)));
}

function collectLanguages(...values: unknown[]): string[] {
  const names: string[] = [];
  for (const value of values) {
    if (value == null) continue;
    for (const entry of parseCareerLanguages(value)) {
      const name = isManualCareerOption(entry.language)
        ? readString(entry.languageOther)
        : readString(entry.language);
      if (name) names.push(name);
    }
  }
  return uniqueNormalized(names);
}

function emptyCanonicalFields(): CanonicalCareerFields {
  return {
    role: null,
    roles: [],
    sector: null,
    sectors: [],
    professionalSkills: [],
    technicalSkills: [],
    experienceLevel: null,
    workType: null,
    workplacePreference: null,
    city: null,
    languages: [],
    educationLevel: null,
    availability: null,
    requiredResponsibilities: null,
    salary: null,
    salaryMin: null,
    salaryMax: null,
  };
}

/**
 * Collapses seek/hire listing aliases into one canonical career record.
 * Missing values stay empty — they are not treated as mismatches here.
 */
export function normalizeCareerSource(source?: CareerFieldSource | null): CanonicalCareerFields {
  if (!source) return emptyCanonicalFields();

  const cf = readCustomFields(source);
  const role =
    resolveManualValue(cf.desiredRole, cf.desiredRoleOther)
    ?? resolveManualValue(cf.positionTitle, cf.positionTitleOther);
  const roles = uniqueNormalized([
    ...(role ? [role] : []),
    ...collectList(cf.preferredRoles, cf.preferredRolesOther),
  ]);
  const sector = resolveManualValue(cf.primarySector, cf.sectorOther);
  const sectors = uniqueNormalized([
    ...(sector ? [sector] : []),
    ...collectList(cf.preferredSectors),
  ]);

  const salaryMin = parseSalaryNumber(cf.minSalary ?? cf.min_salary ?? cf.salaryMin);
  const salaryMax = parseSalaryNumber(cf.maxSalary ?? cf.max_salary ?? cf.salaryMax ?? cf.salary);
  const rawSalary = readFirstString(cf.salary, cf.salaryRange, cf.expectedSalary);
  const salary = formatSalaryDisplay(salaryMin, salaryMax, rawSalary);

  return {
    role,
    roles,
    sector,
    sectors,
    professionalSkills: collectList(cf.professionalSkills, cf.professionalSkillsOther),
    technicalSkills: collectList(cf.technicalSkills, cf.technicalSkillsOther),
    experienceLevel: readString(cf.experienceLevel),
    workType: readFirstString(cf.workType, cf.employmentType),
    workplacePreference: readString(cf.workplacePreference),
    city: readFirstString(cf.preferredCity, source.city, source.location),
    languages: collectLanguages(cf.languages, cf.languageEntries, cf.languageTags),
    educationLevel: readString(cf.educationLevel),
    availability: readString(cf.availability),
    requiredResponsibilities: readString(cf.requiredResponsibilities),
    salary,
    salaryMin,
    salaryMax,
  };
}

export function toCareerMatchProfile(fields: CanonicalCareerFields): CareerMatchProfile {
  return {
    role: fields.role,
    roles: fields.roles,
    sector: fields.sector,
    sectors: fields.sectors,
    professionalSkills: fields.professionalSkills,
    technicalSkills: fields.technicalSkills,
    experienceLevel: fields.experienceLevel,
    workType: fields.workType,
    workplacePreference: fields.workplacePreference,
    city: fields.city,
    languages: fields.languages,
    educationLevel: fields.educationLevel,
    salary: fields.salary,
    salaryMin: fields.salaryMin,
    salaryMax: fields.salaryMax,
    availability: fields.availability,
  };
}

export function extractCareerMatchProfile(source?: CareerFieldSource | null): CareerMatchProfile {
  return toCareerMatchProfile(normalizeCareerSource(source));
}

export function canonicalWorkModel(fields: CanonicalCareerFields): string | null {
  return fields.workplacePreference ?? fields.workType;
}
