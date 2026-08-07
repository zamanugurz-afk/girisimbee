/** Girisimbee MARKET — curated promotional cards. */

export const MARKET_ITEM_STATUSES = ['draft', 'published', 'archived'] as const;
export type MarketItemStatus = (typeof MARKET_ITEM_STATUSES)[number];

export const MARKET_MAX_PUBLISHED = 5;

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
  ctaLabel: string;
  sortOrder: number;
  status: MarketItemStatus;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateMarketItemInput {
  title: string;
  description?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string;
  sortOrder?: number;
  status?: MarketItemStatus;
}

export interface UpdateMarketItemInput {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string;
  sortOrder?: number;
  status?: MarketItemStatus;
}

export const MARKET_STATUS_LABELS: Record<MarketItemStatus, string> = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşiv',
};
