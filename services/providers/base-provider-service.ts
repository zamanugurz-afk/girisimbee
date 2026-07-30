import type {
  RawListing,
  NormalizedListing,
  ProviderSearchResult,
  ProviderHealthCheck,
} from '@/types';
import type {
  ProviderServiceInterface,
  ProviderSearchOptions,
} from './provider-service.interface';
import { ListingNormalizer } from './listing-normalizer';

/**
 * Base class that provides shared functionality for all provider adapters.
 * Each concrete provider extends this and implements `fetchListings` and
 * `fetchListing`. All other methods (search, normalize, healthCheck) are
 * inherited — no duplication.
 *
 * To add a new provider:
 * 1. Create a new file in services/providers/ (e.g. `my-provider.ts`)
 * 2. Extend BaseProviderService and implement the two abstract methods
 * 3. Export a singleton instance
 * 4. Register it in services/providers/index.ts
 *
 * No other file in the system needs to change.
 */
export abstract class BaseProviderService implements ProviderServiceInterface {
  abstract readonly providerSlug: string;

  protected normalizer = new ListingNormalizer();

  protected abstract fetchListings(keywords: string[], options?: ProviderSearchOptions): Promise<RawListing[]>;
  protected abstract fetchListing(externalId: string): Promise<RawListing | null>;

  async search(keywords: string[], options?: ProviderSearchOptions): Promise<ProviderSearchResult> {
    const start = Date.now();
    try {
      const raws = await this.fetchListings(keywords, options);
      const durationMs = Date.now() - start;
      return {
        listings: raws,
        totalFound: raws.length,
        durationMs,
      };
    } catch (_err) {
      return {
        listings: [],
        totalFound: 0,
        durationMs: Date.now() - start,
      };
    }
  }

  async getListing(externalId: string): Promise<RawListing | null> {
    try {
      return await this.fetchListing(externalId);
    } catch {
      return null;
    }
  }

  normalize(raw: RawListing): NormalizedListing {
    return this.normalizer.normalize(raw);
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    const start = Date.now();
    try {
      const result = await this.search(['test'], { limit: 1 });
      return {
        healthy: result.totalFound >= 0,
        responseMs: Date.now() - start,
        message: 'OK',
      };
    } catch (err) {
      return {
        healthy: false,
        responseMs: Date.now() - start,
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}
