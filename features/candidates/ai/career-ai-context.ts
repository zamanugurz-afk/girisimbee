import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  formatCareerPeriod,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import {
  isManualCareerOption,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import type { CareerAiSafeContext, CareerAiSafeExperience } from '@/features/candidates/ai/career-ai.types';
import { detectCareerProgression } from '@/features/candidates/ai/career-progression';
import { pickHighlightedSkills } from '@/features/candidates/ai/skill-relevance';
import { redactCareerAiValue } from '@/features/candidates/ai/career-ai-pii';

export const CAREER_AI_CONTEXT_LIMITS = {
  experiences: 6,
  responsibilities: 4,
  achievements: 3,
  skills: 8,
  certificates: 5,
  languages: 4,
  progressions: 4,
} as const;

const PII_KEYS = new Set([
  'gender',
  'profileGender',
  'birthDate',
  'age',
  'residenceCity',
  'residenceDistrict',
  'preferredCity',
  'company',
  'companyName',
  'employer',
  'phone',
  'contactPhone',
  'email',
  'displayName',
  'ownerUserId',
]);

export function stableStringify(value: unknown): string {
  if (value === null || typeof value === 'undefined') {
    return JSON.stringify(value);
  }
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

/** Deterministic fingerprint — isomorphic (no Node crypto). */
export function fingerprintCanonical(value: unknown): string {
  const canonical = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function careerAiPolishFingerprint(input: {
  kind: string;
  text: string;
  metric?: string;
  role?: string;
  sector?: string;
  experienceLevel?: string;
  totalExperienceYears?: number | null;
}): string {
  return fingerprintCanonical({
    action: 'polish',
    kind: input.kind,
    text: input.text.trim(),
    metric: (input.metric ?? '').trim(),
    role: (input.role ?? '').trim(),
    sector: (input.sector ?? '').trim(),
    experienceLevel: (input.experienceLevel ?? '').trim(),
    totalExperienceYears: input.totalExperienceYears ?? null,
  });
}

function takeList(value: unknown, limit: number): string[] {
  return Array.from(new Set(parseSelectedList(value).map((item) => item.trim()).filter(Boolean))).slice(
    0,
    limit,
  );
}

function experienceRole(exp: CareerExperience): string {
  if (isManualCareerOption(exp.role)) return (exp.roleOther ?? '').trim() || exp.role.trim();
  return exp.role.trim();
}

function splitLines(value: string, limit: number): string[] {
  return value
    .split(/\n|·|;/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, limit);
}

export function toSafeExperience(exp: CareerExperience): CareerAiSafeExperience {
  return {
    role: experienceRole(exp),
    sector: exp.sector.trim(),
    period: formatCareerPeriod(exp),
    responsibilities: splitLines(exp.responsibilities, CAREER_AI_CONTEXT_LIMITS.responsibilities),
    achievements: splitLines(exp.achievements, CAREER_AI_CONTEXT_LIMITS.achievements),
    metric: (exp.achievementMetric ?? '').trim(),
  };
}

function experienceMeaningScore(exp: CareerExperience): number {
  const safe = toSafeExperience(exp);
  const content =
    safe.responsibilities.length * 2 +
    safe.achievements.length * 3 +
    (safe.metric ? 4 : 0) +
    (safe.role ? 1 : 0);
  const interval = toCareerPeriodInterval(exp);
  const recency = interval ? interval.end : (exp.startYear ?? 0) * 12;
  return content * 100 + recency;
}

export function pickMeaningfulExperiences(
  experiences: CareerExperience[],
  limit = CAREER_AI_CONTEXT_LIMITS.experiences,
): CareerExperience[] {
  const scored = experiences.map((exp, index) => ({
    exp,
    index,
    score: experienceMeaningScore(exp),
  }));
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const picked = scored.slice(0, limit).map((row) => row.exp);
  return picked.sort((a, b) => {
    const aInterval = toCareerPeriodInterval(a);
    const bInterval = toCareerPeriodInterval(b);
    if (aInterval && bInterval) return aInterval.start - bInterval.start;
    return 0;
  });
}

export function compactCareerAiContext(context: CareerAiSafeContext): CareerAiSafeContext {
  return {
    primarySector: context.primarySector.trim(),
    desiredRole: context.desiredRole.trim(),
    experienceLevel: context.experienceLevel.trim(),
    totalExperienceYears: context.totalExperienceYears ?? null,
    professionalSkills: context.professionalSkills.map((item) => item.trim()).filter(Boolean).slice(
      0,
      CAREER_AI_CONTEXT_LIMITS.skills,
    ),
    educationLevel: context.educationLevel.trim(),
    educationField: context.educationField.trim(),
    certificates: context.certificates.map((item) => item.trim()).filter(Boolean).slice(
      0,
      CAREER_AI_CONTEXT_LIMITS.certificates,
    ),
    languages: context.languages
      .map((entry) => ({
        language: entry.language.trim(),
        level: entry.level.trim(),
      }))
      .filter((entry) => entry.language)
      .slice(0, CAREER_AI_CONTEXT_LIMITS.languages),
    experiences: context.experiences.slice(0, CAREER_AI_CONTEXT_LIMITS.experiences).map((exp) => ({
      role: exp.role.trim(),
      sector: exp.sector.trim(),
      period: exp.period.trim(),
      responsibilities: exp.responsibilities.map((item) => item.trim()).filter(Boolean).slice(
        0,
        CAREER_AI_CONTEXT_LIMITS.responsibilities,
      ),
      achievements: exp.achievements.map((item) => item.trim()).filter(Boolean).slice(
        0,
        CAREER_AI_CONTEXT_LIMITS.achievements,
      ),
      metric: exp.metric.trim(),
    })),
    careerProgressions: context.careerProgressions
      .map((row) => ({ from: row.from.trim(), to: row.to.trim() }))
      .filter((row) => row.from && row.to)
      .slice(0, CAREER_AI_CONTEXT_LIMITS.progressions),
  };
}

export function buildCareerAiSafeContext(input: {
  primarySector?: string | null;
  desiredRole?: string | null;
  experienceLevel?: string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  certificates?: string | null;
  languages?: unknown;
  experiences?: CareerExperience[];
  totalExperienceYears?: number | null;
}): CareerAiSafeContext {
  const experiences = pickMeaningfulExperiences(input.experiences ?? []);
  const skills = pickHighlightedSkills({
    professionalSkills: input.professionalSkills,
    technicalSkills: input.technicalSkills,
    desiredRole: input.desiredRole,
    primarySector: input.primarySector,
    experiences: input.experiences,
    limit: CAREER_AI_CONTEXT_LIMITS.skills,
  });
  const languages = parseCareerLanguages(input.languages)
    .map((entry) => ({
      language: (entry.languageOther?.trim() || entry.language).trim(),
      level: entry.level.trim(),
    }))
    .filter((entry) => entry.language)
    .slice(0, CAREER_AI_CONTEXT_LIMITS.languages);

  const context: CareerAiSafeContext = {
    primarySector: (input.primarySector ?? '').trim(),
    desiredRole: (input.desiredRole ?? '').trim(),
    experienceLevel: (input.experienceLevel ?? '').trim(),
    totalExperienceYears: input.totalExperienceYears ?? null,
    professionalSkills: skills,
    educationLevel: (input.educationLevel ?? '').trim(),
    educationField: (input.educationField ?? '').trim(),
    certificates: takeList(input.certificates, CAREER_AI_CONTEXT_LIMITS.certificates),
    languages,
    experiences: experiences.map(toSafeExperience),
    careerProgressions: detectCareerProgression(input.experiences ?? [])
      .map(({ from, to }) => ({ from, to }))
      .slice(0, CAREER_AI_CONTEXT_LIMITS.progressions),
  };
  return compactCareerAiContext(redactCareerAiValue(context));
}

export function hasCareerAiProfileReady(context: CareerAiSafeContext): boolean {
  return Boolean(
    context.desiredRole ||
      context.experiences.some((exp) => exp.role) ||
      context.professionalSkills.length > 0,
  );
}

export function assertNoPii(value: unknown, path = 'root'): string[] {
  const leaks: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => leaks.push(...assertNoPii(item, `${path}[${index}]`)));
    return leaks;
  }
  if (!value || typeof value !== 'object') return leaks;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (PII_KEYS.has(key)) leaks.push(`${path}.${key}`);
    leaks.push(...assertNoPii(nested, `${path}.${key}`));
  }
  return leaks;
}
