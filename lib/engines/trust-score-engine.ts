import {
  TRUST_BOX_KEYWORDS,
  TRUST_INVOICE_KEYWORDS,
  TRUST_SCAM_REJECTION_RULES,
  TRUST_SUSPICIOUS_PHRASES,
  TRUST_WARRANTY_KEYWORDS,
} from '@/config/trust-score-dictionaries';
import type { ListingResponse, SellerDTO, TrustScoreLabel, TrustScoreResult } from '@/types';

export const TRUST_LABEL_DISPLAY: Record<TrustScoreLabel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  risky: 'Risky',
};

/** Weighted positive signal contributions (sum = 1). Price is intentionally excluded. */
const SIGNAL_WEIGHTS = {
  sellerRating: 0.2,
  sellerSales: 0.13,
  sellerAge: 0.11,
  photoCount: 0.16,
  descriptionLength: 0.16,
  invoiceMention: 0.08,
  warrantyMention: 0.08,
  boxMention: 0.08,
} as const;

const PENALTY_WEIGHTS = {
  allCapsTitle: 14,
  tooManyEmojis: 10,
  suspiciousPhrase: 7,
} as const;

const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

export type TrustScoreListingInput = Pick<
  ListingResponse,
  'title' | 'description' | 'image_urls' | 'seller'
>;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, ' ');
}

function containsPhrase(text: string, phrase: string): boolean {
  return text.includes(phrase.toLocaleLowerCase('tr-TR'));
}

function containsKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => containsPhrase(text, keyword));
}

function scoreSellerRating(seller: SellerDTO | null | undefined): number {
  if (!seller || seller.rating <= 0) return 35;
  return clamp((seller.rating / 5) * 100);
}

function scoreSellerSales(seller: SellerDTO | null | undefined): number {
  if (!seller) return 30;
  const count = seller.listing_count ?? 0;
  if (count >= 100) return 100;
  if (count >= 50) return 85;
  if (count >= 20) return 70;
  if (count >= 10) return 55;
  if (count >= 5) return 40;
  return 25;
}

function scoreSellerAge(seller: SellerDTO | null | undefined): number {
  if (!seller?.member_since) return 35;
  const years = new Date().getFullYear() - seller.member_since;
  if (years >= 6) return 100;
  if (years >= 4) return 85;
  if (years >= 2) return 65;
  if (years >= 1) return 45;
  return 30;
}

function scorePhotoCount(imageUrls: string[] | null | undefined): number {
  const count = imageUrls?.length ?? 0;
  if (count >= 8) return 100;
  if (count >= 5) return 85;
  if (count >= 3) return 70;
  if (count >= 1) return 45;
  return 10;
}

function scoreDescriptionLength(description: string | null | undefined): number {
  const length = description?.trim().length ?? 0;
  if (length >= 200) return 100;
  if (length >= 120) return 80;
  if (length >= 80) return 65;
  if (length >= 40) return 45;
  if (length > 0) return 25;
  return 5;
}

function isAllCapsTitle(title: string): boolean {
  const letters = title.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '');
  if (letters.length < 8) return false;
  return letters === letters.toLocaleUpperCase('tr-TR');
}

function countEmojis(text: string): number {
  return text.match(EMOJI_PATTERN)?.length ?? 0;
}

function hasTooManyEmojis(text: string): boolean {
  const emojiCount = countEmojis(text);
  if (emojiCount >= 6) return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  return emojiCount / trimmed.length > 0.12;
}

function detectScamRejection(combinedText: string): string[] {
  const reasons: string[] = [];

  for (const rule of TRUST_SCAM_REJECTION_RULES) {
    if (rule.requires.every((phrase) => containsPhrase(combinedText, phrase))) {
      reasons.push(rule.reason);
    }
  }

  const suspiciousHits = TRUST_SUSPICIOUS_PHRASES.filter((phrase) =>
    containsPhrase(combinedText, phrase),
  );

  if (suspiciousHits.length >= 4) {
    reasons.push('Multiple suspicious payment or urgency phrases detected.');
  }

  return reasons;
}

function resolveTrustLabel(score: number, rejected: boolean): TrustScoreLabel {
  if (rejected || score < 35) return 'risky';
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'poor';
}

function buildPositiveReasons(input: {
  seller: SellerDTO | null | undefined;
  imageCount: number;
  descriptionLength: number;
  combinedText: string;
}): string[] {
  const reasons: string[] = [];

  if (containsKeyword(input.combinedText, TRUST_INVOICE_KEYWORDS)) {
    reasons.push('✔ Invoice available');
  }
  if (containsKeyword(input.combinedText, TRUST_WARRANTY_KEYWORDS)) {
    reasons.push('✔ Warranty mentioned');
  }
  if (containsKeyword(input.combinedText, TRUST_BOX_KEYWORDS)) {
    reasons.push('✔ Original box mentioned');
  }
  if (input.descriptionLength >= 200) {
    reasons.push('✔ Detailed description');
  } else if (input.descriptionLength >= 80) {
    reasons.push('✔ Reasonable description');
  }
  if (input.imageCount >= 8) {
    reasons.push(`✔ ${input.imageCount} photos`);
  } else if (input.imageCount >= 3) {
    reasons.push(`✔ ${input.imageCount} photos`);
  }
  if (input.seller && input.seller.rating >= 4.5) {
    reasons.push('✔ Seller rating high');
  } else if (input.seller && input.seller.rating >= 4) {
    reasons.push('✔ Seller rating good');
  }
  if (input.seller?.member_since) {
    const years = new Date().getFullYear() - input.seller.member_since;
    if (years >= 3) {
      reasons.push('✔ Established seller account');
    }
  }
  if (input.seller && input.seller.listing_count >= 20) {
    reasons.push('✔ Experienced seller');
  }

  return reasons;
}

function buildNegativeReasons(input: {
  title: string;
  combinedText: string;
  scamReasons: string[];
}): string[] {
  const reasons: string[] = [...input.scamReasons.map((reason) => `✘ ${reason}`)];

  if (isAllCapsTitle(input.title)) {
    reasons.push('✘ ALL CAPS title');
  }
  if (hasTooManyEmojis(input.combinedText)) {
    reasons.push('✘ Too many emojis');
  }

  for (const phrase of TRUST_SUSPICIOUS_PHRASES) {
    if (containsPhrase(input.combinedText, phrase)) {
      reasons.push(`✘ Suspicious phrase: ${phrase.trim()}`);
    }
  }

  return reasons;
}

/** Calculate listing trust without using price signals. */
export function calculateTrustScore(listing: TrustScoreListingInput): TrustScoreResult {
  const title = listing.title ?? '';
  const description = listing.description ?? '';
  const combinedText = normalizeText(`${title}\n${description}`);
  const imageCount = listing.image_urls?.length ?? 0;
  const descriptionLength = description.trim().length;
  const seller = listing.seller ?? null;

  const scamReasons = detectScamRejection(combinedText);
  const rejected = scamReasons.length > 0;

  const weightedScore =
    scoreSellerRating(seller) * SIGNAL_WEIGHTS.sellerRating +
    scoreSellerSales(seller) * SIGNAL_WEIGHTS.sellerSales +
    scoreSellerAge(seller) * SIGNAL_WEIGHTS.sellerAge +
    scorePhotoCount(listing.image_urls) * SIGNAL_WEIGHTS.photoCount +
    scoreDescriptionLength(description) * SIGNAL_WEIGHTS.descriptionLength +
    (containsKeyword(combinedText, TRUST_INVOICE_KEYWORDS) ? 100 : 20) *
      SIGNAL_WEIGHTS.invoiceMention +
    (containsKeyword(combinedText, TRUST_WARRANTY_KEYWORDS) ? 100 : 20) *
      SIGNAL_WEIGHTS.warrantyMention +
    (containsKeyword(combinedText, TRUST_BOX_KEYWORDS) ? 100 : 20) * SIGNAL_WEIGHTS.boxMention;

  let penalty = 0;
  if (isAllCapsTitle(title)) penalty += PENALTY_WEIGHTS.allCapsTitle;
  if (hasTooManyEmojis(combinedText)) penalty += PENALTY_WEIGHTS.tooManyEmojis;

  const suspiciousHits = TRUST_SUSPICIOUS_PHRASES.filter((phrase) =>
    containsPhrase(combinedText, phrase),
  ).length;
  penalty += Math.min(28, suspiciousHits * PENALTY_WEIGHTS.suspiciousPhrase);

  let score = clamp(Math.round(weightedScore - penalty));
  if (rejected) {
    score = Math.min(score, 20);
  }

  const label = resolveTrustLabel(score, rejected);
  const positiveReasons = buildPositiveReasons({
    seller,
    imageCount,
    descriptionLength,
    combinedText,
  });
  const negativeReasons = buildNegativeReasons({ title, combinedText, scamReasons });

  const reasons = rejected
    ? [...negativeReasons, ...positiveReasons.slice(0, 2)]
    : [...positiveReasons, ...negativeReasons];

  return {
    score,
    label,
    trust_score: score,
    trust_label: label,
    label_display: TRUST_LABEL_DISPLAY[label],
    reasons,
    rejected,
  };
}

export class TrustScoreEngine {
  calculate(listing: TrustScoreListingInput): TrustScoreResult {
    return calculateTrustScore(listing);
  }
}

export const trustScoreEngine = new TrustScoreEngine();
