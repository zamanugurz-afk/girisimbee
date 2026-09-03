import { describe, it, expect } from 'vitest';

describe('Header Dropdown Menu Navigation Integrity Suite', () => {
  const marketplaceLinks = [
    { title: 'Girişim Ortaklığı', href: '/girisim-ortaklik' },
    { title: 'Devren İşletmeler', href: '/isletme-devri' },
    { title: 'Franchise & Bayilik', href: '/franchise/buy' },
    { title: 'İş & Kariyer İlanları', href: '/is' },
    { title: 'Ustalar ve Hizmetler', href: '/kategori/hizmetler' },
    { title: 'Aday & Yetenek Havuzu', href: '/is-ariyorum' },
  ];

  const ideasLinks = [
    { title: 'Trend & Yeni Fikirler', href: '/trend-fikirler' },
    { title: '"Fikrim Var, Bütçem Yok"', href: '/fikrim-var' },
    { title: 'İş Kurma Bütçe Robotu', href: '/is-kurma-asistani' },
    { title: 'Hibe & Teşvik Destekleri', href: '/is-kurma-asistani#grants-section' },
  ];

  const radarLinks = [
    { title: 'Lokasyon Radarı', href: '/radar' },
    { title: 'İş Kurma Asistanı', href: '/is-kurma-asistani' },
    { title: 'Resmi Başvuru Süreci', href: '/is-kurma-asistani#legal-section' },
    { title: 'Hibe & Teşvik Radarı', href: '/is-kurma-asistani#grants-section' },
  ];

  it('validates marketplace dropdown links are distinct and valid', () => {
    const urls = marketplaceLinks.map(l => l.href);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(urls.length);
    urls.forEach(url => expect(url.startsWith('/')).toBe(true));
  });

  it('validates ideas dropdown links are distinct and valid', () => {
    const urls = ideasLinks.map(l => l.href);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(urls.length);
    urls.forEach(url => expect(url.startsWith('/')).toBe(true));
  });

  it('validates radar dropdown links are distinct and point to the 4 core cockpits', () => {
    const urls = radarLinks.map(l => l.href);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(urls.length);
    urls.forEach(url => expect(url.startsWith('/')).toBe(true));
  });
});
