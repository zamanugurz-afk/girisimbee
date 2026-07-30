import { OpportunityAnalyzer } from './analyzers/opportunity-analyzer';
import { SellerAnalyzer } from './analyzers/seller-analyzer';
import { PriceAnalyzer } from './analyzers/price-analyzer';
import { DescriptionAnalyzer } from './analyzers/description-analyzer';
import { ImageAnalyzer } from './analyzers/image-analyzer';
import { NegotiationAnalyzer } from './analyzers/negotiation-analyzer';
import { RiskAnalyzer } from './analyzers/risk-analyzer';
import { RecommendationEngine } from './analyzers/recommendation-engine';
import { generateAISummary, confidenceLabelFromScore, recommendationLabel } from './analyzers/summary-analyzer';
import type { SellerDTO, Recommendation, OpportunityTier, RiskLevel, ConfidenceLabel } from '@/types';

export interface AIAnalysisInput {
  listing: {
    id: string;
    price: number;
    condition: string;
    description: string | null;
    image_urls: string[];
    first_seen_at: string;
    title?: string;
    updated_at?: string;
  };
  seller: SellerDTO | null;
  marketMedian: number;
  marketAverage?: number;
  lowestPrice?: number;
  highestPrice?: number;
  avg30?: number;
  avg90?: number;
  allPrices: number[];
  priceHistory: number[];
  allListings?: Array<{ id: string; title: string; price: number; description: string | null; image_urls: string[] }>;
}

export interface AIAnalysisResult {
  scores: {
    opportunity: number;
    seller: number;
    price: number;
    image: number;
    description: number;
    negotiation: number;
    risk: number;
    overall: number;
  };
  summary: string;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  recommendation: Recommendation;
  recommendationLabel: string;
  reasons: string[];
  riskLevel: RiskLevel;
  riskProbability: number;
  opportunityTier: OpportunityTier;
  suggestedOffer: number | null;
  expectedAcceptedPrice: number | null;
  negotiationProbability: number;
  contentHash: string;
  shouldBuy: boolean;
  explanation: string;

  opportunityScore: number;
  sellerScore: number;
  priceScore: number;
  imageScore: number;
  descriptionScore: number;
  negotiationScore: number;
  fakeProbability: number;
  riskScore: number;
  overallScore: number;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16);
}

export class AIEngine {
  private opportunity = new OpportunityAnalyzer();
  private seller = new SellerAnalyzer();
  private price = new PriceAnalyzer();
  private description = new DescriptionAnalyzer();
  private image = new ImageAnalyzer();
  private negotiation = new NegotiationAnalyzer();
  private risk = new RiskAnalyzer();
  private recommendation = new RecommendationEngine();

  analyze(input: AIAnalysisInput): AIAnalysisResult {
    const ctx = {
      listing: input.listing,
      marketMedian: input.marketMedian,
      allPrices: input.allPrices,
      priceHistory: input.priceHistory,
    };

    const opp = this.opportunity.analyze(ctx);
    const sellerResult = this.seller.analyze({ ...ctx, seller: input.seller } as unknown as Parameters<typeof this.seller.analyze>[0]);
    const priceResult = this.price.analyze(ctx);
    const descResult = this.description.analyze(ctx);
    const imgResult = this.image.analyze(ctx);
    const negResult = this.negotiation.analyze(ctx, input.seller, input.marketMedian);
    const riskResult = this.risk.analyze(ctx, input.seller, sellerResult.score);

    const riskScore = clamp(riskResult.score);
    const confidence = clamp(
      Math.round(
        (opp.score + sellerResult.score + priceResult.score + descResult.score + imgResult.score + riskScore) / 6,
      ),
    );
    const confidenceLabel = confidenceLabelFromScore(confidence);

    const overallScore = clamp(
      Math.round(
        opp.score * 0.25 +
        sellerResult.score * 0.20 +
        priceResult.score * 0.20 +
        negResult.score * 0.10 +
        descResult.score * 0.10 +
        imgResult.score * 0.10 +
        riskScore * 0.05,
      ),
    );

    const recResult = this.recommendation.analyze({
      opportunityScore: opp.score,
      sellerScore: sellerResult.score,
      riskScore,
      fakeProbability: riskResult.probability,
      negotiationScore: negResult.score,
      confidence,
    });

    const priceVsMarketPct = input.marketMedian > 0
      ? Math.round(((input.listing.price - input.marketMedian) / input.marketMedian) * 1000) / 10
      : 0;

    const summary = generateAISummary({
      priceVsMarketPct,
      sellerScore: sellerResult.score,
      recommendation: recResult.recommendation,
      riskLevel: riskResult.level,
    });

    const allReasons = [
      ...opp.reasons,
      ...sellerResult.reasons,
      ...priceResult.reasons,
      ...descResult.reasons,
      ...imgResult.reasons,
      ...negResult.reasons,
      ...riskResult.reasons,
    ].slice(0, 8);

    const expectedAcceptedPrice = negResult.suggested_offer
      ? Math.round(negResult.suggested_offer * 1.03)
      : null;
    const negotiationProbability = clamp(negResult.score + 5);

    const contentHash = this.computeContentHash(input);

    const duplicateDetected = this.detectDuplicateListing(input);

    return {
      scores: {
        opportunity: opp.score,
        seller: sellerResult.score,
        price: priceResult.score,
        image: imgResult.score,
        description: descResult.score,
        negotiation: negResult.score,
        risk: riskScore,
        overall: overallScore,
      },
      summary,
      confidence,
      confidenceLabel,
      recommendation: recResult.recommendation,
      recommendationLabel: recommendationLabel(recResult.recommendation),
      reasons: duplicateDetected ? [...allReasons, 'Duplicate listing detected — same title and price found elsewhere.'] : allReasons,
      riskLevel: riskResult.level,
      riskProbability: riskResult.probability,
      opportunityTier: this.opportunity.tier(opp.score),
      suggestedOffer: negResult.suggested_offer,
      expectedAcceptedPrice,
      negotiationProbability,
      contentHash,
      shouldBuy: recResult.shouldBuy,
      explanation: recResult.explanation,

      opportunityScore: opp.score,
      sellerScore: sellerResult.score,
      priceScore: priceResult.score,
      imageScore: imgResult.score,
      descriptionScore: descResult.score,
      negotiationScore: negResult.score,
      fakeProbability: riskResult.probability,
      riskScore,
      overallScore,
    };
  }

  private computeContentHash(input: AIAnalysisInput): string {
    const parts = [
      input.listing.id,
      String(input.listing.price),
      input.listing.description ?? '',
      input.listing.image_urls.join(','),
      input.listing.title ?? '',
      String(input.marketMedian),
      input.allPrices.join(','),
      input.priceHistory.join(','),
    ];
    return simpleHash(parts.join('|'));
  }

  private detectDuplicateListing(input: AIAnalysisInput): boolean {
    if (!input.allListings || input.allListings.length === 0) return false;
    return input.allListings.some(
      (l) =>
        l.id !== input.listing.id &&
        l.title === input.listing.title &&
        l.price === input.listing.price,
    );
  }
}
