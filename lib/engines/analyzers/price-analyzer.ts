import { PriceEngine } from '../price-engine';
import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export class PriceAnalyzer {
  private priceEngine = new PriceEngine();

  analyze(ctx: AnalyzerContext): AnalyzerResult {
    const { listing, allPrices, marketMedian } = ctx;
    const reasons: string[] = [];
    let score = 50;

    if (allPrices.length === 0) {
      return { score: 50, reasons: ['No comparable prices available.'] };
    }

    const stats = this.priceEngine.stats(allPrices);
    const oppPct = this.priceEngine.opportunityPct(listing.price, marketMedian);

    if (listing.price <= stats.minimum) {
      score += 30;
      reasons.push('This is the lowest price found for this product.');
    } else if (oppPct >= 10) {
      score += 22;
      reasons.push(`Price is ${oppPct.toFixed(0)}% below median — great value.`);
    } else if (oppPct >= 0) {
      score += 8;
    } else {
      score -= 20;
      reasons.push(`Price is ${Math.abs(oppPct).toFixed(0)}% above market median — overpriced.`);
    }

    const spreadPct = stats.spread_pct;
    if (spreadPct > 30) {
      score -= 5;
      reasons.push(`High price variance (${spreadPct.toFixed(0)}%) across listings — research needed.`);
    }

    if (ctx.priceHistory.length >= 5) {
      const trend = this.priceEngine.trend(
        ctx.priceHistory.map((p, i) => ({ date: new Date(Date.now() - (ctx.priceHistory.length - i) * 86400000).toISOString(), price: p })),
      );
      if (trend.direction === 'down') {
        score += 10;
        reasons.push('Prices trending downward — wait or negotiate for better deal.');
      } else if (trend.direction === 'up') {
        score -= 5;
        reasons.push('Prices trending upward — buying sooner may be better.');
      }
    }

    return { score: clamp(score), reasons };
  }
}
