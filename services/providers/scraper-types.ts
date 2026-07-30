/**
 * Shared scraper result shape used by all marketplace providers.
 * Safe to import from Deno edge functions (no Node built-ins).
 */

export interface ScrapedListing {
  externalId: string;
  title: string;
  price: number;
  url: string;
  imageUrls: string[];
  description?: string;
  city?: string;
  district?: string;
  listingDate?: string;
  condition?: string;
  sellerName?: string;
}

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
