import { describe, it, expect, beforeEach } from 'vitest';
import { CURATED_LISTING_TEMPLATES } from '@/features/listings/mock/curated-seed-listings';
import { mockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { ensureMockListingsSeeded, resetMockListingSeed } from '@/features/listings/repository/mock/listing-seed';

describe('Ustalar ve Hizmetler Marketplace Listings & User Perspective Flow', () => {
  beforeEach(async () => {
    resetMockListingSeed();
    await ensureMockListingsSeeded(mockListingRepository);
  });

  it('contains at least 5 rich and realistic Ustalar listings in CURATED_LISTING_TEMPLATES', () => {
    const ustaListings = CURATED_LISTING_TEMPLATES.filter((l) => {
      const isHizmet = l.categorySlug === 'hizmetler';
      const text = `${l.title} ${l.shortDescription} ${l.longDescription}`.toLowerCase();
      return isHizmet && (text.includes('usta') || text.includes('zanaat') || text.includes('şef'));
    });

    expect(ustaListings.length).toBeGreaterThanOrEqual(5);

    // Verify key trade professions are present
    const titles = ustaListings.map((u) => u.title);
    expect(titles.some((t) => t.includes('Tadilat') || t.includes('Alçıpan'))).toBe(true);
    expect(titles.some((t) => t.includes('Ocakbaşı') || t.includes('Döner') || t.includes('Kebap'))).toBe(true);
    expect(titles.some((t) => t.includes('Elektrik') || t.includes('Trifaze'))).toBe(true);
    expect(titles.some((t) => t.includes('Marangoz') || t.includes('Ahşap'))).toBe(true);
    expect(titles.some((t) => t.includes('Kuaför') || t.includes('Tasarım'))).toBe(true);
    expect(titles.some((t) => t.includes('Mekanik') || t.includes('Ekspertiz'))).toBe(true);
  });

  it('seeds all Ustalar listings into MockListingRepository with proper attributes', async () => {
    const { data: allListings } = await mockListingRepository.findMany({}, { limit: 100 });
    const seededUstas = allListings.filter((l) => {
      const text = `${l.title} ${l.shortDescription || ''}`.toLowerCase();
      return text.includes('usta') || text.includes('şantiye') || text.includes('marangoz') || text.includes('kuaför');
    });

    expect(seededUstas.length).toBeGreaterThanOrEqual(5);

    seededUstas.forEach((listing) => {
      expect(listing.title).toBeTruthy();
      expect(listing.shortDescription).toBeTruthy();
      expect(listing.city).toBeTruthy();
      expect(listing.district).toBeTruthy();
      expect(listing.status).toBe('published');
      expect((listing as any).customFields).toBeDefined();
      expect((listing as any).customFields.contactName).toBeTruthy();
      expect((listing as any).coverUrl).toMatch(/^https:\/\//);
    });
  });

  it('allows a user to search for usta listings by city and keyword', async () => {
    const { data: allListings } = await mockListingRepository.findMany({}, { limit: 100 });

    // Search for Kadıköy Tadilat Ustası
    const kadikoyTadilat = allListings.filter(
      (l) => l.city === 'İstanbul' && l.title.toLowerCase().includes('tadilat')
    );
    expect(kadikoyTadilat.length).toBeGreaterThanOrEqual(1);
    expect(kadikoyTadilat[0].district).toBe('Kadıköy');

    // Search for Ostim Elektrik Ustası
    const ostimElektrik = allListings.filter(
      (l) => l.city === 'Ankara' && l.title.toLowerCase().includes('elektrik')
    );
    expect(ostimElektrik.length).toBeGreaterThanOrEqual(1);
    expect(ostimElektrik[0].district).toBe('Ostim');

    // Search for Bursa Marangoz Ustası
    const bursaMarangoz = allListings.filter(
      (l) => l.city === 'Bursa' && l.title.toLowerCase().includes('marangoz')
    );
    expect(bursaMarangoz.length).toBeGreaterThanOrEqual(1);
    expect(bursaMarangoz[0].district).toBe('Nilüfer');
  });
});
