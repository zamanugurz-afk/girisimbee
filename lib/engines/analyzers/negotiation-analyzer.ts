import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';
import type { SellerDTO } from '@/types';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export interface NegotiationResult extends AnalyzerResult {
  suggested_offer: number | null;
  recommendation: string;
}

export class NegotiationAnalyzer {
  analyze(ctx: AnalyzerContext, seller: SellerDTO | null, marketMedian: number): NegotiationResult {
    const { listing } = ctx;
    const reasons: string[] = [];
    let score = 50;

    const aboveMedian = marketMedian > 0 && listing.price > marketMedian;
    const priceDiffPct = marketMedian > 0 ? ((listing.price - marketMedian) / marketMedian) * 100 : 0;

    if (aboveMedian) {
      score += 20;
      reasons.push(`Price is ${priceDiffPct.toFixed(0)}% above market — strong room to negotiate.`);
    } else if (priceDiffPct > -3) {
      score += 10;
      reasons.push('Price is near market average — moderate negotiation potential.');
    } else {
      score -= 15;
      reasons.push('Price is already below market — limited negotiation room.');
    }

    if (seller) {
      if (seller.listing_count > 50) {
        score += 10;
        reasons.push('Experienced seller — likely open to reasonable offers.');
      } else if (seller.listing_count < 5) {
        score -= 8;
        reasons.push('New seller — may be inflexible on price.');
      }

      if (seller.rating >= 4.5) {
        score += 5;
      } else if (seller.rating < 3.5) {
        score += 10;
        reasons.push('Lower-rated seller may be more willing to negotiate.');
      }
    }

    const ageDays = (Date.now() - new Date(listing.first_seen_at).getTime()) / 86400000;
    if (ageDays > 7) {
      score += 12;
      reasons.push(`Listing has been up for ${Math.round(ageDays)} days — seller may be motivated.`);
    } else if (ageDays < 2) {
      score -= 10;
      reasons.push('Fresh listing — seller unlikely to negotiate yet.');
    }

    if (listing.condition === 'fair' || listing.condition === 'poor') {
      score += 8;
      reasons.push('Lower condition grade gives negotiation leverage.');
    }

    let suggestedOffer: number | null = null;
    let recommendation = 'Monitor the listing before making an offer.';

    if (score >= 60 && marketMedian > 0) {
      suggestedOffer = Math.round(marketMedian * 0.92);
      recommendation = `Offer around ₺${suggestedOffer.toLocaleString('tr-TR')} (8% below market median).`;
    } else if (score >= 45 && marketMedian > 0) {
      suggestedOffer = Math.round(listing.price * 0.95);
      recommendation = `Try a modest offer around ₺${suggestedOffer.toLocaleString('tr-TR')}.`;
    } else if (score < 30) {
      recommendation = 'Price is already attractive — buy without negotiating.';
    }

    return {
      score: clamp(score),
      reasons,
      suggested_offer: suggestedOffer,
      recommendation,
    };
  }
}
