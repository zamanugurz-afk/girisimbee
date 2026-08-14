import { describe, expect, it } from 'vitest';
import {
  resolveCareerCoverGender,
  resolveCareerCoverTheme,
  resolveDefaultListingCover,
  resolveListingCoverUrl,
} from './listing-cover.config';

describe('career listing covers', () => {
  it('maps professions to distinct cover themes', () => {
    expect(resolveCareerCoverTheme('Sağlık', 'Hemşire')).toBe('saglik');
    expect(resolveCareerCoverTheme('Bilişim / Yazılım', 'Backend geliştirici')).toBe('yazilim');
    expect(resolveCareerCoverTheme('Sigorta', 'Sigorta satış uzmanı')).toBe('sigorta');
    expect(resolveCareerCoverTheme('Finans / Bankacılık', 'Mali müşavir')).toBe('finans');
    expect(resolveCareerCoverTheme('Finans / Bankacılık', 'Kredi uzmanı')).toBe('finans');
    expect(resolveCareerCoverTheme('Eğitim', 'Öğretmen')).toBe('egitim');
    expect(resolveCareerCoverTheme('Üretim / Sanayi', 'Üretim mühendisi')).toBe('uretim');
    expect(resolveCareerCoverTheme('Otomotiv', 'Servis danışmanı')).toBe('genel');
    expect(resolveCareerCoverTheme(null, 'Servis danışmanı')).toBe('genel');
    expect(resolveCareerCoverTheme('Turizm / Otelcilik', 'Resepsiyonist')).toBe('turizm');
    expect(resolveCareerCoverTheme('Turizm / Otelcilik', 'Otel resepsiyonisti')).toBe('turizm');
    expect(resolveCareerCoverTheme('Turizm / Otelcilik', 'Host / hostes')).toBe('turizm');
    expect(resolveCareerCoverTheme('Eğitim', 'Eğitmen / öğretmen')).toBe('egitim');
  });

  it('picks a person cover from private gender + profession', () => {
    expect(resolveCareerCoverGender('Erkek')).toBe('erkek');
    expect(resolveCareerCoverGender('Kadın')).toBe('kadin');
    expect(resolveCareerCoverGender('Belirtmek istemiyorum')).toBeNull();
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Sigorta',
        role: 'Underwriter',
        gender: 'Erkek',
      }),
    ).toBe('/covers/career-erkek-sigorta.jpg');
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Sigorta',
        role: 'Underwriter',
        gender: 'Kadın',
      }),
    ).toBe('/covers/career-kadin-sigorta.jpg');
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Finans / Bankacılık',
        role: 'Kredi uzmanı',
        gender: 'Erkek',
      }),
    ).toBe('/covers/career-erkek-finans.jpg');
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Finans / Bankacılık',
        role: 'Bölge müdürü',
        gender: 'Kadın',
      }),
    ).toBe('/covers/career-kadin-finans.jpg');
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Finans / Bankacılık',
        role: 'Bölge müdürü',
      }),
    ).toBe('/covers/career-finans.jpg');
  });

  it('uses profession covers for İş Arıyorum and İşe Alıyorum fallbacks', () => {
    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Sağlık',
        role: 'Hemşire',
      }),
    ).toBe('/covers/career-saglik.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-ariyorum',
        sector: 'Otomotiv',
        role: 'Servis danışmanı',
      }),
    ).toBe('/covers/is-ariyorum.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'is-bul',
        role: 'Servis danışmanı',
      }),
    ).toBe('/covers/is-ariyorum.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'ise-aliyorum',
        sector: 'Turizm / Otelcilik',
        role: 'Otel resepsiyonisti',
      }),
    ).toBe('/covers/career-turizm.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'ise-aliyorum',
        sector: 'Sağlık',
        role: 'Hemşire',
      }),
    ).toBe('/covers/career-saglik.jpg');

    expect(
      resolveDefaultListingCover({
        listingTypeSlug: 'ise-al',
        sector: 'Bilişim / Yazılım',
        role: 'Backend geliştirici',
        gender: 'Erkek',
      }),
    ).toBe('/covers/career-yazilim.jpg');
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
