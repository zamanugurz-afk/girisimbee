import { PARTNER_EXPERIENCE_OPTIONS } from '@/features/founders/partnership-form';
import { STARTUP_STAGES } from '@/features/listings/config/listing-field-options';
import { partnershipToken, uniquePartnershipTokens } from '@/features/partnership-matching/normalize';
import type {
  PartnershipMatchDimensionKey,
  PartnershipMatchDimensionResult,
  PartnershipMatchProfile,
} from '@/features/partnership-matching/types';

export const PARTNERSHIP_MATCH_WEIGHTS: Record<PartnershipMatchDimensionKey, number> = {
  skills: 25,
  sector: 20,
  partnershipType: 15,
  commitment: 15,
  stage: 10,
  experience: 5,
  location: 5,
  equity: 5,
};

export const PARTNERSHIP_RECOMMENDATION_THRESHOLD = 50;

const COMMITMENT_RANK: Record<string, number> = {
  'Danışmanlık': 0,
  'Yarı zamanlı': 1,
  'Tam zamanlı': 2,
};

const STAGE_RANK = new Map<string, number>(STARTUP_STAGES.map((value, index) => [value, index]));
const EXPERIENCE_RANK = new Map<string, number>(
  PARTNER_EXPERIENCE_OPTIONS.map((value, index) => [value, index]),
);

const ALL_STAGES = 'tüm aşamalar';

export function normalizePartnershipScore(weightedSum: number, usedWeight: number): number {
  if (usedWeight <= 0) return 0;
  const raw = (weightedSum / usedWeight) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function comparableText(value: string | null | undefined): string | null {
  const normalized = partnershipToken(value);
  return normalized || null;
}

function bestTokenScore(needle: string, haystack: readonly string[]): number {
  const left = partnershipToken(needle);
  if (!left) return 0;
  let best = 0;
  for (const item of haystack) {
    const right = partnershipToken(item);
    if (!right) continue;
    if (left === right) return 1;
    if (left.length >= 3 && right.length >= 3 && (left.includes(right) || right.includes(left))) {
      best = Math.max(best, 0.65);
    }
  }
  return best;
}

function symmetricSetScore(left: readonly string[], right: readonly string[]): {
  score: number;
  matchedCount: number;
  missingCount: number;
} | null {
  const a = uniquePartnershipTokens(left);
  const b = uniquePartnershipTokens(right);
  if (a.length === 0 || b.length === 0) return null;

  let leftSum = 0;
  let rightSum = 0;
  let matchedCount = 0;
  for (const item of a) {
    const itemScore = bestTokenScore(item, b);
    leftSum += itemScore;
    if (itemScore >= 0.99) matchedCount += 1;
  }
  for (const item of b) {
    rightSum += bestTokenScore(item, a);
  }

  const score = (leftSum + rightSum) / (a.length + b.length);
  return {
    score,
    matchedCount,
    missingCount: Math.max(a.length, b.length) - matchedCount,
  };
}

function rankProximity(
  left: string | null,
  right: string | null,
  rankOf: (value: string) => number | undefined,
): number | null {
  const a = comparableText(left);
  const b = comparableText(right);
  if (!a || !b) return null;
  if (a === b) return 1;
  const leftRank = rankOf(left ?? '');
  const rightRank = rankOf(right ?? '');
  if (leftRank == null || rightRank == null) return 0;
  const distance = Math.abs(leftRank - rightRank);
  if (distance === 0) return 1;
  if (distance === 1) return 0.5;
  return 0;
}

function stageScore(left: string | null, right: string | null): number | null {
  const a = comparableText(left);
  const b = comparableText(right);
  if (!a || !b) return null;
  if (a === ALL_STAGES || b === ALL_STAGES) return 1;
  return rankProximity(left, right, (value) => STAGE_RANK.get(value));
}

function locationScore(left: string | null, right: string | null): number | null {
  const a = comparableText(left);
  const b = comparableText(right);
  if (!a || !b) return null;
  if (a === b) return 1;
  if (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a))) return 0.5;
  return 0;
}

function equityScore(left: number | null, right: number | null): number | null {
  if (left == null || right == null) return null;
  const diff = Math.abs(left - right);
  if (diff <= 5) return 1;
  if (diff <= 10) return 0.6;
  if (diff <= 20) return 0.3;
  return 0;
}

export function resolvePartnershipWeights(
  left: PartnershipMatchProfile,
  right: PartnershipMatchProfile,
): Record<PartnershipMatchDimensionKey, number> {
  const typesHay = [
    ...(left.partnershipTypes ?? []),
    ...(right.partnershipTypes ?? []),
    left.title ?? '',
    right.title ?? '',
  ].join(' ').toLocaleLowerCase('tr-TR');

  // 1. Fiziksel İşletme ve Varlık Ortaklığı (Fabrika, Dükkan, Ofis, Depo, Makine, Arsa, Santral, Tesis)
  if (/fabrika|dükkan|dukkan|mağaza|magaza|ofis|depo|arsa|arazi|makine|ekipman|araç|arac|filo|santral|sera|atölye|atolye|varlık|is yeri|iş yeri|mutfak/.test(typesHay)) {
    return {
      location: 30,
      skills: 15,
      partnershipType: 20,
      sector: 15,
      stage: 10,
      commitment: 5,
      experience: 5,
      equity: 0,
    };
  }

  // 2. Uzmanlık ve Teknik Ortaklık (CTO, Yazılım, Yapay Zeka, Tasarım, Ürün, Siber Güvenlik)
  if (/cto|teknik|yazılım|yazilim|yapay zeka|ai|ml|tasarım|tasarim|devops|siber|ürün|urun|donanım|donanim/.test(typesHay)) {
    return {
      skills: 40,
      partnershipType: 15,
      sector: 15,
      commitment: 15,
      stage: 5,
      experience: 5,
      location: 5,
      equity: 0,
    };
  }

  // 3. Yatırımcı ve Finans Ortaklığı (Melek, Sermaye, Fon, VC, Pre-Seed, Yatırım)
  if (/yatırım|yatirim|melek|sermaye|fon|vc|finans|cfo/.test(typesHay)) {
    return {
      sector: 25,
      stage: 20,
      equity: 20,
      partnershipType: 15,
      skills: 10,
      commitment: 5,
      location: 5,
      experience: 0,
    };
  }

  // 4. İşletme ve Yönetim Ortaklığı (Varsayılan Genel Dağılım: Toplam = 100)
  return PARTNERSHIP_MATCH_WEIGHTS;
}

export function scorePartnershipDimensions(
  left: PartnershipMatchProfile,
  right: PartnershipMatchProfile,
): PartnershipMatchDimensionResult[] {
  const weights = resolvePartnershipWeights(left, right);
  const skills = symmetricSetScore(left.skills, right.skills);
  const sectors = symmetricSetScore(left.sectors, right.sectors);
  const types = symmetricSetScore(left.partnershipTypes, right.partnershipTypes);
  const commitment = rankProximity(left.commitment, right.commitment, (value) => COMMITMENT_RANK[value]);
  const stage = stageScore(left.stage, right.stage);
  const experience = rankProximity(left.experience, right.experience, (value) => EXPERIENCE_RANK.get(value));
  const location = locationScore(left.location, right.location);
  const equity = equityScore(left.equity, right.equity);

  return [
    {
      key: 'skills',
      label: 'Uzmanlık',
      weight: weights.skills,
      comparable: skills != null,
      score: skills?.score ?? null,
      ...(skills ?? {}),
    },
    {
      key: 'sector',
      label: 'Sektör',
      weight: weights.sector,
      comparable: sectors != null,
      score: sectors?.score ?? null,
      ...(sectors ?? {}),
    },
    {
      key: 'partnershipType',
      label: 'Ortaklık tipi',
      weight: weights.partnershipType,
      comparable: types != null,
      score: types?.score ?? null,
      ...(types ?? {}),
    },
    {
      key: 'commitment',
      label: 'Taahhüt',
      weight: weights.commitment,
      comparable: commitment != null,
      score: commitment,
    },
    {
      key: 'stage',
      label: 'Girişim aşaması',
      weight: weights.stage,
      comparable: stage != null,
      score: stage,
    },
    {
      key: 'experience',
      label: 'Deneyim',
      weight: weights.experience,
      comparable: experience != null,
      score: experience,
    },
    {
      key: 'location',
      label: 'Lokasyon',
      weight: weights.location,
      comparable: location != null,
      score: location,
    },
    {
      key: 'equity',
      label: 'Hisse',
      weight: weights.equity,
      comparable: equity != null,
      score: equity,
    },
  ];
}
