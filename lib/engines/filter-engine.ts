import type {
  ListingResponse,
  ListingFilter,
  ListingAgeFilter,
  SortOption,
  ConditionGrade,
} from '@/types';
import type { PriceEngine } from './price-engine';

const AGE_MS: Record<ListingAgeFilter, number> = {
  '24h': 86400000,
  '3d': 259200000,
  '7d': 604800000,
  '15d': 1296000000,
  '30d': 2592000000,
  all: Infinity,
};

export class FilterEngine {
  filter(listings: ListingResponse[], f: ListingFilter, priceEngine: PriceEngine): ListingResponse[] {
    let out = [...listings];

    if (f.search) {
      const q = f.search.toLowerCase().trim();
      if (q) {
        out = out.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            (l.description?.toLowerCase().includes(q) ?? false) ||
            l.district.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q) ||
            (l.seller?.display_name.toLowerCase().includes(q) ?? false) ||
            (l.product?.name.toLowerCase().includes(q) ?? false) ||
            (l.product?.brand.toLowerCase().includes(q) ?? false) ||
            (l.provider?.name.toLowerCase().includes(q) ?? false),
        );
      }
    }

    if (f.provider_id) out = out.filter((l) => l.provider_id === f.provider_id);
    if (f.product_id) out = out.filter((l) => l.product_id === f.product_id);
    if (f.category_id) out = out.filter((l) => l.product?.category_id === f.category_id);
    if (f.city) out = out.filter((l) => l.city === f.city);
    if (f.district) out = out.filter((l) => l.district === f.district);

    if (f.condition && f.condition !== 'all') {
      out = out.filter((l) => l.condition === (f.condition as ConditionGrade));
    }

    if (f.listing_age && f.listing_age !== 'all') {
      const cutoff = Date.now() - AGE_MS[f.listing_age];
      out = out.filter((l) => new Date(l.first_seen_at).getTime() >= cutoff);
    }

    if (f.min_price !== null && f.min_price !== undefined) {
      out = out.filter((l) => l.price >= f.min_price!);
    }
    if (f.max_price !== null && f.max_price !== undefined) {
      out = out.filter((l) => l.price <= f.max_price!);
    }

    if (f.is_active !== undefined) out = out.filter((l) => l.is_active === f.is_active);
    if (f.exclude_deleted !== false) out = out.filter((l) => l.deleted_at === null);

    return this.sort(out, f.sort ?? 'newest', priceEngine);
  }

  sort(listings: ListingResponse[], sort: SortOption, priceEngine: PriceEngine): ListingResponse[] {
    const out = [...listings];
    switch (sort) {
      case 'lowest-price':
        return out.sort((a, b) => a.price - b.price);
      case 'newest':
        return out.sort((a, b) => +new Date(b.first_seen_at) - +new Date(a.first_seen_at));
      case 'highest-ai':
        return out.sort(
          (a, b) => (b.ai_analysis?.opportunity_score ?? 0) - (a.ai_analysis?.opportunity_score ?? 0),
        );
      case 'highest-opportunity':
        return out.sort((a, b) => {
          const aOpp = a.market_stats ? priceEngine.opportunityPct(a.price, a.market_stats.median_price) : 0;
          const bOpp = b.market_stats ? priceEngine.opportunityPct(b.price, b.market_stats.median_price) : 0;
          return bOpp - aOpp;
        });
      case 'biggest-discount':
        return out.sort((a, b) => {
          const aDisc = a.market_stats ? priceEngine.discountPct(a.price, a.market_stats.median_price) : 0;
          const bDisc = b.market_stats ? priceEngine.discountPct(b.price, b.market_stats.median_price) : 0;
          return bDisc - aDisc;
        });
      default:
        return out.sort((a, b) => +new Date(b.last_seen_at) - +new Date(a.last_seen_at));
    }
  }
}
