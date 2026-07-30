/**
 * Letgo HTML parser (no Node built-ins).
 */

import type { ScrapedListing } from './scraper-types';
import { DEFAULT_SYNC_SEARCH_KEYWORD } from '@/config/product-catalog';
import { parseTurkishPrice, resolveAbsoluteUrl, unescapeEmbeddedUrl } from './scraper-utils';

const ORIGIN = 'https://www.letgo.com';
const SEARCH_URL = `${ORIGIN}/arama`;

export async function searchLetgo(keyword: string, limit = 20): Promise<ScrapedListing[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(keyword)}`;
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
    throw new Error(`Letgo search failed (${response.status}) for ${url}`);
  }

  return parseLetgoSearchHtml(await response.text(), limit);
}

export function parseLetgoSearchHtml(html: string, limit: number): ScrapedListing[] {
  if (
    html.includes('Challenge Validation') ||
    html.includes('Just a moment') ||
    /access denied/i.test(html)
  ) {
    return [];
  }

  const fromNextData = parseLetgoNextData(html, limit);
  if (fromNextData.length > 0) return fromNextData;

  const normalized = unescapeEmbeddedUrl(html);
  const results: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const listing of parseLetgoGridCards(normalized, limit)) {
    if (seen.has(listing.externalId)) continue;
    seen.add(listing.externalId);
    results.push(listing);
    if (results.length >= limit) return results;
  }

  for (const listing of parseLetgoCarouselCards(normalized, limit)) {
    if (seen.has(listing.externalId)) continue;
    seen.add(listing.externalId);
    results.push(listing);
    if (results.length >= limit) return results;
  }

  return results;
}

/** Main search grid cards — include title, price, image, and location. */
function parseLetgoGridCards(html: string, limit: number): ScrapedListing[] {
  const results: ScrapedListing[] = [];
  const anchorPattern =
    /<a\b(?=[^>]*href="(\/item\/[^"]+-iid-(\d+))")(?=[^>]*class="[^"]*absolute inset-0 z-2[^"]*")[^>]*>([\s\S]{0,800}?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    if (results.length >= limit) break;

    const anchorIndex = match.index ?? 0;
    const block = html.slice(Math.max(0, anchorIndex - 3500), anchorIndex + 800);
    const listingUrl = resolveAbsoluteUrl(match[1], ORIGIN);
    const externalId = match[2];

    const title =
      match[3].match(/class="sr-only"[^>]*>([^<]{3,300})</i)?.[1]?.replace(/\s+/g, ' ').trim() ||
      match[3].match(/>([^<]{5,200})<\//)?.[1]?.replace(/\s+/g, ' ').trim() ||
      '';
    if (!title || /letgo plus banner/i.test(title)) continue;

    const price = parseTurkishPrice(block);
    if (price <= 0) continue;

    const imageMatch = block.match(
      /(?:src|data-src)="(https:\/\/imvm\.letgo\.com\/v1\/files\/[^"]+)"/i,
    );
    if (!imageMatch) continue;

    const locationMatch =
      block.match(/>([^<]{2,40},\s*[^<]{2,40})</i) ||
      block.match(/"addressLocality"\s*:\s*"([^"]+)"/i);
    const { city, district } = splitLetgoLocation(decodeHtmlEntities(locationMatch?.[1] ?? ''));

    const sellerMatch =
      block.match(/font-semibold[^>]*>([^<]{2,80})</i) ||
      block.match(/"sellerName"\s*:\s*"([^"]+)"/i);

    results.push({
      externalId,
      title: decodeHtmlEntities(title),
      price,
      url: listingUrl,
      imageUrls: [imageMatch[1]],
      description: title,
      city,
      district,
      sellerName: sellerMatch?.[1]?.trim(),
    });
  }

  return results;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Plus carousel cards — price is usually absent on search cards. */
function parseLetgoCarouselCards(html: string, limit: number): ScrapedListing[] {
  const results: ScrapedListing[] = [];
  const cardPattern =
    /href="(\/item\/[^"]+-iid-(\d+))"[\s\S]{0,5000}?data-slot="item-card"|<\/a>[\s\S]{0,200}?data-slot="item-card"[\s\S]{0,5000}?href="(\/item\/[^"]+-iid-(\d+))"/gi;

  for (const match of html.matchAll(cardPattern)) {
    if (results.length >= limit) break;

    const rawHref = match[1] ?? match[3];
    const externalId = match[2] ?? match[4];
    if (!rawHref || !externalId) continue;

    const block = match[0];
    const listingUrl = resolveAbsoluteUrl(rawHref, ORIGIN);

    const title =
      block.match(/data-slot="item-card-image"[\s\S]{0,1200}?alt="([^"]{3,300})"/i)?.[1]?.trim() ||
      block.match(/aria-label="([^"]{5,200})"/i)?.[1]?.trim() ||
      '';
    if (!title || /letgo plus banner/i.test(title)) continue;

    const price = parseTurkishPrice(block);
    if (price <= 0) continue;

    const imageMatch = block.match(
      /(?:src|data-src)="(https:\/\/imvm\.letgo\.com\/v1\/files\/[^"]+)"/i,
    );
    if (!imageMatch) continue;

    const sellerName = block.match(/font-semibold[^>]*>([^<]{2,80})</i)?.[1]?.trim();
    const { city, district } = splitLetgoLocation('');

    results.push({
      externalId,
      title,
      price,
      url: listingUrl,
      imageUrls: [imageMatch[1]],
      description: title,
      city,
      district,
      sellerName,
    });
  }

  return results;
}

function splitLetgoLocation(raw: string): { city: string; district: string } {
  const cleaned = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return { city: 'Istanbul', district: 'Istanbul' };

  const parts = cleaned.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0], district: parts[1] };
  }

  return { city: parts[0] || 'Istanbul', district: parts[0] || 'Istanbul' };
}

function parseLetgoNextData(html: string, limit: number): ScrapedListing[] {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match?.[1]) return [];

  let payload: unknown;
  try {
    payload = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const items = findLetgoListingNodes(payload);
  const results: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (results.length >= limit) break;
    if (!item || typeof item !== 'object') continue;

    const record = item as Record<string, unknown>;
    const id = String(record.id ?? record.adId ?? record.listingId ?? '').trim();
    const slug = String(record.slug ?? record.urlSlug ?? '').trim();
    const title = String(record.title ?? record.name ?? '').trim();
    const priceRaw = record.price ?? record.price_value ?? record.priceValue;
    const price =
      typeof priceRaw === 'number'
        ? priceRaw
        : parseTurkishPrice(String(priceRaw ?? record.price_display ?? ''));

    const images = collectLetgoImages(record);
    const sellerName = String(
      (record.user as Record<string, unknown> | undefined)?.name ??
        record.sellerName ??
        record.user_name ??
        '',
    ).trim();

    const city = String(record.city ?? record.city_name ?? 'Istanbul').trim() || 'Istanbul';
    const district = String(record.district ?? record.location ?? record.address ?? city).trim() || city;
    const listingDate = String(record.created_at ?? record.createdAt ?? record.date ?? '').trim() || undefined;

    const urlFromRecord = String(record.url ?? record.path ?? '').trim();
    let url = urlFromRecord.startsWith('http')
      ? urlFromRecord
      : slug && id
        ? `${ORIGIN}/item/${slug}-iid-${id}`
        : id
          ? `${ORIGIN}/item/iid-${id}`
          : '';

    if (!url.includes('-iid-') && id) {
      url = `${ORIGIN}/item/${slug || 'listing'}-iid-${id}`;
    }

    if (!id || !title || price <= 0 || !url || images.length === 0) continue;
    if (seen.has(id)) continue;
    seen.add(id);

    results.push({
      externalId: id,
      title,
      price,
      url,
      imageUrls: images,
      description: title,
      city,
      district,
      listingDate,
      sellerName,
    });
  }

  return results;
}

function findLetgoListingNodes(payload: unknown): unknown[] {
  const found: unknown[] = [];

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const entry of node) visit(entry);
      return;
    }

    const record = node as Record<string, unknown>;
    const hasListingShape =
      (record.id || record.adId || record.listingId) &&
      (record.title || record.name) &&
      (record.price || record.price_value || record.priceValue);

    if (hasListingShape) found.push(record);

    for (const value of Object.values(record)) visit(value);
  };

  visit(payload);
  return found;
}

function collectLetgoImages(record: Record<string, unknown>): string[] {
  const imagesRaw = record.images ?? record.image_urls ?? record.imageUrls;
  if (Array.isArray(imagesRaw)) {
    return imagesRaw
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          const obj = entry as Record<string, unknown>;
          return String(obj.url ?? obj.large ?? obj.medium ?? obj.thumbnail ?? '');
        }
        return '';
      })
      .filter((url) => url.startsWith('http'));
  }

  const single = String(record.image ?? record.imageUrl ?? record.thumbnail ?? '').trim();
  return single.startsWith('http') ? [single] : [];
}

export async function searchLetgoKeywords(
  keywords: string[],
  limit = 20,
): Promise<ScrapedListing[]> {
  const searchTerms = keywords.length > 0 ? keywords : [DEFAULT_SYNC_SEARCH_KEYWORD];
  const perKeyword = Math.max(5, Math.ceil(limit / searchTerms.length));
  const merged: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const keyword of searchTerms) {
    const batch = await searchLetgo(keyword, perKeyword);
    for (const listing of batch) {
      if (seen.has(listing.externalId)) continue;
      seen.add(listing.externalId);
      merged.push(listing);
      if (merged.length >= limit) return merged;
    }
  }

  return merged;
}
