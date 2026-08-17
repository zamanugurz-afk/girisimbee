import { EXPERIENCE_LEVEL_VALUES } from '@/features/candidates/taxonomy/career-taxonomy';
import type { CareerMatchProfile, MatchDimensionKey, MatchDimensionResult } from '@/features/matching-engine/types';

/**
 * Career Matching Weights — Sum to 100%.
 * Pozisyon/Rol: %25
 * Yetkinlikler: %20 (Profesyonel: %12, Teknik: %8)
 * Sektör: %15
 * Lokasyon: %15 (Asla hard filter değildir, farklı şehirler %50 puan alır)
 * Deneyim: %10
 * Çalışma Şekli/Modeli: %10
 * Ücret: %3
 * İşe Başlama: %2
 * Toplam: %100.
 */
export const CAREER_MATCH_WEIGHTS: Record<MatchDimensionKey, number> = {
  role: 25,
  professionalSkills: 12,
  technicalSkills: 8,
  sector: 15,
  location: 15,
  experience: 10,
  workModel: 10,
  salary: 3,
  availability: 2,
  language: 0,
  education: 0,
};

export const MATCH_RECOMMENDATION_THRESHOLD = 50;

const EXPERIENCE_RANK = new Map<string, number>(
  EXPERIENCE_LEVEL_VALUES.map((value, index) => [value, index]),
);

export function normalizeMatchToken(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR');
}

export function uniqueNormalized(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = normalizeMatchToken(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value.trim());
  }
  return out;
}

export function normalizeMatchScore(weightedSum: number, usedWeight: number): number {
  if (usedWeight <= 0) return 0;
  const raw = (weightedSum / usedWeight) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function comparableText(value: string | null | undefined): string | null {
  const normalized = normalizeMatchToken(value);
  return normalized || null;
}

function setHas(values: readonly string[], candidate: string): boolean {
  const needle = normalizeMatchToken(candidate);
  return values.some((value) => normalizeMatchToken(value) === needle);
}

function overlapRatio(required: readonly string[], offered: readonly string[]): {
  score: number;
  matchedCount: number;
  missingCount: number;
  requiredCount: number;
} | null {
  const req = uniqueNormalized(required);
  const off = uniqueNormalized(offered);
  if (req.length === 0 || off.length === 0) return null;
  let matchedCount = 0;
  for (const item of req) {
    if (setHas(off, item)) matchedCount += 1;
  }
  return {
    score: matchedCount / req.length,
    matchedCount,
    missingCount: req.length - matchedCount,
    requiredCount: req.length,
  };
}

function tokenMatchScore(left: readonly string[], right: readonly string[]): number | null {
  const a = uniqueNormalized(left);
  const b = uniqueNormalized(right);
  if (a.length === 0 || b.length === 0) return null;
  for (const item of a) {
    if (setHas(b, item)) return 1;
  }
  for (const leftItem of a) {
    const leftNorm = normalizeMatchToken(leftItem);
    if (leftNorm.length < 4) continue;
    for (const rightItem of b) {
      const rightNorm = normalizeMatchToken(rightItem);
      if (rightNorm.length < 4) continue;
      if (leftNorm.includes(rightNorm) || rightNorm.includes(leftNorm)) return 0.65;
    }
  }
  return 0;
}

function rankScore(
  offered: string | null,
  required: string | null,
  rankOf: (value: string) => number | undefined,
): number | null {
  const offeredKey = comparableText(offered);
  const requiredKey = comparableText(required);
  if (!offeredKey || !requiredKey) return null;
  if (offeredKey === requiredKey) return 1;
  const offeredRank = rankOf(offered ?? '');
  const requiredRank = rankOf(required ?? '');
  if (offeredRank == null || requiredRank == null) return 0;
  if (offeredRank >= requiredRank) return 1;
  if (offeredRank === requiredRank - 1) return 0.5;
  return 0;
}

function workplaceScore(seeker: string | null, hire: string | null): number | null {
  const a = comparableText(seeker);
  const b = comparableText(hire);
  if (!a || !b) return null;
  if (a === b) return 1;
  const hybrid = 'hibrit';
  const flexible = new Set(['ofis', 'uzaktan']);
  if ((a === hybrid && flexible.has(b)) || (b === hybrid && flexible.has(a))) return 0.5;
  return 0;
}

function workTypeScore(seeker: string | null, hire: string | null): number | null {
  const a = comparableText(seeker);
  const b = comparableText(hire);
  if (!a || !b) return null;
  return a === b ? 1 : 0;
}

/**
 * Location scoring (Weight: 15% - NEVER a hard filter):
 * - Remote / uzaktan: 1.0 (100%)
 * - Same city + exact match: 1.0 (100%)
 * - Istanbul Anadolu ↔ Istanbul Anadolu: 1.0 (100%)
 * - Istanbul Avrupa ↔ Istanbul Avrupa: 1.0 (100%)
 * - Istanbul Anadolu ↔ Istanbul Avrupa: 0.85 (85%)
 * - Same city, different district: 0.95 (95%)
 * - Different cities (e.g. Ankara ↔ Istanbul): 0.50 (50% - NEVER 0, NEVER filtered out)
 * - Empty / not specified: returns null (dimension skipped & renormalized)
 */
export function locationScore(
  seekerCity: string | null,
  hireCity: string | null,
  seekerWorkplace?: string | null,
  hireWorkplace?: string | null,
): number | null {
  const seekerRem = normalizeMatchToken(seekerWorkplace);
  const hireRem = normalizeMatchToken(hireWorkplace);
  if (seekerRem === 'uzaktan' || hireRem === 'uzaktan' || seekerRem === 'remote' || hireRem === 'remote') {
    return 1.0;
  }

  const a = comparableText(seekerCity);
  const b = comparableText(hireCity);
  if (!a || !b) return null;

  if (a === b) return 1.0;

  const aNorm = normalizeMatchToken(a);
  const bNorm = normalizeMatchToken(b);

  const isAnatoliaA = aNorm.includes('anadolu');
  const isEuropeA = aNorm.includes('avrupa');
  const isAnatoliaB = bNorm.includes('anadolu');
  const isEuropeB = bNorm.includes('avrupa');

  const isIstanbulA = aNorm.includes('istanbul') || isAnatoliaA || isEuropeA;
  const isIstanbulB = bNorm.includes('istanbul') || isAnatoliaB || isEuropeB;

  if (isIstanbulA && isIstanbulB) {
    if ((isAnatoliaA && isAnatoliaB) || (isEuropeA && isEuropeB)) {
      return 1.0;
    }
    if ((isAnatoliaA && isEuropeB) || (isEuropeA && isAnatoliaB)) {
      return 0.85; // Istanbul Anadolu ↔ Istanbul Avrupa
    }
    return 0.95; // Same city Istanbul
  }

  for (const major of ['ankara', 'izmir', 'bursa', 'antalya', 'kocaeli', 'adana', 'gaziantep']) {
    if (aNorm.includes(major) && bNorm.includes(major)) {
      return 0.95;
    }
  }

  return 0.50; // Different cities: 50% (NOT excluded!)
}

/**
 * Salary scoring (Weight: 3% - Never hard filter):
 * - Covers expectation: 1.0
 * - Close (within 20%): 0.8
 * - Missing / not specified: returns null (skipped & renormalized)
 */
export function salaryScore(
  seekerMin: number | null | undefined,
  seekerMax: number | null | undefined,
  hireMin: number | null | undefined,
  hireMax: number | null | undefined,
): number | null {
  if (seekerMin == null && seekerMax == null && hireMin == null && hireMax == null) return null;
  const sTarget = seekerMin ?? seekerMax;
  const hOffer = hireMax ?? hireMin;
  if (sTarget == null || hOffer == null) return null;

  if (hOffer >= sTarget) return 1.0;
  const diffRatio = (sTarget - hOffer) / sTarget;
  if (diffRatio <= 0.15) return 0.8;
  if (diffRatio <= 0.30) return 0.5;
  return 0.3;
}

/**
 * Availability scoring (Weight: 2% - Never hard filter):
 * - Matching / immediate: 1.0
 * - Close: 0.8
 * - Not specified: returns null (skipped & renormalized)
 */
export function availabilityScore(seeker: string | null | undefined, hire: string | null | undefined): number | null {
  const a = comparableText(seeker);
  const b = comparableText(hire);
  if (!a || !b) return null;
  if (a === b) return 1.0;
  if (a.includes('hemen') || b.includes('hemen')) return 0.9;
  return 0.6;
}

function dimension(
  key: MatchDimensionKey,
  label: string,
  score: number | null,
  extra?: Pick<MatchDimensionResult, 'matchedCount' | 'missingCount' | 'requiredCount'>,
): MatchDimensionResult {
  return {
    key,
    label,
    weight: CAREER_MATCH_WEIGHTS[key],
    comparable: score != null,
    score,
    ...extra,
  };
}

export function scoreCareerDimensions(
  seeker: CareerMatchProfile,
  hire: CareerMatchProfile,
): MatchDimensionResult[] {
  const roleScore = tokenMatchScore(
    seeker.roles.length ? seeker.roles : seeker.role ? [seeker.role] : [],
    hire.roles.length ? hire.roles : hire.role ? [hire.role] : [],
  );
  const sectorScore = tokenMatchScore(
    seeker.sectors.length ? seeker.sectors : seeker.sector ? [seeker.sector] : [],
    hire.sectors.length ? hire.sectors : hire.sector ? [hire.sector] : [],
  );
  const professional = overlapRatio(hire.professionalSkills, seeker.professionalSkills);
  const technical = overlapRatio(hire.technicalSkills, seeker.technicalSkills);

  const workType = workTypeScore(seeker.workType, hire.workType);
  const workplace = workplaceScore(seeker.workplacePreference, hire.workplacePreference);
  const workParts = [workType, workplace].filter((value): value is number => value != null);
  const workModel = workParts.length ? workParts.reduce((sum, value) => sum + value, 0) / workParts.length : null;

  const loc = locationScore(seeker.city, hire.city, seeker.workplacePreference, hire.workplacePreference);
  const sal = salaryScore(seeker.salaryMin, seeker.salaryMax, hire.salaryMin, hire.salaryMax);
  const avail = availabilityScore(seeker.availability, hire.availability);

  return [
    dimension('role', 'Pozisyon', roleScore),
    dimension('sector', 'Sektör', sectorScore),
    dimension('professionalSkills', 'Profesyonel yetkinlikler', professional?.score ?? null, professional ?? undefined),
    dimension('technicalSkills', 'Teknik yetkinlikler', technical?.score ?? null, technical ?? undefined),
    dimension(
      'experience',
      'Deneyim seviyesi',
      rankScore(seeker.experienceLevel, hire.experienceLevel, (value) => EXPERIENCE_RANK.get(value)),
    ),
    dimension('workModel', 'Çalışma modeli', workModel),
    dimension('location', 'Lokasyon', loc),
    dimension('salary', 'Ücret beklentisi', sal),
    dimension('availability', 'İşe başlama', avail),
  ];
}
