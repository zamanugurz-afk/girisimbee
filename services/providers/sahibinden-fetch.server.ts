import 'server-only';

import { parseSahibindenSearchHtml } from './sahibinden-scraper';
import { fetchMarketplaceHtmlBrowser } from './marketplace-browser-fetch.server';
import { fetchMarketplaceHtmlServer } from './marketplace-fetch.server';
import { mergeKeywordResults } from './scraper-utils';
import type { ScrapedListing } from './scraper-types';

const ORIGIN = 'https://www.sahibinden.com';
const SEARCH_URL = `${ORIGIN}/kelime-ile-ara`;

function isBlockedHtml(html: string): boolean {
  return (
    html.length < 500 ||
    /Just a moment|olağan dışı erişim|cloudflare|cf-browser-verification/i.test(html) ||
    !html.includes('/ilan/')
  );
}

async function fetchSahibindenSearchHtml(keyword: string): Promise<string> {
  const url = `${SEARCH_URL}?query=${encodeURIComponent(keyword)}`;

  const browserHtml = await fetchMarketplaceHtmlBrowser(url, {
    referer: ORIGIN,
    waitForUrlPattern: /\/ilan\/[^"]+\/detay/,
    timeoutMs: 60000,
  });
  if (!isBlockedHtml(browserHtml)) return browserHtml;

  const httpHtml = await fetchMarketplaceHtmlServer(url, {
    referer: ORIGIN,
    softFail: true,
    successMarker: '/ilan/',
  });
  return httpHtml;
}

export async function searchSahibinden(keyword: string, limit = 20): Promise<ScrapedListing[]> {
  const html = await fetchSahibindenSearchHtml(keyword);
  if (!html) return [];
  return parseSahibindenSearchHtml(html, limit);
}

export async function searchSahibindenKeywords(
  keywords: string[],
  limit = 20,
): Promise<ScrapedListing[]> {
  return mergeKeywordResults(keywords, limit, searchSahibinden);
}

export type { ScrapedListing };
