import type { RawListing, NormalizedListing } from '@/types';

/**
 * Converts any provider's raw response into the single common
 * Listing model that the database and UI use. Provider-specific
 * field names, currencies, and formats are resolved here so the
 * rest of the system never sees provider-specific data.
 */
export class ListingNormalizer {
  private static readonly DEFAULT_CITY = 'Istanbul';
  private static readonly DEFAULT_CONDITION = 'used';
  private static readonly DEFAULT_CURRENCY = 'TRY';

  normalize(raw: RawListing): NormalizedListing {
    return {
      external_listing_id: String(raw.externalId).trim(),
      title: this.cleanText(raw.title),
      price: this.normalizePrice(raw.price),
      currency: (raw.currency ?? ListingNormalizer.DEFAULT_CURRENCY).toUpperCase(),
      url: raw.url,
      source_url: raw.url,
      image_urls: this.normalizeImages(raw.imageUrls),
      description: raw.description ? this.cleanText(raw.description) : null,
      district: raw.district ? this.cleanText(raw.district) : ListingNormalizer.DEFAULT_CITY,
      city: raw.city ? this.cleanText(raw.city) : ListingNormalizer.DEFAULT_CITY,
      listing_date: raw.listingDate ?? null,
      condition: this.normalizeCondition(raw.condition),
      seller_display_name: raw.sellerName ? this.cleanText(raw.sellerName) : null,
      seller_rating: this.normalizeRating(raw.sellerRating),
      seller_member_since: raw.sellerMemberSince ?? null,
      seller_verified: raw.sellerVerified ?? false,
    };
  }

  normalizeMany(raws: RawListing[]): NormalizedListing[] {
    return raws.map((r) => this.normalize(r));
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private normalizePrice(price: number): number {
    const n = Math.round(price);
    return n > 0 ? n : 0;
  }

  private normalizeImages(urls?: string[]): string[] {
    if (!urls || !Array.isArray(urls)) return [];
    return urls.filter((u) => typeof u === 'string' && u.startsWith('http'));
  }

  private normalizeCondition(condition?: string): string {
    if (!condition) return ListingNormalizer.DEFAULT_CONDITION;
    const c = condition.toLowerCase().trim();
    if (c.includes('new') || c.includes('yeni') || c === 'sıfır') return 'new';
    if (c.includes('like') || c.includes('az')) return 'like-new';
    if (c.includes('good') || c.includes('iyi')) return 'good';
    if (c.includes('fair') || c.includes('kullan')) return 'fair';
    return ListingNormalizer.DEFAULT_CONDITION;
  }

  private normalizeRating(rating?: number): number | null {
    if (rating == null || isNaN(rating)) return null;
    return Math.min(5, Math.max(0, Math.round(rating * 10) / 10));
  }
}

export const listingNormalizer = new ListingNormalizer();
