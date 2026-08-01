import { filterPremiumLabels } from '@/features/shared/config/features';

export const NAV_LINKS = [
  { label: 'Keşfet', href: '/kesfet' },
  { label: 'İlanlar', href: '/kesfet' },
  { label: 'Girişimciler', href: '/invest' },
  { label: 'Yatırımcılar', href: '/investors' },
  { label: 'İş Arayanlar', href: '/jobs' },
  { label: 'İş Verenler', href: '/hire' },
  { label: 'Ortaklıklar', href: '/partners' },
  { label: 'Franchise', href: '/franchise/buy' },
] as const;

const FOOTER_LINKS_ALL = {
  Platform: ['Keşfet', 'İlan Ver', 'Eşleşmeler', 'Fiyatlandırma'],
  Şirket: ['Hakkımızda', 'Blog', 'Kariyer'],
  Destek: ['Yardım', 'İletişim', 'SSS'],
  Yasal: ['Gizlilik', 'KVKK', 'Çerezler'],
} as const;

export function getFooterLinks() {
  return Object.fromEntries(
    Object.entries(FOOTER_LINKS_ALL).map(([section, links]) => [
      section,
      filterPremiumLabels(links),
    ]),
  ) as Record<keyof typeof FOOTER_LINKS_ALL, string[]>;
}
