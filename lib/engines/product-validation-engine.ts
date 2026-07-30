import {
  VALIDATION_BUNDLE_COMPONENT_TYPES,
  VALIDATION_BUNDLE_SEPARATORS,
  VALIDATION_MARKETPLACE_CATEGORY_HINTS,
  VALIDATION_SCORE_KEYS,
  VALIDATION_TYPE_DICTIONARIES,
  type ValidationScoreKey,
} from '@/config/product-validation-dictionaries';
import type {
  PrimaryProductType,
  PrimaryProductValidationResult,
  PrimaryProductValidationScores,
} from '@/types';

export interface PrimaryProductValidationInput {
  title: string;
  description?: string | null;
  marketplace_category?: string | null;
  marketplace_subcategory?: string | null;
}

const ACCEPTED_PRIMARY_TYPES: PrimaryProductType[] = ['CONSOLE'];

const SCORE_KEY_TO_PRIMARY: Record<Exclude<ValidationScoreKey, 'bundle'>, PrimaryProductType> = {
  console: 'CONSOLE',
  game: 'GAME',
  controller: 'CONTROLLER',
  accessory: 'ACCESSORY',
  account: 'ACCOUNT',
  digital_code: 'DIGITAL_CODE',
  subscription: 'SUBSCRIPTION',
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeValidationText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s+\-/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsTerm(normalized: string, term: string): boolean {
  const token = normalizeValidationText(term);
  if (!token) return false;
  if (token.includes(' ')) {
    return normalized.includes(token);
  }
  const re = new RegExp(`(?:^|[\\s+\\-/,(])${token}(?:$|[\\s+\\-/,)])`, 'i');
  return re.test(normalized) || normalized === token;
}

function scoreDictionary(
  normalized: string,
  multiplier: number,
  dictionary: readonly { term: string; weight: number }[],
): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  for (const entry of dictionary) {
    if (containsTerm(normalized, entry.term)) {
      score += entry.weight * multiplier;
      matches.push(entry.term);
    }
  }

  return { score, matches };
}

function scoreMarketplaceHints(
  normalizedCategory: string,
  normalizedSubcategory: string,
): Partial<Record<Exclude<ValidationScoreKey, 'bundle'>, number>> {
  const boosts: Partial<Record<Exclude<ValidationScoreKey, 'bundle'>, number>> = {};
  const combined = `${normalizedCategory} ${normalizedSubcategory}`.trim();
  if (!combined) return boosts;

  for (const [type, hints] of Object.entries(VALIDATION_MARKETPLACE_CATEGORY_HINTS) as Array<
    [Exclude<ValidationScoreKey, 'bundle'>, readonly string[]]
  >) {
    const hits = hints.filter((hint) => containsTerm(combined, hint));
    if (hits.length > 0) {
      boosts[type] = Math.min(24, hits.length * 10);
    }
  }

  return boosts;
}

function emptyScores(): PrimaryProductValidationScores {
  return {
    console: 0,
    game: 0,
    controller: 0,
    accessory: 0,
    account: 0,
    digital_code: 0,
    subscription: 0,
    bundle: 0,
  };
}

function hasStrongAccountSignal(scores: PrimaryProductValidationScores, normalized: string): boolean {
  return (
    scores.account >= 24 &&
    (containsTerm(normalized, 'hesap') ||
      containsTerm(normalized, 'hesabi') ||
      containsTerm(normalized, 'account'))
  );
}

function detectBundle(
  scores: PrimaryProductValidationScores,
  normalizedTitle: string,
  normalizedDescription: string,
): boolean {
  const combined = `${normalizedTitle} ${normalizedDescription}`;

  if (hasStrongAccountSignal(scores, combined)) {
    return false;
  }

  const hasConsole = scores.console >= 18;
  if (!hasConsole) return false;

  const componentScores = VALIDATION_BUNDLE_COMPONENT_TYPES.map((type) => ({
    type,
    score: scores[type],
  })).sort((a, b) => b.score - a.score);

  const strongestComponent = componentScores[0];
  if (!strongestComponent || strongestComponent.score < 14) {
    return false;
  }

  const hasSeparator = VALIDATION_BUNDLE_SEPARATORS.test(combined);
  if (hasSeparator) {
    return true;
  }

  // Platform tags on game/subscription listings (e.g. "FC26 PS5") are not bundles.
  if (strongestComponent.score >= scores.console) {
    return false;
  }

  if (scores.console - strongestComponent.score <= 10) {
    return false;
  }

  return scores.console >= 24 && strongestComponent.score >= 20;
}

function computeConfidence(
  primaryScore: number,
  secondScore: number,
  titleMatchStrength: number,
): number {
  const margin = Math.max(0, primaryScore - secondScore);

  if (margin >= 18 && titleMatchStrength >= 18) {
    return clamp(Math.round(72 + margin * 0.9 + titleMatchStrength * 0.45), 0, 99);
  }

  let confidence = primaryScore * 0.72 + margin * 0.65 + titleMatchStrength * 0.18;
  if (margin >= 24) confidence += 8;
  if (primaryScore >= 40) confidence += 6;

  return clamp(Math.round(confidence), 0, 99);
}

function resolvePrimaryType(
  scores: PrimaryProductValidationScores,
  bundleDetected: boolean,
): PrimaryProductType {
  if (bundleDetected) return 'BUNDLE';

  const candidates = VALIDATION_SCORE_KEYS.filter((key) => key !== 'bundle') as Array<
    Exclude<ValidationScoreKey, 'bundle'>
  >;

  const ranked = candidates
    .map((key) => ({ key, score: scores[key] }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0];
  if (!winner || winner.score < 12) return 'UNKNOWN';

  return SCORE_KEY_TO_PRIMARY[winner.key];
}

function buildReasons(
  primaryType: PrimaryProductType,
  matchesByType: Partial<Record<Exclude<ValidationScoreKey, 'bundle'>, string[]>>,
  marketplaceCategory?: string | null,
  marketplaceSubcategory?: string | null,
): string[] {
  const reasons: string[] = [];

  for (const [type, matches] of Object.entries(matchesByType) as Array<
    [Exclude<ValidationScoreKey, 'bundle'>, string[]]
  >) {
    if (matches.length === 0) continue;
    reasons.push(`${type} keywords matched: ${matches.slice(0, 4).join(', ')}`);
  }

  if (marketplaceCategory?.trim()) {
    reasons.push(`Marketplace category considered: ${marketplaceCategory.trim()}`);
  }
  if (marketplaceSubcategory?.trim()) {
    reasons.push(`Marketplace subcategory considered: ${marketplaceSubcategory.trim()}`);
  }

  reasons.push(`Resolved primary product type: ${primaryType}`);
  return reasons;
}

function buildRejectReason(primaryType: PrimaryProductType): string {
  if (primaryType === 'UNKNOWN') {
    return 'Listing primary product type is UNKNOWN';
  }
  return `Listing is a ${primaryType}`;
}

/** Determine the primary product being sold and whether the listing may be indexed. */
export function validatePrimaryProduct(
  input: PrimaryProductValidationInput,
): PrimaryProductValidationResult {
  const title = input.title ?? '';
  const description = input.description ?? '';
  const marketplaceCategory = input.marketplace_category ?? '';
  const marketplaceSubcategory = input.marketplace_subcategory ?? '';

  const normalizedTitle = normalizeValidationText(title);
  const normalizedDescription = normalizeValidationText(description);
  const normalizedCategory = normalizeValidationText(marketplaceCategory);
  const normalizedSubcategory = normalizeValidationText(marketplaceSubcategory);

  const scores = emptyScores();
  const matchesByType: Partial<Record<Exclude<ValidationScoreKey, 'bundle'>, string[]>> = {};
  const titleMatchStrengthByType: Partial<Record<Exclude<ValidationScoreKey, 'bundle'>, number>> =
    {};

  for (const type of VALIDATION_SCORE_KEYS) {
    if (type === 'bundle') continue;

    const titleMatch = scoreDictionary(normalizedTitle, 1, VALIDATION_TYPE_DICTIONARIES[type]);
    const descriptionMatch = scoreDictionary(
      normalizedDescription,
      0.45,
      VALIDATION_TYPE_DICTIONARIES[type],
    );
    const categoryBoost = scoreMarketplaceHints(normalizedCategory, normalizedSubcategory)[type] ?? 0;

    const combined = titleMatch.score + descriptionMatch.score + categoryBoost;
    scores[type] = clamp(Math.round(combined), 0, 100);
    matchesByType[type] = [...new Set([...titleMatch.matches, ...descriptionMatch.matches])];
    titleMatchStrengthByType[type] = titleMatch.score;
  }

  const bundleDetected = detectBundle(scores, normalizedTitle, normalizedDescription);
  if (bundleDetected) {
    const componentScores = VALIDATION_BUNDLE_COMPONENT_TYPES.map((type) => scores[type]);
    const strongestComponent = Math.max(...componentScores, 0);
    scores.bundle = clamp(Math.round(scores.console * 0.55 + strongestComponent * 0.55 + 20), 0, 100);
  }

  const primaryType = resolvePrimaryType(scores, bundleDetected);
  const rankedScores = VALIDATION_SCORE_KEYS.map((key) => scores[key]).sort((a, b) => b - a);
  const primaryScore = primaryType === 'BUNDLE' ? scores.bundle : scores[resolveScoreKey(primaryType)];
  const secondScore = rankedScores.find((score) => score < primaryScore) ?? 0;
  const titleStrength =
    primaryType === 'BUNDLE'
      ? scores.console
      : titleMatchStrengthByType[resolveScoreKey(primaryType)] ?? 0;

  const confidence = (() => {
    const base = computeConfidence(primaryScore, secondScore, titleStrength);

    if (bundleDetected && VALIDATION_BUNDLE_SEPARATORS.test(normalizedTitle)) {
      return Math.max(base, 95);
    }

    if (primaryType === 'GAME' && scores.game >= scores.console) {
      return Math.max(base, clamp(Math.round(88 + titleStrength * 0.25), 0, 99));
    }

    return base;
  })();
  const accepted = ACCEPTED_PRIMARY_TYPES.includes(primaryType);
  const reject_reason = accepted ? '' : buildRejectReason(primaryType);

  return {
    primary_type: primaryType,
    confidence,
    scores,
    reasons: buildReasons(
      primaryType,
      matchesByType,
      marketplaceCategory,
      marketplaceSubcategory,
    ),
    accepted,
    reject_reason,
  };
}

function resolveScoreKey(primaryType: PrimaryProductType): Exclude<ValidationScoreKey, 'bundle'> {
  switch (primaryType) {
    case 'CONSOLE':
      return 'console';
    case 'GAME':
      return 'game';
    case 'CONTROLLER':
      return 'controller';
    case 'ACCESSORY':
      return 'accessory';
    case 'ACCOUNT':
      return 'account';
    case 'DIGITAL_CODE':
      return 'digital_code';
    case 'SUBSCRIPTION':
      return 'subscription';
    case 'BUNDLE':
    case 'UNKNOWN':
    default:
      return 'console';
  }
}

export class ProductValidationEngine {
  validate(input: PrimaryProductValidationInput): PrimaryProductValidationResult {
    return validatePrimaryProduct(input);
  }
}

export const productValidationEngine = new ProductValidationEngine();
