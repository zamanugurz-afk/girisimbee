import { filterPremiumLabels } from '@/features/shared/config/features';

export const NAV_LINKS = [
  { label: 'Keşfet', href: '/kesfet' },
  { label: 'Girişimciler', href: '/invest' },
  { label: 'İş İlanları', href: '/hire' },
  { label: 'Ortaklıklar', href: '/partners' },
  { label: 'Dijital & AI', href: '/dijital-ai' },
  { label: 'Franchise', href: '/franchise/buy' },
] as const;

export type FooterLinkItem = { label: string; href: string };

const FOOTER_LINKS_ALL: Record<string, FooterLinkItem[]> = {
  Platform: [
    { label: 'Keşfet', href: '/kesfet' },
    { label: 'İlan Ver', href: '/ilan/olustur' },
    { label: 'Ara', href: '/ara' },
    { label: 'Fiyatlandırma', href: '/dashboard/paketlerim' },
  ],
  Şirket: [
    { label: 'Ana sayfa', href: '/' },
    { label: 'Girişimciler', href: '/invest' },
  ],
  Destek: [
    { label: 'Yardım', href: 'mailto:destek@girisimco.com' },
    { label: 'İletişim', href: 'mailto:destek@girisimco.com' },
    { label: 'SSS', href: '/kesfet' },
  ],
  Yasal: [
    { label: 'Gizlilik', href: '/yasal/gizlilik' },
    { label: 'KVKK', href: '/yasal/kvkk-aydinlatma' },
    { label: 'Çerezler', href: '/yasal/cerez' },
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
