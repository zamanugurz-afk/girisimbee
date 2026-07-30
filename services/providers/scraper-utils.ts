/**
 * Shared HTML/JSON parsing helpers for marketplace scrapers.
 * No Node built-ins — safe for Deno edge functions.
 */

import { DEFAULT_SYNC_SEARCH_KEYWORD } from '@/config/product-catalog';
import type { ScrapedListing } from './scraper-types';

export function extractText(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  if (!match?.[1]) return '';
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/** Parse Turkish lira prices like "31.000 TL" or "850 TL 500 TL" (sale). */
export function parseTurkishPrice(text: string): number {
  const cleaned = text.replace(/<[^>]+>/g, '').trim();
  const parts = cleaned.match(/([\d.]+)\s*TL/gi);
  if (!parts || parts.length === 0) return 0;

  const last = parts[parts.length - 1];
  const num = last.match(/([\d.]+)/)?.[1];
  if (!num) return 0;
  return parseInt(num.replace(/\./g, ''), 10);
}

export function slugToTitle(slug: string): string {
  const base = slug.replace(/-[a-f0-9]{16}$/i, '');
  return base
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Turn a relative marketplace href into an absolute URL using the site origin. */
export function resolveAbsoluteUrl(href: string, origin: string): string {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  const base = origin.replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export function mergeKeywordResults(
  keywords: string[],
  limit: number,
  searchFn: (keyword: string, perKeywordLimit: number) => Promise<ScrapedListing[]>,
  fallbackKeyword = DEFAULT_SYNC_SEARCH_KEYWORD,
): Promise<ScrapedListing[]> {
  const searchTerms = keywords.length > 0 ? keywords : [fallbackKeyword];
  const perKeyword = Math.max(5, Math.ceil(limit / searchTerms.length));

  return (async () => {
    const merged: ScrapedListing[] = [];
    const seen = new Set<string>();

    for (const keyword of searchTerms) {
      const batch = await searchFn(keyword, perKeyword);
      for (const listing of batch) {
        if (seen.has(listing.externalId)) continue;
        seen.add(listing.externalId);
        merged.push(listing);
        if (merged.length >= limit) return merged;
      }
    }

    return merged;
  })();
}

/** Unescape JSON-style escaped slashes in embedded HTML/JSON payloads. */
export function unescapeEmbeddedUrl(url: string): string {
  return url.replace(/\\\//g, '/').replace(/\\u002F/gi, '/');
}
