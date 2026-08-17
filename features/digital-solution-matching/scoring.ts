import type {
  DigitalSolutionConsumerProfile,
  DigitalSolutionDimensionResult,
  DigitalSolutionMatchBand,
  DigitalSolutionMatchDimensionKey,
  DigitalSolutionProfile,
} from '@/features/digital-solution-matching/types';

export const DIGITAL_SOLUTION_MATCH_WEIGHTS: Record<DigitalSolutionMatchDimensionKey, number> = {
  sector: 25,
  targetAudience: 20,
  capabilities: 20,
  solutionType: 15,
  deliveryModel: 10,
  location: 5,
  priceRange: 3,
  language: 2,
};

export const DIGITAL_SOLUTION_DIMENSION_LABELS: Record<DigitalSolutionMatchDimensionKey, string> = {
  sector: 'Sektör Uyumu',
  targetAudience: 'Hedef Kitle & Ölçek',
  capabilities: 'Yetenek & Özellikler',
  solutionType: 'Çözüm Türü',
  deliveryModel: 'Teslim Modeli',
  location: 'Lokasyon Uyumu',
  priceRange: 'Fiyat & Bütçe',
  language: 'Dil Desteği',
};

function normalizeString(value: unknown): string {
  if (!value) return '';
  const str =
    typeof value === 'string'
      ? value
      : typeof value === 'object' && value !== null && 'city' in value
        ? String((value as { city?: unknown }).city || '')
        : String(value);
  return str
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function scoreSector(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  const consumerSector = normalizeString(consumer.industry);
  const solutionSector = normalizeString(solution.industry);

  if (!consumerSector || !solutionSector) return null;

  if (consumerSector === solutionSector || consumerSector.includes(solutionSector) || solutionSector.includes(consumerSector)) {
    return 1.0;
  }
  return 0.0;
}

export function scoreTargetAudience(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  if (!consumer.targetAudienceHints || consumer.targetAudienceHints.length === 0 || !solution.targetAudience) {
    return null;
  }

  const solAudience = normalizeString(solution.targetAudience);
  const matched = consumer.targetAudienceHints.some(
    (hint) => normalizeString(hint) === solAudience || solAudience.includes(normalizeString(hint)),
  );

  return matched ? 1.0 : 0.4;
}

export function scoreCapabilities(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): { score: number | null; matchedCount?: number; missingCount?: number } {
  if (!consumer.neededCapabilities || consumer.neededCapabilities.length === 0 || !solution.capabilities || solution.capabilities.length === 0) {
    return { score: null };
  }

  const solutionCaps = solution.capabilities.map(normalizeString);
  let matchedCount = 0;

  for (const needed of consumer.neededCapabilities) {
    const norm = normalizeString(needed);
    if (solutionCaps.some((c) => c.includes(norm) || norm.includes(c))) {
      matchedCount++;
    }
  }

  const total = consumer.neededCapabilities.length;
  const ratio = matchedCount / total;
  return {
    score: Math.min(1.0, Math.max(0.0, ratio)),
    matchedCount,
    missingCount: total - matchedCount,
  };
}

export function scoreSolutionType(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  if (!consumer.preferredSolutionTypes || consumer.preferredSolutionTypes.length === 0 || !solution.solutionType) {
    return null;
  }

  const solType = normalizeString(solution.solutionType);
  const match = consumer.preferredSolutionTypes.some(
    (pref) => normalizeString(pref) === solType || solType.includes(normalizeString(pref)),
  );

  return match ? 1.0 : 0.3;
}

export function scoreDeliveryModel(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  if (!consumer.preferredDeliveryModels || consumer.preferredDeliveryModels.length === 0 || !solution.deliveryModel) {
    return null;
  }

  const solModel = normalizeString(solution.deliveryModel);
  const match = consumer.preferredDeliveryModels.some(
    (pref) => normalizeString(pref) === solModel || solModel.includes(normalizeString(pref)),
  );

  return match ? 1.0 : 0.4;
}

export function scoreLocation(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  const cCity = normalizeString(consumer.city);
  const sCity = normalizeString(solution.city);

  // If solution or consumer is marked remote/online
  const sLoc = normalizeString(solution.location);
  const cLoc = normalizeString(consumer.location);
  if (sLoc.includes('remote') || sLoc.includes('online') || cLoc.includes('remote') || cLoc.includes('online')) {
    return 1.0;
  }

  if (!cCity || !sCity) return null;

  const isIstanbulAnatolia = (c: string) => c.includes('anadolu') || c.includes('kadikoy') || c.includes('uskudar') || c.includes('atasehir') || c.includes('umraniye') || c.includes('maltepe') || c.includes('kartal') || c.includes('pendik');
  const isIstanbulEurope = (c: string) => c.includes('avrupa') || c.includes('besiktas') || c.includes('sisli') || c.includes('levent') || c.includes('maslak') || c.includes('bakirkoy') || c.includes('beyoglu') || c.includes('fatih');

  if (cCity === sCity) return 1.0;

  if (
    (cCity.includes('istanbul') || isIstanbulAnatolia(cCity) || isIstanbulEurope(cCity)) &&
    (sCity.includes('istanbul') || isIstanbulAnatolia(sCity) || isIstanbulEurope(sCity))
  ) {
    const cSide = isIstanbulAnatolia(cCity) ? 'anadolu' : isIstanbulEurope(cCity) ? 'avrupa' : 'both';
    const sSide = isIstanbulAnatolia(sCity) ? 'anadolu' : isIstanbulEurope(sCity) ? 'avrupa' : 'both';
    if (cSide !== 'both' && sSide !== 'both' && cSide !== sSide) {
      return 0.85;
    }
    return 1.0;
  }

  // Different city: Never 0, always 0.50 (Never hard filter)
  return 0.50;
}

export function scorePriceRange(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  if (!consumer.priceBudget || !solution.priceRange) return null;

  const cPrice = normalizeString(consumer.priceBudget);
  const sPrice = normalizeString(solution.priceRange);

  if (cPrice === sPrice) return 1.0;
  if (sPrice.includes('teklif') || cPrice.includes('teklif')) return 0.85;
  return 0.50;
}

export function scoreLanguage(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): number | null {
  if (!consumer.languages || consumer.languages.length === 0 || !solution.supportedLanguages || solution.supportedLanguages.length === 0) {
    return null;
  }

  const sLangs = solution.supportedLanguages.map(normalizeString);
  const hasCommon = consumer.languages.some((l) => sLangs.includes(normalizeString(l)));
  return hasCommon ? 1.0 : 0.3;
}

export function scoreDigitalSolutionDimensions(
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): DigitalSolutionDimensionResult[] {
  const capResult = scoreCapabilities(consumer, solution);

  const rawResults: Array<{
    key: DigitalSolutionMatchDimensionKey;
    score: number | null;
    matchedCount?: number;
    missingCount?: number;
  }> = [
    { key: 'sector', score: scoreSector(consumer, solution) },
    { key: 'targetAudience', score: scoreTargetAudience(consumer, solution) },
    { key: 'capabilities', score: capResult.score, matchedCount: capResult.matchedCount, missingCount: capResult.missingCount },
    { key: 'solutionType', score: scoreSolutionType(consumer, solution) },
    { key: 'deliveryModel', score: scoreDeliveryModel(consumer, solution) },
    { key: 'location', score: scoreLocation(consumer, solution) },
    { key: 'priceRange', score: scorePriceRange(consumer, solution) },
    { key: 'language', score: scoreLanguage(consumer, solution) },
  ];

  return rawResults.map((r) => ({
    key: r.key,
    label: DIGITAL_SOLUTION_DIMENSION_LABELS[r.key],
    weight: DIGITAL_SOLUTION_MATCH_WEIGHTS[r.key],
    comparable: r.score !== null,
    score: r.score,
    matchedCount: r.matchedCount,
    missingCount: r.missingCount,
  }));
}

export function normalizeMatchScore(dimensions: DigitalSolutionDimensionResult[]): number {
  let weightedSum = 0;
  let usedWeight = 0;

  for (const dim of dimensions) {
    if (dim.score !== null) {
      weightedSum += dim.score * dim.weight;
      usedWeight += dim.weight;
    }
  }

  if (usedWeight === 0) return 0;
  return Math.round((weightedSum / usedWeight) * 100);
}

export function resolveScoreBand(score: number): {
  band: DigitalSolutionMatchBand;
  bandLabel: string;
  recommendable: boolean;
} {
  if (score >= 80) {
    return { band: 'very_strong', bandLabel: 'Çok güçlü uyum', recommendable: true };
  }
  if (score >= 65) {
    return { band: 'strong', bandLabel: 'Güçlü uyum', recommendable: true };
  }
  if (score >= 50) {
    return { band: 'suitable', bandLabel: 'Uygun uyum', recommendable: true };
  }
  return { band: 'below_threshold', bandLabel: 'Uyumsuz', recommendable: false };
}
