import { PARTNERSHIP_RECOMMENDATION_THRESHOLD } from '@/features/partnership-matching/scoring';
import type {
  PartnershipMatchBand,
  PartnershipMatchDimensionResult,
  PartnershipMatchExplanation,
} from '@/features/partnership-matching/types';

export const PARTNERSHIP_MATCH_BAND_LABELS: Record<PartnershipMatchBand, string> = {
  very_strong: 'Çok güçlü ortaklık eşleşmesi',
  strong: 'Güçlü ortaklık eşleşmesi',
  suitable: 'Uygun ortaklık eşleşmesi',
  below_threshold: 'Önerilmez',
};

export function getPartnershipMatchBand(score: number): PartnershipMatchBand {
  if (score >= 80) return 'very_strong';
  if (score >= 65) return 'strong';
  if (score >= PARTNERSHIP_RECOMMENDATION_THRESHOLD) return 'suitable';
  return 'below_threshold';
}

export function isRecommendablePartnershipMatch(score: number): boolean {
  return score >= PARTNERSHIP_RECOMMENDATION_THRESHOLD;
}

function simpleReason(
  dimension: PartnershipMatchDimensionResult,
  matchText: string,
  gapText: string,
  partialText: string,
): PartnershipMatchExplanation | null {
  if (!dimension.comparable || dimension.score == null) return null;
  if (dimension.score >= 0.99) return { kind: 'match', text: matchText };
  if (dimension.score >= 0.4) return { kind: 'gap', text: partialText };
  return { kind: 'gap', text: gapText };
}

function skillReason(dimension: PartnershipMatchDimensionResult): PartnershipMatchExplanation | null {
  if (!dimension.comparable || dimension.score == null) return null;
  if (dimension.score >= 0.99) return { kind: 'match', text: 'Uzmanlık ihtiyacı karşılanıyor' };
  if (dimension.score >= 0.4) return { kind: 'gap', text: 'Bazı yetkinlikler eksik' };
  return { kind: 'gap', text: 'Aranan uzmanlıklar örtüşmüyor' };
}

export function getPartnershipMatchReasons(
  dimensions: readonly PartnershipMatchDimensionResult[],
): PartnershipMatchExplanation[] {
  const reasons: PartnershipMatchExplanation[] = [];

  for (const dimension of dimensions) {
    switch (dimension.key) {
      case 'skills': {
        const reason = skillReason(dimension);
        if (reason) reasons.push(reason);
        break;
      }
      case 'sector':
        reasons.push(
          ...[simpleReason(dimension, 'Sektör tercihi uyumlu', 'Sektör tercihi farklı', 'Sektör tercihi kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      case 'partnershipType':
        reasons.push(
          ...[simpleReason(dimension, 'Ortaklık tipi uyumlu', 'Ortaklık tipi farklı', 'Ortaklık tipi kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      case 'commitment':
        reasons.push(
          ...[simpleReason(
            dimension,
            'Taahhüt beklentisi uyumlu',
            'Taahhüt beklentisi farklı',
            'Taahhüt beklentisi kısmen uyumlu',
          )].filter(Boolean) as PartnershipMatchExplanation[],
        );
        break;
      case 'stage':
        reasons.push(
          ...[simpleReason(dimension, 'Girişim aşaması uyumlu', 'Girişim aşaması farklı', 'Girişim aşaması kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      case 'experience':
        reasons.push(
          ...[simpleReason(dimension, 'Deneyim uyumlu', 'Deneyim farklı', 'Deneyim kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      case 'location':
        reasons.push(
          ...[simpleReason(dimension, 'Lokasyon tercihi uyumlu', 'Lokasyon tercihi farklı', 'Lokasyon tercihi kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      case 'equity':
        reasons.push(
          ...[simpleReason(dimension, 'Hisse beklentisi uyumlu', 'Hisse beklentisi farklı', 'Hisse beklentisi kısmen uyumlu')].filter(
            Boolean,
          ) as PartnershipMatchExplanation[],
        );
        break;
      default:
        break;
    }
  }

  return reasons;
}

export function selectPartnershipDisplayReasons(
  reasons: readonly PartnershipMatchExplanation[],
  min = 3,
  max = 5,
): PartnershipMatchExplanation[] {
  const unique: PartnershipMatchExplanation[] = [];
  const seen = new Set<string>();
  for (const reason of reasons) {
    const key = `${reason.kind}:${reason.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(reason);
  }

  const matches = unique.filter((reason) => reason.kind === 'match');
  const gaps = unique.filter((reason) => reason.kind === 'gap');
  const selected = [...matches.slice(0, 4), ...gaps.slice(0, 2)];
  if (selected.length < min) {
    for (const reason of unique) {
      if (selected.length >= min) break;
      if (!selected.some((item) => item.kind === reason.kind && item.text === reason.text)) {
        selected.push(reason);
      }
    }
  }
  return selected.slice(0, max);
}
