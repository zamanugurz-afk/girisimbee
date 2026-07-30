import type { OpportunityTier } from '@/types';

export interface AnalyzerResult {
  score: number;
  reasons: string[];
}

export interface ListingInput {
  id: string;
  price: number;
  condition: string;
  description: string | null;
  image_urls: string[];
  first_seen_at: string;
}

export interface AnalyzerContext {
  listing: ListingInput;
  marketMedian: number;
  allPrices: number[];
  priceHistory: number[];
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export class OpportunityAnalyzer {
  analyze(ctx: AnalyzerContext): AnalyzerResult {
    const { listing, marketMedian } = ctx;
    const reasons: string[] = [];
    let score = 50;

    if (marketMedian > 0) {
      const diffPct = ((marketMedian - listing.price) / marketMedian) * 100;
      if (diffPct >= 15) {
        score += 35;
        reasons.push(`Price is ${diffPct.toFixed(0)}% below market median — exceptional deal.`);
      } else if (diffPct >= 8) {
        score += 22;
        reasons.push(`Price is ${diffPct.toFixed(0)}% below market median — strong opportunity.`);
      } else if (diffPct >= 3) {
        score += 12;
        reasons.push(`Price is ${diffPct.toFixed(0)}% below market median.`);
      } else if (diffPct >= -5) {
        score += 2;
      } else {
        score -= 15;
        reasons.push(`Price is ${Math.abs(diffPct).toFixed(0)}% above market median.`);
      }
    }

    const ageDays = (Date.now() - new Date(listing.first_seen_at).getTime()) / 86400000;
    if (ageDays < 1) {
      score += 8;
      reasons.push('Listed within 24 hours — fresh opportunity.');
    } else if (ageDays < 3) {
      score += 4;
    } else if (ageDays > 14) {
      score -= 5;
      reasons.push('Listing is older than 2 weeks — may have issues.');
    }

    if (listing.condition === 'new') {
      score += 5;
    } else if (listing.condition === 'like-new') {
      score += 3;
    }

    if (ctx.priceHistory.length >= 3) {
      const recent = ctx.priceHistory.slice(-3);
      const trending = recent[recent.length - 1] < recent[0];
      if (trending) {
        score += 6;
        reasons.push('Market prices are trending down — good timing.');
      }
    }

    return { score: clamp(score), reasons };
  }

  tier(score: number): OpportunityTier {
    if (score >= 80) return 'excellent';
    if (score >= 68) return 'very-good';
    if (score >= 55) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
}
