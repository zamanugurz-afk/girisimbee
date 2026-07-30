import type { RawListing } from '@/types';

export type MarketplaceProviderSlug = 'sahibinden' | 'letgo' | 'dolap';

export type SourceUrlStatus = 'valid' | 'invalid' | 'unchecked';

export interface ListingUrlValidationResult {
  valid: boolean;
  issue?: string;
}

export interface ListingIngestValidationResult {
  accepted: boolean;
  issues: string[];
}

const PLACEHOLDER_EXTERNAL_ID = /^(?:listing-\d+|(?:sahibinden|letgo|dolap)-ext-\d+)$/i;
const PLACEHOLDER_URL =
  /(?:example\.com|\/item\/listing-|\/ilan\/listing-|mock|placeholder|\/urun\/listing-)/i;

const PROVIDER_HOSTS: Record<MarketplaceProviderSlug, readonly string[]> = {
  sahibinden: ['www.sahibinden.com', 'sahibinden.com'],
  letgo: ['www.letgo.com', 'letgo.com'],
  dolap: ['dolap.com', 'www.dolap.com'],
};

function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractProviderExternalId(
  providerSlug: MarketplaceProviderSlug,
  url: string,
): string | null {
  switch (providerSlug) {
    case 'sahibinden':
      return url.match(/\/ilan\/[^/]+-(\d+)\/detay/i)?.[1] ?? null;
    case 'letgo':
      return url.match(/-iid-(\d+)/i)?.[1] ?? null;
    case 'dolap':
      return url.match(/\/urun\/[^/]+-(\d+)(?:\/?(?:\?|$)|$)/i)?.[1] ?? null;
    default:
      return null;
  }
}

function matchesProviderPath(
  providerSlug: MarketplaceProviderSlug,
  pathname: string,
): boolean {
  switch (providerSlug) {
    case 'sahibinden':
      return /^\/ilan\/[^/]+-\d+\/detay\/?$/i.test(pathname);
    case 'letgo':
      return /^\/item\/[^/]+-iid-\d+\/?$/i.test(pathname);
    case 'dolap':
      return /^\/urun\/[^/]+-\d+\/?$/i.test(pathname);
    default:
      return false;
  }
}

export function isPlaceholderListingUrl(url: string, externalListingId?: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || PLACEHOLDER_URL.test(trimmed)) return true;
  if (externalListingId && PLACEHOLDER_EXTERNAL_ID.test(externalListingId.trim())) return true;
  return false;
}

export function validateMarketplaceListingUrl(
  providerSlug: string,
  url: string,
  externalListingId: string,
): ListingUrlValidationResult {
  const slug = providerSlug as MarketplaceProviderSlug;
  const trimmedUrl = url.trim();
  const trimmedId = externalListingId.trim();

  if (!trimmedId) {
    return { valid: false, issue: 'missing_external_listing_id' };
  }

  if (PLACEHOLDER_EXTERNAL_ID.test(trimmedId)) {
    return { valid: false, issue: 'placeholder_external_listing_id' };
  }

  if (!trimmedUrl) {
    return { valid: false, issue: 'missing_source_url' };
  }

  if (isPlaceholderListingUrl(trimmedUrl, trimmedId)) {
    return { valid: false, issue: 'placeholder_source_url' };
  }

  const parsed = parseHttpUrl(trimmedUrl);
  if (!parsed) {
    return { valid: false, issue: 'invalid_url_format' };
  }

  const allowedHosts = PROVIDER_HOSTS[slug];
  if (!allowedHosts) {
    return { valid: false, issue: 'unknown_provider' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!allowedHosts.includes(hostname)) {
    return { valid: false, issue: 'wrong_marketplace_domain' };
  }

  const pathname = parsed.pathname.endsWith('/') && parsed.pathname.length > 1
    ? parsed.pathname.slice(0, -1)
    : parsed.pathname;

  if (!matchesProviderPath(slug, pathname)) {
    return { valid: false, issue: 'invalid_marketplace_path' };
  }

  const idFromUrl = extractProviderExternalId(slug, trimmedUrl);
  if (!idFromUrl) {
    return { valid: false, issue: 'external_id_not_in_url' };
  }

  if (idFromUrl !== trimmedId) {
    return { valid: false, issue: 'external_id_url_mismatch' };
  }

  return { valid: true };
}

export function isOpenableMarketplaceUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || isPlaceholderListingUrl(trimmed)) return false;

  const parsed = parseHttpUrl(trimmed);
  if (!parsed) return false;

  const hostname = parsed.hostname.toLowerCase();
  if (hostname.includes('sahibinden.com')) {
    return validateMarketplaceListingUrl(
      'sahibinden',
      trimmed,
      extractProviderExternalId('sahibinden', trimmed) ?? '',
    ).valid;
  }
  if (hostname.includes('letgo.com')) {
    return validateMarketplaceListingUrl(
      'letgo',
      trimmed,
      extractProviderExternalId('letgo', trimmed) ?? '',
    ).valid;
  }
  if (hostname.includes('dolap.com')) {
    return validateMarketplaceListingUrl(
      'dolap',
      trimmed,
      extractProviderExternalId('dolap', trimmed) ?? '',
    ).valid;
  }

  return false;
}

export function validateRawListingForIngest(
  raw: RawListing,
  providerSlug: string,
): ListingIngestValidationResult {
  const issues: string[] = [];

  const title = raw.title?.trim() ?? '';
  if (title.length < 3) issues.push('missing_title');

  if (!Number.isFinite(raw.price) || raw.price <= 0) issues.push('missing_price');

  const externalId = String(raw.externalId ?? '').trim();
  if (!externalId) issues.push('missing_external_listing_id');

  const url = raw.url?.trim() ?? '';
  const urlCheck = validateMarketplaceListingUrl(providerSlug, url, externalId);
  if (!urlCheck.valid) issues.push(urlCheck.issue ?? 'invalid_source_url');

  const images = Array.isArray(raw.imageUrls)
    ? raw.imageUrls.filter((item) => typeof item === 'string' && item.startsWith('http'))
    : [];
  if (images.length === 0) issues.push('missing_images');

  const seller = raw.sellerName?.trim() ?? '';
  if (!seller) issues.push('missing_seller');

  const location = raw.district?.trim() || raw.city?.trim() || '';
  if (!location) issues.push('missing_location');

  return {
    accepted: issues.length === 0,
    issues,
  };
}

export function auditStoredListing(input: {
  provider_slug?: string | null;
  external_listing_id?: string | null;
  url?: string | null;
  source_url?: string | null;
}): ListingUrlValidationResult {
  const providerSlug = input.provider_slug?.trim();
  const externalId = input.external_listing_id?.trim() ?? '';
  const sourceUrl = input.source_url?.trim() || input.url?.trim() || '';

  if (!providerSlug) {
    return { valid: false, issue: 'missing_provider' };
  }

  return validateMarketplaceListingUrl(providerSlug, sourceUrl, externalId);
}
