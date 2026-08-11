import type { CookieOptionsWithName } from '@supabase/ssr';

/**
 * Prefer host-only auth cookies.
 *
 * Sharing Domain=.girisimbee.com across apex/www caused duplicate cookie scopes:
 * login looked successful, then refresh/middleware read a stale/empty jar and the
 * header stayed on "Giriş Yap". Apex already 308s to www, so host-only on www is enough.
 */
export function resolveAuthCookieDomain(
  _hostname: string | null | undefined,
): string | undefined {
  return undefined;
}

/** Domains we used historically — sign-out must still clear them. */
export function legacyAuthCookieDomains(): string[] {
  return ['.girisimbee.com', '.girisimbee.tr', '.girisimbee.com.tr'];
}

export function authCookieOptions(hostname: string | null | undefined): CookieOptionsWithName {
  const domain = resolveAuthCookieDomain(hostname);
  return {
    path: '/',
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
  };
}
