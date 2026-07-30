/**
 * Sahibinden HTML parser (no Node built-ins).
 */

import { DEFAULT_SYNC_SEARCH_KEYWORD } from '@/config/product-catalog';
import type { ScrapedListing } from './scraper-types';
import { extractText, parseTurkishPrice, resolveAbsoluteUrl } from './scraper-utils';

const ORIGIN = 'https://www.sahibinden.com';
const SEARCH_URL = `${ORIGIN}/kelime-ile-ara`;

const LISTING_HREF =
  /href="((?:https:\/\/www\.sahibinden\.com)?\/ilan\/[^"]+\/detay[^"]*)"/gi;

export async function searchSahibinden(keyword: string, limit = 20): Promise<ScrapedListing[]> {
  const url = `${SEARCH_URL}?query=${encodeURIComponent(keyword)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'tr-TR,tr;q=0.9',
      Referer: ORIGIN,
    },
  });

  if (!response.ok) {
    throw new Error(`Sahibinden search failed (${response.status}) for ${url}`);
  }

  return parseSahibindenSearchHtml(await response.text(), limit);
}

export function parseSahibindenSearchHtml(html: string, limit: number): ScrapedListing[] {
  if (html.includes('Just a moment') || html.includes('olağan dışı erişim')) {
    return [];
  }

  const results: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(LISTING_HREF)) {
    if (results.length >= limit) break;

    const rawHref = match[1];
    const listingUrl = resolveAbsoluteUrl(rawHref, ORIGIN);
    const idMatch = listingUrl.match(/\/ilan\/[^/]+-(\d+)\/detay/);
    const externalId = idMatch?.[1];
    if (!externalId || seen.has(externalId)) continue;
    seen.add(externalId);

    const hrefIndex = match.index ?? 0;
    const block = html.slice(hrefIndex, hrefIndex + 2500);

    const title =
      extractText(block, /class="[^"]*classifiedTitle[^"]*"[^>]*>([\s\S]*?)<\//) ||
      extractText(block, /title="([^"]+)"/) ||
      listingUrl.split('/ilan/')[1]?.split('/')[0]?.replace(/-/g, ' ') ||
      '';
    if (!title) continue;

    const priceText =
      extractText(block, /class="[^"]*searchResultsPriceValue[^"]*"[^>]*>([\s\S]*?)<\//) ||
      extractText(block, /([\d.]+)\s*TL/);
    const price = parseTurkishPrice(priceText);
    if (price <= 0) continue;

    const imageMatch = block.match(/(?:src|data-src)="(https:\/\/[^"]*(?:shbdn|sahibinden)[^"]+)"/i);
    if (!imageMatch) continue;

    const location =
      extractText(block, /class="[^"]*searchResultsLocationValue[^"]*"[^>]*>([\s\S]*?)<\//) ||
      'Istanbul';

    const { city, district } = splitTurkishLocation(location);

    const listingDate =
      extractText(block, /class="[^"]*searchResultsDateValue[^"]*"[^>]*>([\s\S]*?)<\//) ||
      extractText(block, /(\d{1,2}\s+[A-Za-zçğıöşüÇĞİÖŞÜ]+\s+\d{4})/) ||
      undefined;

    const sellerName =
      extractText(block, /class="[^"]*seller[^"]*"[^>]*>([\s\S]*?)<\//) ||
      extractText(block, /class="[^"]*classifiedOwnerName[^"]*"[^>]*>([\s\S]*?)<\//);
    if (!sellerName) continue;

    results.push({
      externalId,
      title,
      price,
      url: listingUrl,
      imageUrls: [imageMatch[1]],
      description: title,
      city,
      district,
      listingDate,
      sellerName,
    });
  }

  return results;
}

function splitTurkishLocation(raw: string): { city: string; district: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { city: 'Istanbul', district: 'Istanbul' };

  const parts = cleaned.split('/').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { district: parts[0], city: parts[parts.length - 1] };
  }

  return { city: cleaned, district: cleaned };
}

export async function searchSahibindenKeywords(
  keywords: string[],
  limit = 20,
): Promise<ScrapedListing[]> {
  const searchTerms = keywords.length > 0 ? keywords : [DEFAULT_SYNC_SEARCH_KEYWORD];
  const perKeyword = Math.max(5, Math.ceil(limit / searchTerms.length));
  const merged: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const keyword of searchTerms) {
    const batch = await searchSahibinden(keyword, perKeyword);
    for (const listing of batch) {
      if (seen.has(listing.externalId)) continue;
      seen.add(listing.externalId);
      merged.push(listing);
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}
