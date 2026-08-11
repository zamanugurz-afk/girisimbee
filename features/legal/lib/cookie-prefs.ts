const STORAGE_KEY = 'gc.legal.cookie_prefs.v1';

export type CookiePrefs = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const DEFAULT_COOKIE_PREFS: CookiePrefs = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  updatedAt: '',
};

export function readCookiePrefs(): CookiePrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePrefs;
    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || '',
    };
  } catch {
    return null;
  }
}

export function writeCookiePrefs(
  prefs: Omit<CookiePrefs, 'necessary' | 'updatedAt'> & Partial<CookiePrefs>,
) {
  const next: CookiePrefs = {
    necessary: true,
    functional: Boolean(prefs.functional),
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('gc:cookie-prefs', { detail: next }));
  return next;
}

export function openCookiePreferences() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('gc:open-cookie-prefs'));
}
