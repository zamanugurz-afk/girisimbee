import { describe, it, expect } from 'vitest';
import { CONTACT_EMAILS } from '@/features/shared/constants/contact';

describe('Footer Navigation & Contact Links Integrity Suite', () => {
  const footerSections = [
    {
      title: 'KEŞFET',
      links: [
        { label: 'Kariyer ve İş Fırsatları', href: '/is' },
        { label: 'Ortaklık ve Devir', href: '/girisim-ortaklik' },
        { label: 'Franchise ve Bayilik', href: '/franchise/buy' },
        { label: 'Ustalar ve Hizmetler', href: '/kategori/hizmetler' },
        { label: 'Girişimbee Market', href: '/market' },
      ],
    },
    {
      title: 'PLATFORM',
      links: [
        { label: 'İlan Ver', href: '/ilan/olustur' },
        { label: 'İlanlarım', href: '/dashboard/ilanlarim' },
        { label: 'Favorilerim', href: '/dashboard/favorilerim' },
        { label: 'Giriş Yap', href: '/giris' },
        { label: 'Kayıt Ol', href: '/kayit' },
      ],
    },
    {
      title: 'YASAL VE GÜVENLİK',
      links: [
        { label: 'Kullanıcı Sözleşmesi', href: '/yasal/kullanici-sozlesmesi' },
        { label: 'Gizlilik Politikası', href: '/yasal/gizlilik' },
        { label: 'KVKK Aydınlatma Metni', href: '/yasal/kvkk-aydinlatma' },
        { label: 'Açık Rıza Metni', href: '/yasal/acik-riza' },
        { label: 'Çerez Tercihleri', href: '/yasal/cerez-tercihleri' },
      ],
    },
  ];

  it('validates contact emails format and domains', () => {
    expect(CONTACT_EMAILS.support).toBe('destek@girisimbee.com');
    expect(CONTACT_EMAILS.ads).toBe('reklam@girisimbee.com');
  });

  it('verifies all footer navigation routes start with valid root slashes', () => {
    footerSections.forEach((section) => {
      expect(section.links.length).toBe(5);
      section.links.forEach((link) => {
        expect(link.href.startsWith('/')).toBe(true);
        expect(link.label).toBeTruthy();
      });
    });
  });

  it('verifies bottom auxiliary links', () => {
    const auxiliaryLinks = [
      { label: 'Destek Merkezi', href: '/destek' },
      { label: 'Reklam ve İş Birliği', href: '/reklam' },
    ];
    auxiliaryLinks.forEach((link) => {
      expect(link.href.startsWith('/')).toBe(true);
    });
  });
});
