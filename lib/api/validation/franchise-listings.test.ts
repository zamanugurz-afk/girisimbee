import { describe, it, expect } from 'vitest';
import {
  franchiseBuyListingCreateSchema,
  franchiseGiveListingCreateSchema,
  franchiseListingBrowseQuerySchema,
  franchiseListingCreateSchema,
  franchiseListingUpdateSchema,
} from '@/lib/api/validation/franchise-listings';

const baseContact = {
  contactPhone: '+905551234567',
  contactEmail: 'info@example.com',
};

describe('franchise listing validation', () => {
  it('accepts Bayilik Al listing create payload', () => {
    const parsed = franchiseBuyListingCreateSchema.parse({
      title: 'Franchise Arayışı',
      shortDescription: 'Gıda sektöründe franchise arıyorum',
      longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
      city: 'Istanbul',
      district: 'Kadıköy',
      sector: 'Food',
      minimumYatirim: 200000,
      maksimumYatirim: 800000,
      tercihEdilenLokasyon: 'Marmara',
      ...baseContact,
    });

    expect(parsed.minimumYatirim).toBe(200000);
    expect(parsed.city).toBe('Istanbul');
  });

  it('accepts Bayilik Ver listing create payload', () => {
    const parsed = franchiseGiveListingCreateSchema.parse({
      title: 'Kafe Franchise',
      shortDescription: '50 şubelik marka franchise veriyor',
      longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
      city: 'Ankara',
      sector: 'Food',
      franchiseBedeli: 300000,
      minimumSermaye: 600000,
      tahminiAylikCiro: 150000,
      egitimDestegi: true,
      operasyonDestegi: true,
      pazarlamaDestegi: false,
      ...baseContact,
    });

    expect(parsed.franchiseBedeli).toBe(300000);
    expect(parsed.egitimDestegi).toBe(true);
  });

  it('requires flow for discriminated create schema', () => {
    expect(
      franchiseListingCreateSchema.safeParse({
        flow: 'give',
        title: 'Kafe Franchise',
        shortDescription: '50 şubelik marka franchise veriyor',
        longDescription: 'Detaylı açıklama en az yirmi karakter olmalıdır.',
        ...baseContact,
      }).success,
    ).toBe(true);
  });

  it('accepts partial update payload', () => {
    const parsed = franchiseListingUpdateSchema.parse({
      flow: 'buy',
      city: 'Izmir',
      minimumYatirim: 150000,
    });

    expect(parsed.city).toBe('Izmir');
  });

  it('accepts browse filters with district', () => {
    const parsed = franchiseListingBrowseQuerySchema.parse({
      city: 'Istanbul',
      district: 'Kadıköy',
      sector: 'Food',
    });

    expect(parsed.district).toBe('Kadıköy');
  });
});
