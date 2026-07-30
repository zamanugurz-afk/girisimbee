/**
 * Mock marketplace settings — in-memory singleton.
 */
import { now } from '@/lib/domain/factory';
import type { MarketplaceSettings } from '@/features/monetization/types/listing-package.types';
import type { MarketplaceSettingsRepository } from '@/features/monetization/repositories/marketplace-settings.repository';

const DEFAULT: MarketplaceSettings = {
  id: 'global',
  freeListingLimit: 100,
  currentPublishedCount: 0,
  updatedAt: now(),
};

export class MockMarketplaceSettingsRepository implements MarketplaceSettingsRepository {
  private settings: MarketplaceSettings = { ...DEFAULT };

  async get(): Promise<MarketplaceSettings> {
    return { ...this.settings };
  }

  async updateFreeListingLimit(limit: number): Promise<MarketplaceSettings> {
    this.settings = { ...this.settings, freeListingLimit: limit, updatedAt: now() };
    return { ...this.settings };
  }

  async incrementPublishedCount(): Promise<MarketplaceSettings> {
    this.settings = {
      ...this.settings,
      currentPublishedCount: this.settings.currentPublishedCount + 1,
      updatedAt: now(),
    };
    return { ...this.settings };
  }
}

export const mockMarketplaceSettingsRepository = new MockMarketplaceSettingsRepository();
