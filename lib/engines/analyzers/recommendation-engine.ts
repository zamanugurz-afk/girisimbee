import type { Recommendation, OpportunityTier } from '@/types';

export interface RecommendationInput {
  opportunityScore: number;
  sellerScore: number;
  riskScore: number;
  fakeProbability: number;
  negotiationScore: number;
  confidence: number;
}

export interface RecommendationResult {
  recommendation: Recommendation;
  explanation: string;
  shouldBuy: boolean;
  confidence: number;
}

export class RecommendationEngine {
  analyze(input: RecommendationInput): RecommendationResult {
    const { opportunityScore, sellerScore, riskScore, fakeProbability, negotiationScore } = input;

    if (fakeProbability >= 50) {
      return {
        recommendation: 'avoid',
        explanation: 'High probability of fake or fraudulent listing. Do not proceed.',
        shouldBuy: false,
        confidence: input.confidence,
      };
    }

    if (fakeProbability >= 30 || sellerScore < 30) {
      return {
        recommendation: 'wait',
        explanation: 'Elevated risk indicators. Verify seller identity and listing authenticity before proceeding.',
        shouldBuy: false,
        confidence: input.confidence,
      };
    }

    const combined = opportunityScore * 0.4 + sellerScore * 0.3 + riskScore * 0.2 + negotiationScore * 0.1;

    if (combined >= 75 && fakeProbability < 15) {
      return {
        recommendation: 'buy',
        explanation: `Strong opportunity (score ${opportunityScore}/100) with a trusted seller. Recommended to buy now.`,
        shouldBuy: true,
        confidence: input.confidence,
      };
    }

    if (combined >= 65 && fakeProbability < 20) {
      return {
        recommendation: 'good-deal',
        explanation: `Good deal (score ${opportunityScore}/100) with solid seller trust. Recommended to buy.`,
        shouldBuy: true,
        confidence: input.confidence,
      };
    }

    if (combined >= 50 && negotiationScore >= 55) {
      return {
        recommendation: 'negotiate',
        explanation: `Good opportunity with negotiation potential. Try an offer below asking price.`,
        shouldBuy: true,
        confidence: input.confidence,
      };
    }

    return {
      recommendation: 'wait',
      explanation: 'Listing is close to market value. Wait for a better opportunity or negotiate.',
      shouldBuy: false,
      confidence: input.confidence,
    };
  }

  tier(score: number): OpportunityTier {
    if (score >= 80) return 'excellent';
    if (score >= 68) return 'very-good';
    if (score >= 55) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
}
