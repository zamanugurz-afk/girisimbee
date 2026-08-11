import type { CookieOptionsWithName } from '@supabase/ssr';

/**
 * Share auth cookies across apex + www so PKCE code_verifier survives
 * Supabase redirects that land on either host.
 */
export function resolveAuthCookieDomain(hostname: string | null | undefined): string | undefined {
  const host = (hostname ?? '').toLowerCase().split(':')[0];
  if (host === 'girisimbee.com' || host.endsWith('.girisimbee.com')) {
    return '.girisimbee.com';
  }
  if (host === 'girisimbee.tr' || host.endsWith('.girisimbee.tr')) {
    return '.girisimbee.tr';
  }
  if (host === 'girisimbee.com.tr' || host.endsWith('.girisimbee.com.tr')) {
    return '.girisimbee.com.tr';
  }
  return undefined;
}

export function authCookieOptions(hostname: string | null | undefined): CookieOptionsWithName {
  const domain = resolveAuthCookieDomain(hostname);
  return {
    path: '/',
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
  };
}
