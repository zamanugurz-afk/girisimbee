import { describe, expect, it } from 'vitest';
import {
  resolveCareerCoverTheme,
  resolveDefaultListingCover,
  resolveListingCoverUrl,
} from './listing-cover.config';

describe('career listing covers', () => {
  it('maps professions to distinct cover themes', () => {
    expect(resolveCareerCoverTheme('Sağlık', 'Hemşire')).toBe('saglik');
    expect(resolveCareerCoverTheme('Bilişim / Yazılım', 'Backend geliştirici')).toBe('yazilim');
    expect(resolveCareerCoverTheme('Sigorta', 'Sigorta satış uzmanı')).toBe('satis');
    expect(resolveCareerCoverTheme('Finans / Bankacılık', 'Mali müşavir')).toBe('finans');
    expect(resolveCareerCoverTheme('Eğitim', 'Öğretmen')).toBe('egitim');
    expect(resolveCareerCoverTheme('Üretim / Sanayi', 'Üretim mühendisi')).toBe('uretim');
  });

  it('uses profession covers only for İş Arıyorum fallbacks', () => {
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Sağlık',
        role: 'Hemşire',
      }),
    ).toBe('/covers/career-saglik.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'ise-aliyorum',
        sector: 'Sağlık',
        role: 'Hemşire',
      }),
    ).toBe('/covers/ise-aliyorum.jpg');
  });

  it('keeps an uploaded image ahead of the profession fallback', () => {
    expect(
      resolveListingCoverUrl({
        uploadedUrl: 'https://cdn.example.com/custom.jpg',
        listingTypeSlug: 'is-ariyorum',
        sector: 'Sağlık',
        role: 'Hemşire',
      }),
    ).toBe('https://cdn.example.com/custom.jpg');
  });
});
