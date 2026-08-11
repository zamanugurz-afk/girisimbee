import { filterPremiumLabels } from '@/features/shared/config/features';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { CONTACT_MAILTO } from '@/features/shared/constants/contact';

/** Primary header navigation — marketplace browse destinations. */
export const NAV_LINKS = [
  { label: 'Keşfet', href: '/kesfet' },
  { label: 'Girişimciler', href: '/invest' },
  { label: 'İş İlanları', href: '/hire' },
  { label: 'Ortaklıklar', href: '/partners' },
  { label: 'Dijital & AI Çözümleri', href: '/dijital-ai' },
  { label: 'Franchise İlanları', href: '/franchise/buy' },
  { label: 'MARKET', href: '/market' },
] as const;

export type FooterLinkItem = { label: string; href: string };

/**
 * Footer columns aligned with live site structure:
 * Platform · Kategoriler · Hesap · İletişim (+ yasal)
 */
const FOOTER_LINKS_ALL: Record<string, FooterLinkItem[]> = {
  Platform: [
    { label: 'Ana sayfa', href: '/' },
    { label: 'Keşfet', href: '/kesfet' },
    { label: 'Ara', href: '/ara' },
    { label: 'MARKET', href: '/market' },
    { label: 'İlan Ver', href: '/ilan/olustur' },
  ],
  Kategoriler: [
    { label: 'Girişimciler', href: '/invest' },
    { label: 'Yatırımcılar', href: '/investors' },
    { label: 'İş İlanları', href: '/hire' },
    { label: 'Ortaklıklar', href: '/partners' },
    { label: 'Dijital & AI Çözümleri', href: '/dijital-ai' },
    { label: 'Franchise İlanları', href: '/franchise/buy' },
  ],
  Hesap: [
    { label: 'Giriş yap', href: AUTH_ROUTES.login },
    { label: 'Kayıt ol', href: AUTH_ROUTES.register },
    { label: 'Hesabım', href: AUTH_ROUTES.dashboard },
    { label: 'İlanlarım', href: '/dashboard/ilanlarim' },
    { label: 'Favorilerim', href: '/dashboard/favorilerim' },
  ],
  İletişim: [
    { label: 'Destek', href: CONTACT_MAILTO.support },
    { label: 'Reklam & işbirliği', href: '/reklam' },
    { label: 'Gizlilik', href: '/yasal/gizlilik' },
    { label: 'KVKK', href: '/yasal/kvkk-aydinlatma' },
    { label: 'Açık rıza', href: '/yasal/acik-riza' },
    { label: 'Çerezler', href: '/yasal/cerez' },
    { label: 'Çerez Tercihleri', href: '/yasal/cerez-tercihleri' },
    { label: 'Kullanıcı sözleşmesi', href: '/yasal/kullanici-sozlesmesi' },
  ],
};

export function getFooterLinks(): Record<string, FooterLinkItem[]> {
  return Object.fromEntries(
    Object.entries(FOOTER_LINKS_ALL).map(([section, links]) => [
      section,
      filterPremiumLabels(links.map((l) => l.label)).map((label) => {
        const match = links.find((l) => l.label === label);
        return match ?? { label, href: '#' };
      }),
    ]),
  );
}
