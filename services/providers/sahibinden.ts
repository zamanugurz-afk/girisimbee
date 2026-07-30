import 'server-only';

import type { RawListing } from '@/types';
import type { ProviderSearchOptions } from './provider-service.interface';
import { BaseProviderService } from './base-provider-service';
import { searchSahibindenKeywords } from './sahibinden-fetch.server';
import type { ScrapedListing } from './scraper-types';

/**
 * Sahibinden provider adapter — fetches real listings from sahibinden.com search.
 *
 * Product URLs come directly from each result card href
 * (e.g. https://www.sahibinden.com/ilan/playstation-5-...-1234567890/detay).
 * They are never constructed from listing IDs.
 */
export class SahibindenProviderService extends BaseProviderService {
  readonly providerSlug = 'sahibinden';

  protected async fetchListings(keywords: string[], options?: ProviderSearchOptions): Promise<RawListing[]> {
    const limit = options?.limit ?? 20;

    try {
      const scraped = await searchSahibindenKeywords(keywords, limit);
      return scraped.map((item) => this.toRawListing(item));
    } catch {
      return [];
    }
  }

  protected async fetchListing(externalId: string): Promise<RawListing | null> {
    const productId = externalId.replace(/^sahibinden-/, '');

    try {
      const results = await searchSahibindenKeywords([productId], 10);
      const match =
        results.find((r) => r.externalId === productId) ??
        results.find((r) => r.url.includes(`-${productId}/`));

      if (!match) return null;
      return this.toRawListing(match);
    } catch {
      return null;
    }
  }

  private toRawListing(item: ScrapedListing): RawListing {
    return {
      externalId: item.externalId,
      title: item.title,
      price: item.price,
      currency: 'TRY',
      url: item.url,
      imageUrls: item.imageUrls,
      description: item.description,
      district: item.district,
      city: 'Istanbul',
      condition: item.condition,
      sellerName: item.sellerName,
      sellerVerified: false,
    };
  }
}
