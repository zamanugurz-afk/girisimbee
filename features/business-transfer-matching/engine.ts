import type {
  BusinessTransferDimensionResult,
  BusinessTransferMatchExplanation,
  BusinessTransferMatchResult,
  BusinessTransferOpportunityProfile,
  BusinessTransferSeekerProfile,
} from '@/features/business-transfer-matching/types';
import {
  BUSINESS_TRANSFER_DIMENSION_LABELS,
  BUSINESS_TRANSFER_MATCH_WEIGHTS,
  getBusinessTransferBand,
  scoreBudget,
  scoreBusinessType,
  scoreLocation,
  scoreOperations,
  scoreSector,
} from '@/features/business-transfer-matching/scoring';

export function calculateBusinessTransferMatch(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): BusinessTransferMatchResult {
  const dimensionScores = {
    sector: scoreSector(seeker, opp),
    budget: scoreBudget(seeker, opp),
    location: scoreLocation(seeker, opp),
    businessType: scoreBusinessType(seeker, opp),
    operations: scoreOperations(seeker, opp),
  };

  const dimensions: BusinessTransferDimensionResult[] = [];
  let totalWeight = 0;
  let weightedScoreSum = 0;

  for (const [keyStr, score] of Object.entries(dimensionScores)) {
    const key = keyStr as keyof typeof dimensionScores;
    const weight = BUSINESS_TRANSFER_MATCH_WEIGHTS[key];
    const label = BUSINESS_TRANSFER_DIMENSION_LABELS[key];
    const comparable = score !== null;

    dimensions.push({
      key,
      label,
      weight,
      comparable,
      score,
    });

    if (comparable) {
      totalWeight += weight;
      weightedScoreSum += score * weight;
    }
  }

  const finalScore = totalWeight > 0 ? Math.round((weightedScoreSum / totalWeight) * 100) : 0;
  const { band, bandLabel, recommendable } = getBusinessTransferBand(finalScore);

  const reasons: BusinessTransferMatchExplanation[] = [];

  if (dimensionScores.sector !== null) {
    if (dimensionScores.sector >= 0.8) {
      reasons.push({ kind: 'match', text: `Sektör tam uyumlu (${opp.sector})` });
    } else {
      reasons.push({ kind: 'gap', text: `Hedef sektör farkı (${opp.sector})` });
    }
  }

  if (dimensionScores.budget !== null) {
    if (dimensionScores.budget >= 0.8) {
      reasons.push({ kind: 'match', text: 'Devir bedeli bütçenizle tam uyumlu' });
    } else if (dimensionScores.budget >= 0.5) {
      reasons.push({ kind: 'match', text: 'Devir bedeli bütçenize yakın / müzakere edilebilir' });
    } else {
      reasons.push({ kind: 'gap', text: 'Devir bedeli bütçenizin üzerinde' });
    }
  }

  if (dimensionScores.location !== null) {
    if (dimensionScores.location >= 0.9) {
      reasons.push({ kind: 'match', text: `Lokasyon uyumu (${opp.city}${opp.district ? ` / ${opp.district}` : ''})` });
    } else {
      reasons.push({ kind: 'gap', text: 'Farklı şehir lokasyonu' });
    }
  }

  if (dimensionScores.businessType !== null && dimensionScores.businessType >= 0.8) {
    reasons.push({ kind: 'match', text: `İşletme türü uyumlu (${opp.businessType})` });
  }

  return {
    score: finalScore,
    band,
    bandLabel,
    recommendable,
    reasons,
    dimensions,
  };
}
