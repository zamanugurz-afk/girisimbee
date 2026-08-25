import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/**
 * Validates and sanitizes a return/redirect URL.
 * Only allows relative internal paths starting with a single '/' (e.g. /ilan/abc, /dashboard/...).
 * Rejects external URLs (https://...), protocol-relative URLs (//evil.com), and backslash tricks (/\\evil.com).
 * Defaults to '/' (AUTH_ROUTES.home) if invalid or omitted.
 */
export function getSafeRedirectUrl(target?: string | null, fallback: string = AUTH_ROUTES.home): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must start with '/' but NOT '//' or '/\'
  if (
    !trimmed.startsWith('/')
    || trimmed.startsWith('//')
    || trimmed.startsWith('/\\')
    || trimmed.includes('\\')
  ) {
    return fallback;
  }

  // Reject javascript:, data:, or other scheme injections
  if (/^[a-z0-9+.-]+:/i.test(trimmed)) {
    return fallback;
  }

  // Reject auth pages bouncing to themselves
  const pathOnly = trimmed.split('?')[0];
  if (
    pathOnly === AUTH_ROUTES.login
    || pathOnly === AUTH_ROUTES.register
    || pathOnly === AUTH_ROUTES.forgotPassword
  ) {
    return fallback;
  }

  return trimmed;
}
