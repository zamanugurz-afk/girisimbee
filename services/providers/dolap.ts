import 'server-only';

import type { RawListing } from '@/types';
import type { ProviderSearchOptions } from './provider-service.interface';
import { BaseProviderService } from './base-provider-service';
import { searchDolapKeywords, searchDolap } from './dolap-fetch.server';

/**
 * Dolap provider adapter — fetches real listings from dolap.com search results.
 *
 * Product URLs come directly from the `href` on each search result card
 * (e.g. https://dolap.com/urun/ps-pazar-beyaz-playstation-...-472434927).
 * They are never constructed from listing or product IDs.
 */
export class DolapProviderService extends BaseProviderService {
  readonly providerSlug = 'dolap';

  protected async fetchListings(keywords: string[], options?: ProviderSearchOptions): Promise<RawListing[]> {
    const limit = options?.limit ?? 20;

    try {
      const scraped = await searchDolapKeywords(keywords, limit);
      return scraped.map((item) => this.toRawListing(item));
    } catch {
      return [];
    }
  }

  protected async fetchListing(externalId: string): Promise<RawListing | null> {
    const productId = externalId.replace(/^dolap-/, '');

    try {
      const results = await searchDolap(productId, 10);
      const match =
        results.find((r) => r.externalId === productId) ??
        results.find((r) => r.url.endsWith(`-${productId}`));

      if (!match) return null;
      return this.toRawListing(match);
    } catch {
      return null;
    }
  }

  private toRawListing(item: {
    externalId: string;
    title: string;
    price: number;
    url: string;
    imageUrls: string[];
    description?: string;
    condition?: string;
    sellerName?: string;
  }): RawListing {
    return {
      externalId: item.externalId,
      title: item.title,
      price: item.price,
      currency: 'TRY',
      url: item.url,
      imageUrls: item.imageUrls,
      description: item.description,
      city: 'Istanbul',
      condition: item.condition,
      sellerName: item.sellerName,
      sellerVerified: false,
    };
  }
}

export const dolapProvider = new DolapProviderService();
