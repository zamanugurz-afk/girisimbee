import 'server-only';

import type { RawListing } from '@/types';
import type { ProviderSearchOptions } from './provider-service.interface';
import { BaseProviderService } from './base-provider-service';
import { searchLetgoKeywords } from './letgo-fetch.server';
import type { ScrapedListing } from './scraper-types';

/**
 * Letgo provider adapter — fetches real listings from letgo.com search results.
 *
 * Product URLs come directly from each result card href
 * (e.g. https://www.letgo.com/item/playstation-5-...-iid-1234567890).
 * They are never constructed from listing IDs.
 */
export class LetgoProviderService extends BaseProviderService {
  readonly providerSlug = 'letgo';

  protected async fetchListings(keywords: string[], options?: ProviderSearchOptions): Promise<RawListing[]> {
    const limit = options?.limit ?? 20;

    try {
      const scraped = await searchLetgoKeywords(keywords, limit);
      return scraped.map((item) => this.toRawListing(item));
    } catch {
      return [];
    }
  }

  protected async fetchListing(externalId: string): Promise<RawListing | null> {
    const productId = externalId.replace(/^letgo-/, '');

    try {
      const results = await searchLetgoKeywords([productId], 10);
      const match =
        results.find((r) => r.externalId === productId) ??
        results.find((r) => r.url.includes(`-iid-${productId}`));

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
      city: item.city ?? 'Istanbul',
      district: item.district ?? item.city ?? 'Istanbul',
      listingDate: item.listingDate,
      condition: item.condition,
      sellerName: item.sellerName?.trim() || 'Letgo Satıcı',
      sellerVerified: false,
    };
  }
}
