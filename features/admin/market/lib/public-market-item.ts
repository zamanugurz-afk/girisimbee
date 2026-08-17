import type { MarketItem } from '@/features/admin/market/types/market.types';
import { isMarketSafePublicHref } from '@/features/admin/market/presentation/market-copy';

/** Public MARKET card/detail payload — no owner identity or hidden discovery routes. */
export function toPublicMarketItem(item: MarketItem): MarketItem {
  const rawLink = item.linkUrl?.trim() || null;
  return {
    ...item,
    createdBy: null,
    linkUrl: rawLink && isMarketSafePublicHref(rawLink) ? rawLink : null,
  };
}
