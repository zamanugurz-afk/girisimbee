import 'server-only';

import { isIndexableGamingListing } from '@/lib/product-classifier';
import { parseLetgoSearchHtml } from './letgo-scraper';
import {
  fetchMarketplaceHtmlBrowser,
  fetchMarketplaceListingsBrowser,
} from './marketplace-browser-fetch.server';
import { fetchMarketplaceHtmlServer } from './marketplace-fetch.server';
import { mergeKeywordResults } from './scraper-utils';
import type { ScrapedListing } from './scraper-types';

const ORIGIN = 'https://www.letgo.com';
const SEARCH_URL = `${ORIGIN}/oyun-konsolu-ve-aksesuarlari_c15000`;

function isBlockedHtml(html: string): boolean {
  return (
    html.length < 500 ||
    /Challenge Validation|Just a moment|bm-verify|access denied|captcha/i.test(html) ||
    (!html.includes('-iid-') && !html.includes('__NEXT_DATA__'))
  );
}

function isGamingListing(listing: ScrapedListing): boolean {
  return isIndexableGamingListing({
    title: listing.title,
    description: listing.description,
    url: listing.url,
  });
}

function mergeUniqueGamingListings(listings: ScrapedListing[], limit: number): ScrapedListing[] {
  const merged: ScrapedListing[] = [];
  const seen = new Set<string>();

  for (const listing of listings) {
    if (!isGamingListing(listing)) continue;
    if (seen.has(listing.externalId)) continue;
    seen.add(listing.externalId);
    merged.push(listing);
    if (merged.length >= limit) break;
  }

  return merged;
}

const LETGO_BROWSER_OPTIONS = {
  referer: ORIGIN,
  waitForSelector: 'a.absolute.inset-0[href*="-iid-"], [data-slot="item-card"]',
  scrollBeforeExtract: true,
  timeoutMs: 60000,
} as const;

async function fetchLetgoSearchHtml(keyword: string): Promise<string> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(keyword)}`;

  const browserHtml = await fetchMarketplaceHtmlBrowser(url, {
    ...LETGO_BROWSER_OPTIONS,
    waitForText: keyword,
  });
  if (!isBlockedHtml(browserHtml)) return browserHtml;

  const httpHtml = await fetchMarketplaceHtmlServer(url, {
    referer: ORIGIN,
    softFail: true,
    successMarker: '/item/',
  });
  return httpHtml;
}

export async function searchLetgo(keyword: string, limit = 20): Promise<ScrapedListing[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(keyword)}`;
  const collected: ScrapedListing[] = [];

  const html = await fetchLetgoSearchHtml(keyword);
  if (html && !isBlockedHtml(html)) {
    collected.push(...parseLetgoSearchHtml(html, limit * 2));
  }

  try {
    const browserListings = await fetchMarketplaceListingsBrowser(url, {
      ...LETGO_BROWSER_OPTIONS,
      waitForText: keyword,
      limit: limit * 2,
    });
    collected.push(...browserListings);
  } catch {
    // Browser extraction is optional; HTML parsing may still succeed.
  }

  return mergeUniqueGamingListings(collected, limit);
}

export async function searchLetgoKeywords(
  keywords: string[],
  limit = 20,
): Promise<ScrapedListing[]> {
  return mergeKeywordResults(keywords, limit, searchLetgo);
}

export type { ScrapedListing };
