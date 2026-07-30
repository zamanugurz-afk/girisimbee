import type { Recommendation, ConfidenceLabel } from '@/types';

const REC_LABEL: Record<Recommendation, string> = {
  buy: 'BUY NOW',
  'good-deal': 'GOOD DEAL',
  negotiate: 'NEGOTIATE',
  wait: 'WAIT',
  avoid: 'AVOID',
};

const CONFIDENCE_LABELS: Record<ConfidenceLabel, string> = {
  'very-high': 'Very High',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export interface SummaryInput {
  priceVsMarketPct: number;
  sellerScore: number;
  recommendation: Recommendation;
  riskLevel: string;
}

export function confidenceLabelFromScore(score: number): ConfidenceLabel {
  if (score >= 80) return 'very-high';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function confidenceLabelToString(label: ConfidenceLabel): string {
  return CONFIDENCE_LABELS[label];
}

export function recommendationLabel(rec: Recommendation): string {
  return REC_LABEL[rec];
}

export function generateAISummary(input: SummaryInput): string {
  const sentences: string[] = [];

  if (input.priceVsMarketPct !== 0) {
    const direction = input.priceVsMarketPct < 0 ? 'below' : 'above';
    sentences.push(
      `Price is ${Math.abs(input.priceVsMarketPct).toFixed(0)}% ${direction} market average.`,
    );
  } else {
    sentences.push('Price is at market average.');
  }

  if (input.sellerScore >= 65) {
    sentences.push('Seller looks trustworthy.');
  } else if (input.sellerScore >= 40) {
    sentences.push('Seller has moderate trustworthiness.');
  } else {
    sentences.push('Seller trust is low — proceed with caution.');
  }

  sentences.push(`Recommended action: ${REC_LABEL[input.recommendation]}.`);

  return sentences.slice(0, 3).join(' ');
}
