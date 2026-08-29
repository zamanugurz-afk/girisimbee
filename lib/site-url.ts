/**
 * Canonical production origin (Vercel redirects apex → www).
 * Auth cookies / OAuth redirectTo must stay on this host — never bounce
 * to *.vercel.app once the custom domain is live (splits PKCE + sessions).
 */
const CANONICAL_SITE_ORIGIN = 'https://www.girisimbee.com';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '');
}

/** Apex and www share one cookie jar target: www. */
export function canonicalizeSiteOrigin(origin: string): string {
  const normalized = normalizeOrigin(origin).toLowerCase();
  if (
    normalized === 'https://girisimbee.com'
    || normalized === 'https://www.girisimbee.com'
  ) {
    return CANONICAL_SITE_ORIGIN;
  }
  return normalizeOrigin(origin);
}

/**
 * Public site origin for auth redirects and absolute links.
 * Vercel Preview: uses VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset.
 */
export function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && (configured.startsWith('http://') || configured.startsWith('https://'))) {
    return canonicalizeSiteOrigin(configured);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && !vercelUrl.includes('[') && !vercelUrl.includes(']')) {
    const host = vercelUrl.replace(/\/$/, '');
    if (process.env.VERCEL_ENV === 'production') return CANONICAL_SITE_ORIGIN;
    return `https://${host}`;
  }

  if (process.env.NODE_ENV === 'production') {
    return CANONICAL_SITE_ORIGIN;
  }

  return 'http://localhost:3000';
}

/**
 * Canonical public origin for robots.txt / sitemap.xml.
 * Keeps production fallback on the public domain; preview uses VERCEL_URL.
 */
export function resolveCanonicalSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normalizeOrigin(configured);

  if (process.env.VERCEL_ENV === 'preview') {
    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return CANONICAL_SITE_ORIGIN;
}

/**
 * Browser auth origin must match the page origin (PKCE verifier is origin-scoped).
 * Do not rewrite apex→www here — that would put redirectTo on www while the
 * code-verifier cookie stays on apex. Vercel already 308s apex → www for documents.
 */
export function resolveAuthSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return normalizeOrigin(window.location.origin);
  }
  return resolveSiteUrl();
}
