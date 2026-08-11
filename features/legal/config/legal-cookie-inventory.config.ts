/**
 * Technical cookie inventory — only cookies evidenced in code.
 * Runtime Supabase auth cookie names may vary; listed as category.
 */

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export type CookieInventoryItem = {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  category: CookieCategory;
  duration: string;
  party: 'first' | 'third';
  required: boolean;
  consentRequired: boolean;
  crossBorder: 'pending_verification' | 'unlikely' | 'not_applicable';
};

export const LEGAL_COOKIE_INVENTORY: readonly CookieInventoryItem[] = [
  {
    id: 'gc_oauth_next',
    name: 'gc_oauth_next',
    provider: 'Girisimbee',
    purpose: 'OAuth sonrası yönlendirme yolunu kısa süreli saklar',
    category: 'necessary',
    duration: '600 saniye',
    party: 'first',
    required: true,
    consentRequired: false,
    crossBorder: 'not_applicable',
  },
  {
    id: 'supabase_auth',
    name: 'Supabase Auth oturum çerezleri (sb-*)',
    provider: 'Supabase / Girisimbee',
    purpose: 'Oturum ve kimlik doğrulama',
    category: 'necessary',
    duration: 'Teknik olarak doğrulanamadı (sağlayıcı oturum politikası)',
    party: 'first',
    required: true,
    consentRequired: false,
    crossBorder: 'pending_verification',
  },
  {
    id: 'theme',
    name: 'next-themes / tema tercihi (varsa)',
    provider: 'Girisimbee',
    purpose: 'Açık/koyu tema tercihi',
    category: 'functional',
    duration: 'Teknik olarak doğrulanamadı',
    party: 'first',
    required: false,
    consentRequired: true,
    crossBorder: 'not_applicable',
  },
] as const;

/** Categories actually used today (analytics/marketing scripts not present). */
export const ACTIVE_COOKIE_CATEGORIES: readonly CookieCategory[] = [
  'necessary',
  'functional',
] as const;
