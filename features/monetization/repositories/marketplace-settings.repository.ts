import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';

export interface MarketplaceSettingsRepository {
  get(): Promise<MarketplaceSettings>;
  updateFreeListingLimit(limit: number): Promise<MarketplaceSettings>;
  incrementPublishedCount(): Promise<MarketplaceSettings>;
}
