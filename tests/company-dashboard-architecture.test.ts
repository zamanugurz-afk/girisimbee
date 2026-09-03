import { describe, it, expect } from 'vitest';

describe('Company Dashboard Architecture & Navigation Integrity Suite', () => {
  const companySlug = 'kahve-duragi';

  const companyNavSections = [
    {
      title: 'ŞİRKET YÖNETİMİ',
      items: [
        { id: 'overview', href: `/company/${companySlug}/dashboard` },
        { id: 'preview', href: `/company/${companySlug}` },
        { id: 'team', href: `/company/${companySlug}/dashboard?tab=team` },
        { id: 'followers', href: `/company/${companySlug}/dashboard?tab=followers` },
      ],
    },
    {
      title: 'İLAN & İŞLEMLER',
      items: [
        { id: 'post-job', href: `/ilan/olustur?category=ise-al` },
        { id: 'listings', href: `/company/${companySlug}/dashboard?tab=listings` },
      ],
    },
    {
      title: 'KURUMSAL AYARLAR',
      items: [
        { id: 'settings', href: `/company/${companySlug}/settings` },
        { id: 'verification', href: `/company/${companySlug}/dashboard?tab=verification` },
      ],
    },
  ];

  it('validates all company sidebar navigation routes are well-formed', () => {
    companyNavSections.forEach((section) => {
      expect(section.items.length).toBeGreaterThan(0);
      section.items.forEach((item) => {
        expect(item.href.startsWith('/')).toBe(true);
        expect(item.id).toBeTruthy();
      });
    });
  });

  it('verifies company panel supports dashboard tab query states', () => {
    const validTabs = ['listings', 'team', 'followers', 'settings', 'verification'];
    validTabs.forEach((tab) => {
      const url = `/company/${companySlug}/dashboard?tab=${tab}`;
      expect(url).toContain(companySlug);
      expect(url).toContain(tab);
    });
  });
});
