import type { SellerDTO, RiskLevel } from '@/types';
import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export class SellerAnalyzer {
  analyze(ctx: AnalyzerContext): AnalyzerResult {
    const reasons: string[] = [];
    let score = 40;

    const memberYears = ctx.listing && (Date.now() - new Date(ctx.listing.first_seen_at).getTime()) / (365 * 86400000);

    const seller = (ctx as unknown as { seller: SellerDTO | null }).seller;
    if (!seller) {
      return { score: 30, reasons: ['No seller information available — treat with caution.'] };
    }

    if (seller.rating >= 4.5) {
      score += 25;
      reasons.push(`Seller rating is ${seller.rating}★ — highly trusted.`);
    } else if (seller.rating >= 4.0) {
      score += 15;
      reasons.push(`Seller rating is ${seller.rating}★ — good reputation.`);
    } else if (seller.rating >= 3.0) {
      score += 5;
    } else {
      score -= 10;
      reasons.push(`Seller rating is only ${seller.rating}★ — low trust.`);
    }

    if (seller.phone_verified) {
      score += 10;
      reasons.push('Phone number verified.');
    }
    if (seller.email_verified) {
      score += 5;
      reasons.push('Email verified.');
    }

    if (seller.member_since) {
      const years = new Date().getFullYear() - seller.member_since;
      if (years >= 5) {
        score += 15;
        reasons.push(`Active seller for ${years} years — established account.`);
      } else if (years >= 2) {
        score += 8;
      } else {
        score -= 5;
        reasons.push('Seller account is less than 2 years old.');
      }
    }

    if (seller.listing_count >= 100) {
      score += 12;
      reasons.push(`${seller.listing_count} listings — experienced seller.`);
    } else if (seller.listing_count >= 20) {
      score += 6;
    } else if (seller.listing_count < 5) {
      score -= 8;
      reasons.push(`Only ${seller.listing_count} listings — low activity.`);
    }

    void memberYears;
    return { score: clamp(score), reasons };
  }

  riskLevel(sellerScore: number): RiskLevel {
    if (sellerScore >= 65) return 'low';
    if (sellerScore >= 40) return 'medium';
    return 'high';
  }
}
