import type { RiskLevel } from '@/types';
import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';
import type { SellerDTO } from '@/types';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export interface RiskResult extends AnalyzerResult {
  probability: number;
  level: RiskLevel;
  is_flagged: boolean;
}

export class RiskAnalyzer {
  analyze(ctx: AnalyzerContext, seller: SellerDTO | null, sellerScore: number): RiskResult {
    const { listing, allPrices, marketMedian } = ctx;
    const reasons: string[] = [];
    let probability = 10;

    if (marketMedian > 0) {
      const discountPct = ((marketMedian - listing.price) / marketMedian) * 100;
      if (discountPct > 25) {
        probability += 35;
        reasons.push(`Price is suspiciously low — ${discountPct.toFixed(0)}% below market (possible scam).`);
      } else if (discountPct > 15) {
        probability += 15;
        reasons.push(`Price is unusually low (${discountPct.toFixed(0)}% below market).`);
      }
    }

    if (listing.image_urls.length === 0) {
      probability += 20;
      reasons.push('No images — high risk of misleading listing.');
    }

    if (listing.description && listing.description.trim().length < 20) {
      probability += 12;
      reasons.push('Very short or missing description.');
    }

    if (seller) {
      if (sellerScore < 35) {
        probability += 20;
        reasons.push('Low seller trust score — unverified or new account.');
      }
      if (!seller.phone_verified && !seller.email_verified) {
        probability += 10;
        reasons.push('Seller has no verified contact info.');
      }
      if (seller.member_since && new Date().getFullYear() - seller.member_since < 1) {
        probability += 15;
        reasons.push('Seller account is less than 1 year old.');
      }
    } else {
      probability += 15;
      reasons.push('No seller information — cannot verify identity.');
    }

    if (allPrices.length > 0) {
      const minPrice = Math.min(...allPrices);
      if (listing.price < minPrice * 0.5) {
        probability += 25;
        reasons.push('Price is less than half of the lowest known listing — likely fake.');
      }
    }

    probability = clamp(probability);
    const level: RiskLevel = probability >= 50 ? 'high' : probability >= 25 ? 'medium' : 'low';

    return {
      score: 100 - probability,
      reasons,
      probability,
      level,
      is_flagged: probability >= 40,
    };
  }
}
