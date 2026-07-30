import type { PriceTrendDirection } from '@/types';

export interface PriceStats {
  average: number;
  median: number;
  minimum: number;
  maximum: number;
  count: number;
  range: number;
  spread_pct: number;
}

export interface OpportunityResult {
  opportunity_pct: number;
  discount_pct: number;
  market_value: number;
  is_good_deal: boolean;
  tier: 'excellent' | 'very-good' | 'good' | 'average' | 'poor';
}

export interface TrendResult {
  change_pct: number;
  direction: PriceTrendDirection;
  periods: {
    '7d': number;
    '30d': number;
    '90d': number;
    all: number;
  };
}

export class PriceEngine {
  average(prices: number[]): number {
    if (prices.length === 0) return 0;
    return prices.reduce((a, p) => a + p, 0) / prices.length;
  }

  median(prices: number[]): number {
    if (prices.length === 0) return 0;
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  minimum(prices: number[]): number {
    if (prices.length === 0) return 0;
    return Math.min(...prices);
  }

  maximum(prices: number[]): number {
    if (prices.length === 0) return 0;
    return Math.max(...prices);
  }

  stats(prices: number[]): PriceStats {
    if (prices.length === 0) {
      return { average: 0, median: 0, minimum: 0, maximum: 0, count: 0, range: 0, spread_pct: 0 };
    }
    const avg = this.average(prices);
    const med = this.median(prices);
    const min = this.minimum(prices);
    const max = this.maximum(prices);
    return {
      average: Math.round(avg),
      median: Math.round(med),
      minimum: min,
      maximum: max,
      count: prices.length,
      range: max - min,
      spread_pct: med > 0 ? Math.round(((max - min) / med) * 1000) / 10 : 0,
    };
  }

  marketValue(prices: number[]): number {
    const med = this.median(prices);
    const avg = this.average(prices);
    return Math.round((med + avg) / 2);
  }

  opportunityPct(price: number, marketMedian: number): number {
    if (marketMedian <= 0) return 0;
    return Math.round(((marketMedian - price) / marketMedian) * 1000) / 10;
  }

  discountPct(price: number, marketMedian: number): number {
    if (marketMedian <= 0) return 0;
    return Math.max(0, Math.round(((marketMedian - price) / marketMedian) * 1000) / 10);
  }

  priceChangePct(oldPrice: number, newPrice: number): number {
    if (oldPrice <= 0) return 0;
    return Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
  }

  trendDirection(changePct: number): PriceTrendDirection {
    if (changePct > 1) return 'up';
    if (changePct < -1) return 'down';
    return 'stable';
  }

  rangePct(min: number, max: number): number {
    if (max <= 0) return 0;
    return Math.round(((max - min) / max) * 1000) / 10;
  }

  analyze(price: number, allPrices: number[]): OpportunityResult {
    const med = this.median(allPrices);
    const oppPct = this.opportunityPct(price, med);
    const discPct = this.discountPct(price, med);
    const marketVal = this.marketValue(allPrices);

    let tier: OpportunityResult['tier'];
    if (oppPct >= 12) tier = 'excellent';
    else if (oppPct >= 7) tier = 'very-good';
    else if (oppPct >= 3) tier = 'good';
    else if (oppPct >= -5) tier = 'average';
    else tier = 'poor';

    return {
      opportunity_pct: oppPct,
      discount_pct: discPct,
      market_value: marketVal,
      is_good_deal: oppPct > 0,
      tier,
    };
  }

  trend(priceHistory: { date: string; price: number }[]): TrendResult {
    if (priceHistory.length < 2) {
      return { change_pct: 0, direction: 'stable', periods: { '7d': 0, '30d': 0, '90d': 0, all: 0 } };
    }
    const now = Date.now();
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const allChange = this.priceChangePct(first, last);

    const periodChange = (days: number): number => {
      const fromMs = now - days * 86400000;
      const inRange = priceHistory.filter((p) => new Date(p.date).getTime() >= fromMs);
      if (inRange.length < 2) return 0;
      return this.priceChangePct(inRange[0].price, inRange[inRange.length - 1].price);
    };

    return {
      change_pct: allChange,
      direction: this.trendDirection(allChange),
      periods: {
        '7d': periodChange(7),
        '30d': periodChange(30),
        '90d': periodChange(90),
        all: allChange,
      },
    };
  }
}
