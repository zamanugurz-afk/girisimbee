import { filterPremiumLabels } from '@/features/shared/config/features';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

/** Primary header navigation — homepage information architecture. */
export const NAV_LINKS = [
  { label: 'Kariyer ve İş Fırsatları', href: '/is' },
  { label: 'Ortaklık ve Devir', href: '/girisim-ortaklik' },
  { label: 'Fırsat ve Çözümler', href: '/market' },
] as const;

export type FooterLinkItem = { label: string; href: string };

/**
 * Footer columns follow homepage IA:
 * Kariyer · Ortaklık ve Devir · Fırsatlar ve Çözümler · Hesap · İletişim
 */
const FOOTER_LINKS_ALL: Record<string, FooterLinkItem[]> = {
  'Kariyer ve İş Fırsatları': [
    { label: 'İş Arıyorum', href: '/is?flow=hire' },
    { label: 'İşe Alıyorum', href: '/is?flow=seek' },
  ],
  'Ortaklık ve Devir': [
    { label: 'Ortak Arıyorum', href: '/partners?intent=seeking' },
    { label: 'Ortak Olmak İstiyorum', href: '/partners?intent=joining' },
    { label: 'Franchise Fırsatları', href: '/franchise/buy' },
  ],
  'Fırsat ve Çözümler': [
    { label: 'Girişimbee MARKET', href: '/market' },
    { label: 'İş Kurma Robotu', href: '/is-kurma-asistani' },
    { label: 'Yatırım Radarı', href: '/radar' },
    { label: 'Reklam ve İş Birliği', href: '/reklam' },
  ],
  Hesap: [
    { label: 'Giriş yap', href: AUTH_ROUTES.login },
    { label: 'Kayıt ol', href: AUTH_ROUTES.register },
    { label: 'Hesabım', href: AUTH_ROUTES.dashboard },
    { label: 'İlan Ver', href: '/ilan/olustur' },
    { label: 'İlanlarım', href: '/dashboard/ilanlarim' },
    { label: 'Favorilerim', href: '/dashboard/favorilerim' },
  ],
  İletişim: [
    { label: 'Destek', href: '/destek' },
    { label: 'Reklam ve işbirliği', href: '/reklam' },
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
