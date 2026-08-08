/**
 * Public site origin for auth redirects and metadata.
 * Vercel Preview: uses VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset.
 */
export function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

/**
 * Canonical public origin for robots.txt / sitemap.xml.
 * Keeps production fallback on the public domain; preview uses VERCEL_URL.
 */
export function resolveCanonicalSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  if (process.env.VERCEL_ENV === 'preview') {
    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://girisimbee.com';
}
