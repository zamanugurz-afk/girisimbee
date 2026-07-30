/**
 * Dolap HTML parser and fetch-only scraper (no Node built-ins).
 * Safe to import from Deno edge functions. For Node sync with curl
 * fallback, use dolap-fetch.server.ts instead.
 */

import { extractText, parseTurkishPrice } from './scraper-utils';
import { DEFAULT_SYNC_SEARCH_KEYWORD } from '@/config/product-catalog';

export interface DolapScrapedListing {
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

const DOLAP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SEARCH_URL = 'https://dolap.com/ara';

export async function fetchDolapHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': DOLAP_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      Referer: 'https://dolap.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`Dolap search failed (${response.status}) for ${url}`);
  }

  return response.text();
}

export async function searchDolap(keyword: string, limit = 20): Promise<DolapScrapedListing[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(keyword)}`;
  const html = await fetchDolapHtml(url);
  return parseDolapSearchHtml(html, limit);
}

export async function searchDolapKeywords(
  keywords: string[],
  limit = 20,
): Promise<DolapScrapedListing[]> {
  const searchTerms = keywords.length > 0 ? keywords : [DEFAULT_SYNC_SEARCH_KEYWORD];
  const perKeyword = Math.max(5, Math.ceil(limit / searchTerms.length));
  const merged: DolapScrapedListing[] = [];
  const seen = new Set<string>();

  for (const keyword of searchTerms) {
    const batch = await searchDolap(keyword, perKeyword);
    for (const listing of batch) {
      if (seen.has(listing.externalId)) continue;
      seen.add(listing.externalId);
      merged.push(listing);
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}

/** Parse listing cards from Dolap search results HTML. */
export function parseDolapSearchHtml(html: string, limit: number): DolapScrapedListing[] {
  const blocks = html.split('<div class="col-xs-6 col-md-4">').slice(1);
  const results: DolapScrapedListing[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    if (results.length >= limit) break;

    const urlMatch = block.match(/<a rel="nofollow" href="(https:\/\/dolap\.com\/urun\/[^"]+)"/);
    if (!urlMatch) continue;

    const productUrl = urlMatch[1];
    const productIdMatch = block.match(/data-product-id="(\d+)"/);
    const productId =
      productIdMatch?.[1] ?? productUrl.match(/-(\d+)(?:\?|$|")/)?.[1];
    if (!productId || seen.has(productId)) continue;
    if (!productUrl.includes(`-${productId}`)) continue;
    seen.add(productId);

    const titleBlock = block.match(/<div class="title-info-block">([\s\S]*?)<\/div>/);
    const titlePart = titleBlock
      ? extractText(titleBlock[1], /<span class="title">\s*([\s\S]*?)\s*<\/span>/)
      : '';
    const detailPart = titleBlock
      ? extractText(titleBlock[1], /<span class="detail">([\s\S]*?)<\/span>/)
      : '';
    const title = [titlePart, detailPart].filter(Boolean).join(' ').trim();
    if (!title) continue;

    const priceText = extractText(block, /<span class="price">([\s\S]*?)<\/span>/);
    const price = parseTurkishPrice(priceText);
    if (price <= 0) continue;

    const imgBlock = block.match(/<div class="img-block">([\s\S]*?)<\/div>\s*<div class="detail-footer">/);
    const imageMatch = imgBlock?.[1]?.match(/data-srcset="(https:\/\/[^"]+)"/);
    const imageUrls = imageMatch ? [imageMatch[1]] : [];
    if (imageUrls.length === 0) continue;

    const sellerMatch = block.match(/<a href="https:\/\/dolap\.com\/profil\/([^"]+)"/);
    const sellerName = sellerMatch?.[1];
    if (!sellerName) continue;

    const isNew =
      block.includes('Yeni &amp; Etiketli') || block.includes('Yeni & Etiketli');

    results.push({
      externalId: productId,
      title,
      price,
      url: productUrl,
      imageUrls,
      description: title,
      city: 'Istanbul',
      district: 'Istanbul',
      condition: isNew ? 'new' : undefined,
      sellerName,
    });
  }

  return results;
}

export { parseTurkishPrice };
