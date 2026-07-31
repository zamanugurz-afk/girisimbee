import { describe, it, expect } from 'vitest';
import {
  franchiseBuyProfileSchema,
  franchiseGiveProfileSchema,
  parseFranchiseProfileUpsert,
} from '@/lib/api/validation/franchise-profiles';

describe('franchise profile validation', () => {
  it('accepts valid Bayilik Al profile fields', () => {
    const parsed = franchiseBuyProfileSchema.parse({
      subcategorySlug: 'franchise-buy',
      adSoyad: 'Ali Yılmaz',
      sehir: 'Istanbul',
      ilce: 'Kadıköy',
      sektor: 'Food',
      minimumYatirim: 100000,
      maksimumYatirim: 500000,
      tercihEdilenLokasyon: 'Marmara',
      isletmeTecrubesi: '5 yıl perakende',
      aciklama: 'Franchise arıyorum',
      telefon: '+905551234567',
      eposta: 'ali@example.com',
      website: 'https://example.com',
    });

    expect(parsed.adSoyad).toBe('Ali Yılmaz');
    expect(parsed.minimumYatirim).toBe(100000);
  });

  it('accepts valid Bayilik Ver profile fields', () => {
    const parsed = franchiseGiveProfileSchema.parse({
      subcategorySlug: 'franchise-give',
      markaAdi: 'KafeX',
      sektor: 'Food',
      sehir: 'Ankara',
      franchiseBedeli: 250000,
      minimumSermaye: 500000,
      tahminiAylikCiro: 150000,
      subeSayisi: 12,
      egitimDestegi: true,
      operasyonDestegi: true,
      pazarlamaDestegi: false,
      telefon: '+905559876543',
      eposta: 'info@kafex.com',
    });

    expect(parsed.markaAdi).toBe('KafeX');
    expect(parsed.egitimDestegi).toBe(true);
  });

  it('rejects invalid email on buy profile', () => {
    expect(() =>
      franchiseBuyProfileSchema.parse({
        eposta: 'not-an-email',
      }),
    ).toThrow();
  });

  it('parseFranchiseProfileUpsert selects schema by subcategorySlug', () => {
    const buy = parseFranchiseProfileUpsert({
      subcategorySlug: 'franchise-buy',
      adSoyad: 'Test User',
    });
    expect(buy).toMatchObject({ adSoyad: 'Test User' });

    const give = parseFranchiseProfileUpsert({
      subcategorySlug: 'franchise-give',
      markaAdi: 'BrandCo',
    });
    expect(give).toMatchObject({ markaAdi: 'BrandCo' });
  });

  it('parseFranchiseProfileUpsert infers schema from flow hint', () => {
    const buy = parseFranchiseProfileUpsert({
      flow: 'buy',
      sektor: 'Retail',
    });
    expect(buy).toMatchObject({ sektor: 'Retail' });
  });
});
