import { MATCH_RECOMMENDATION_THRESHOLD } from '@/features/matching-engine/scoring';
import type { MatchBand, MatchDimensionResult, MatchExplanation } from '@/features/matching-engine/types';

export const MATCH_BAND_LABELS: Record<MatchBand, string> = {
  very_strong: 'Çok güçlü eşleşme',
  strong: 'Güçlü eşleşme',
  suitable: 'Uygun eşleşme',
  below_threshold: 'Önerilmez',
};

export function getMatchBand(score: number): MatchBand {
  if (score >= 80) return 'very_strong';
  if (score >= 65) return 'strong';
  if (score >= MATCH_RECOMMENDATION_THRESHOLD) return 'suitable';
  return 'below_threshold';
}

export function isRecommendableMatch(score: number): boolean {
  return score >= MATCH_RECOMMENDATION_THRESHOLD;
}

export function getMatchReasons(dimensions: readonly MatchDimensionResult[]): MatchExplanation[] {
  const reasons: MatchExplanation[] = [];

  for (const dimension of dimensions) {
    if (!dimension.comparable || dimension.score == null) continue;

    switch (dimension.key) {
      case 'role':
        if (dimension.score >= 0.99) {
          reasons.push({ kind: 'match', text: 'Pozisyonunuzla güçlü uyum' });
        } else if (dimension.score >= 0.5) {
          reasons.push({ kind: 'match', text: 'Pozisyon gereksinimleri yakın' });
        }
        break;

      case 'sector':
        if (dimension.score >= 0.99) {
          reasons.push({ kind: 'match', text: 'Sektör deneyiminiz uyumlu' });
        } else if (dimension.score >= 0.5) {
          reasons.push({ kind: 'match', text: 'Sektör odağı yakın' });
        }
        break;

      case 'professionalSkills':
      case 'technicalSkills':
        if (dimension.score >= 0.75) {
          reasons.push({ kind: 'match', text: 'Yetkinlikleriniz ilanla örtüşüyor' });
        } else if (dimension.score >= 0.4) {
          reasons.push({ kind: 'match', text: 'Temel yetkinlikler uyumlu' });
        }
        break;

      case 'experience':
        if (dimension.score >= 0.99) {
          reasons.push({ kind: 'match', text: 'Deneyim seviyeniz beklentiyi karşılıyor' });
        } else if (dimension.score >= 0.5) {
          reasons.push({ kind: 'match', text: 'Deneyim seviyesi yakın' });
        }
        break;

      case 'workModel':
        if (dimension.score >= 0.99) {
          reasons.push({ kind: 'match', text: 'Çalışma şekli ve modeli uyumlu' });
        } else if (dimension.score >= 0.5) {
          reasons.push({ kind: 'match', text: 'Çalışma modeli esnek' });
        }
        break;

      case 'location':
        if (dimension.score >= 0.99) {
          reasons.push({ kind: 'match', text: 'Lokasyon tam uyumlu' });
        } else if (dimension.score >= 0.84 && dimension.score <= 0.86) {
          reasons.push({ kind: 'gap', text: 'İstanbul Anadolu ↔ İstanbul Avrupa — küçük lokasyon farkı' });
        } else if (dimension.score >= 0.9) {
          reasons.push({ kind: 'match', text: 'Aynı şehirde lokasyon uyumu' });
        } else if (dimension.score >= 0.45) {
          reasons.push({ kind: 'gap', text: 'Farklı şehir lokasyon tercihi' });
        }
        break;

      case 'salary':
        if (dimension.score >= 0.75) {
          reasons.push({ kind: 'match', text: 'Ücret beklentiniz uygun' });
        }
        break;

      case 'availability':
        if (dimension.score >= 0.75) {
          reasons.push({ kind: 'match', text: 'İşe başlama zamanı uygun' });
        }
        break;

      default:
        break;
    }
  }

  // Deduplicate by text
  const seen = new Set<string>();
  const uniqueReasons: MatchExplanation[] = [];
  for (const r of reasons) {
    if (!seen.has(r.text)) {
      seen.add(r.text);
      uniqueReasons.push(r);
    }
  }

  return uniqueReasons;
}

/** UI shows 3–5 short informative reasons: matches first, then informative gaps. */
export function selectDisplayReasons(
  reasons: readonly MatchExplanation[],
  min = 3,
  max = 5,
): MatchExplanation[] {
  const matches = reasons.filter((reason) => reason.kind === 'match');
  const gaps = reasons.filter((reason) => reason.kind === 'gap');
  const selected = [...matches.slice(0, 4), ...gaps.slice(0, 2)];

  if (selected.length < min) {
    for (const reason of reasons) {
      if (selected.length >= min) break;
      if (!selected.some((s) => s.text === reason.text)) {
        selected.push(reason);
      }
    }
  }

  return selected.slice(0, max);
}
