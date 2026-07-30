import 'server-only';

import { parseDolapSearchHtml, type DolapScrapedListing } from './dolap-scraper';
import { fetchMarketplaceHtmlBrowser } from './marketplace-browser-fetch.server';
import { fetchMarketplaceHtmlServer } from './marketplace-fetch.server';
import { mergeKeywordResults } from './scraper-utils';

export type { DolapScrapedListing } from './dolap-scraper';

const SEARCH_URL = 'https://dolap.com/ara';

async function fetchDolapSearchHtml(keyword: string): Promise<string> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(keyword)}`;

  try {
    const html = await fetchMarketplaceHtmlServer(url, {
      referer: 'https://dolap.com/',
      successMarker: 'col-xs-6 col-md-4',
    });
    if (html.includes('col-xs-6 col-md-4')) return html;
  } catch {
    // fall through to browser fetch
  }

  return fetchMarketplaceHtmlBrowser(url, {
    referer: 'https://dolap.com/',
    waitForSelector: '.col-xs-6.col-md-4',
    timeoutMs: 45000,
  });
}

export async function searchDolap(keyword: string, limit = 20): Promise<DolapScrapedListing[]> {
  const html = await fetchDolapSearchHtml(keyword);
  if (!html) return [];
  return parseDolapSearchHtml(html, limit);
}

export async function searchDolapKeywords(
  keywords: string[],
  limit = 20,
): Promise<DolapScrapedListing[]> {
  return mergeKeywordResults(keywords, limit, searchDolap);
}
