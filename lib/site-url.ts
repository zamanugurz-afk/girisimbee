/**
 * Public site origin for auth redirects.
 * Prefer the request origin in the browser; on the server avoid unstable
 * custom domains until DNS is ready (use girisimbee.vercel.app).
 */
const STABLE_AUTH_ORIGIN = 'https://girisimbee.vercel.app';
const UNSTABLE_ORIGINS = new Set([
  'https://girisimbee.com',
  'https://www.girisimbee.com',
  'https://girisimbee.tr',
  'https://www.girisimbee.tr',
  'https://girisimbee.com.tr',
  'https://www.girisimbee.com.tr',
]);

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '');
}

function isUnstableOrigin(origin: string): boolean {
  return UNSTABLE_ORIGINS.has(normalizeOrigin(origin).toLowerCase());
}

/**
 * Public site origin for auth redirects and absolute links.
 * Vercel Preview: uses VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset.
 */
export function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const origin = normalizeOrigin(configured);
    // Custom domain DNS is not ready — keep auth on the stable Vercel host.
    if (isUnstableOrigin(origin)) return STABLE_AUTH_ORIGIN;
    return origin;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.replace(/\/$/, '');
    // Prefer the stable production alias over ephemeral deployment URLs for auth.
    if (process.env.VERCEL_ENV === 'production') return STABLE_AUTH_ORIGIN;
    return `https://${host}`;
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

  return 'https://girisimbee.com';
}

/** Stable auth origin used while custom-domain DNS is incomplete. */
export function resolveAuthSiteUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = normalizeOrigin(window.location.origin);
    if (isUnstableOrigin(origin)) return STABLE_AUTH_ORIGIN;
    return origin;
  }
  return resolveSiteUrl();
}
