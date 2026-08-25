import { describe, expect, it } from 'vitest';
import { getSafeRedirectUrl } from './safe-redirect';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

describe('getSafeRedirectUrl — Post-login redirect sanitizer', () => {
  it('defaults to home / when target is null, undefined, or empty', () => {
    expect(getSafeRedirectUrl(null)).toBe('/');
    expect(getSafeRedirectUrl(undefined)).toBe('/');
    expect(getSafeRedirectUrl('')).toBe('/');
    expect(getSafeRedirectUrl('   ')).toBe('/');
  });

  it('allows safe relative internal routes', () => {
    expect(getSafeRedirectUrl('/ilan/yazilim-uzmani-123')).toBe('/ilan/yazilim-uzmani-123');
    expect(getSafeRedirectUrl('/dashboard/kariyer-profilim')).toBe('/dashboard/kariyer-profilim');
    expect(getSafeRedirectUrl('/kesfet?cat=is-bul')).toBe('/kesfet?cat=is-bul');
    expect(getSafeRedirectUrl('/mesajlarim?c=conv-456')).toBe('/mesajlarim?c=conv-456');
  });

  it('rejects external absolute URLs and falls back to /', () => {
    expect(getSafeRedirectUrl('https://evil.com')).toBe('/');
    expect(getSafeRedirectUrl('http://attacker.com/steal')).toBe('/');
    expect(getSafeRedirectUrl('ftp://example.com')).toBe('/');
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('/');
  });

  it('rejects protocol-relative and backslash bypass attempts', () => {
    expect(getSafeRedirectUrl('//evil.com')).toBe('/');
    expect(getSafeRedirectUrl('///evil.com')).toBe('/');
    expect(getSafeRedirectUrl('/\\evil.com')).toBe('/');
    expect(getSafeRedirectUrl('/test\\path')).toBe('/');
  });

  it('rejects auth loop URLs (/giris, /kayit, /sifremi-unuttum) and falls back to /', () => {
    expect(getSafeRedirectUrl(AUTH_ROUTES.login)).toBe('/');
    expect(getSafeRedirectUrl(AUTH_ROUTES.register)).toBe('/');
    expect(getSafeRedirectUrl(AUTH_ROUTES.forgotPassword)).toBe('/');
    expect(getSafeRedirectUrl('/giris?next=/giris')).toBe('/');
  });

  it('respects custom fallback if provided and target is invalid', () => {
    expect(getSafeRedirectUrl('https://evil.com', '/custom-fallback')).toBe('/custom-fallback');
    expect(getSafeRedirectUrl(null, '/custom-fallback')).toBe('/custom-fallback');
  });
});
