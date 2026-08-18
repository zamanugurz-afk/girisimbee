import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { FranchiseMatchService } from '@/features/franchise-matching/service';
import { createProfile } from '@/features/profiles/factories/profile.factory';

class MemoryFranchiseListingStore {
  constructor(private readonly listings: Listing[]) {}

  async search(filter: ListingFilter, _pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    let list = [...this.listings];
    if (filter.ownerId) {
      list = list.filter((l) => l.ownerId === filter.ownerId);
    }
    if (filter.status && Array.isArray(filter.status)) {
      list = list.filter((l) => filter.status!.includes(l.status));
    }
    return { data: list, total: list.length, page: 1, limit: 100, hasMore: false };
  }

  async findPublished(filter: ListingFilter, _pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    let list = this.listings.filter((l) => l.status === 'published');
    if (filter.categoryId) {
      list = list.filter((l) => l.categoryId === filter.categoryId);
    }
    return { data: list, total: list.length, page: 1, limit: 100, hasMore: false };
  }
}

describe('Girişimbee Franchise Matching Stress & Acceptance Test Suite', () => {
  const buyerUser = ids.user('test-usr-syn-franchise-buyer-1');
  const brandUser = ids.user('test-usr-syn-franchise-brand-1');
  const otherBrandUser = ids.user('test-usr-syn-franchise-brand-2');

  const buyerProfile = createProfile({
    id: ids.profile('test-prf-syn-franchise-buyer'),
    userId: buyerUser,
    displayName: 'Yatırımcı Ahmet',
    phone: '05556667788',
    bio: 'Kahve ve fast food sektöründe franchise bayilik almak istiyorum.',
    city: 'İstanbul',
    location: 'İstanbul',
  });

  const buyerModuleProfile = {
    sektor: 'Gıda / Yeme İçme',
    sehir: 'İstanbul',
    ilce: 'Kadıköy',
    minimumYatirim: 1000000,
    maksimumYatirim: 2000000,
    isletmeTecrubesi: '1-3 yıl',
    tercihEdilenLokasyon: 'Cadde',
  };

  // Franchise Brand Listing A (Coffee Brand - 1.5M TL investment, Istanbul, Food sector)
  const franchiseBrandA = createListing({
    id: ids.listing('test-lst-syn-franchise-brand-coffee'),
    ownerId: brandUser,
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    moduleKey: 'franchise',
    title: 'Artisan Kahve Zinciri Bayilik Fırsatı',
    shortDescription: 'Yüksek kârlı 3. nesil kahve dükkanı bayiliği verilecektir.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-02T00:00:00.000Z',
    customFields: {
      sector: 'Gıda / Yeme İçme',
      totalInvestment: 1500000,
      minCapitalRequirement: 1200000,
      availableCities: ['İstanbul', 'Ankara', 'İzmir'],
      districts: 'Kadıköy, Beşiktaş',
      streetStoreAvailable: true,
      experienceRequirement: '1-3 yıl',
      returnPeriod: '18 ay',
      royaltyFee: '%4',
      contactPhone: '05557778899',
      contactEmail: 'franchise.brand@example.com',
    },
  });

  it('Scenario A & D: Budget Exact Match + Same City (Yüksek Eşleşme)', async () => {
    const store = new MemoryFranchiseListingStore([franchiseBrandA]);
    const service = new FranchiseMatchService(
      store,
      undefined,
      { findByUserId: async () => buyerProfile },
      { findFranchiseProfile: async () => buyerModuleProfile },
    );

    const matches = await service.getFranchiseMatches(buyerUser);
    expect(matches).not.toBeNull();
    const topCard = matches!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(70);
    expect(['very_strong', 'strong', 'suitable']).toContain(topCard.band);
    // Privacy assertions
    expect((topCard as any).contactPhone).toBeUndefined();
    expect((topCard as any).contactEmail).toBeUndefined();
  });

  it('Scenario C: Budget Far Off / Out of Tolerance (10M TL Hotel Franchise vs 1.5M TL Buyer)', async () => {
    const franchiseBrandHugeBudget = createListing({
      id: ids.listing('test-lst-syn-franchise-brand-hotel'),
      ownerId: otherBrandUser,
      categoryId: CATEGORY_IDS.bayilikAl,
      listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
      moduleKey: 'franchise',
      title: 'Boutique Hotel Franchise Zinciri',
      shortDescription: 'Lüks butik otel bayilik lisansı.',
      city: 'Antalya',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        sector: 'Turizm / Otelcilik',
        totalInvestment: 15000000,
        minCapitalRequirement: 10000000,
        availableCities: ['Antalya', 'Muğla'],
        streetStoreAvailable: false,
      },
    });

    const store = new MemoryFranchiseListingStore([franchiseBrandA, franchiseBrandHugeBudget]);
    const service = new FranchiseMatchService(
      store,
      undefined,
      { findByUserId: async () => buyerProfile },
      { findFranchiseProfile: async () => buyerModuleProfile },
    );

    const matches = await service.getFranchiseMatches(buyerUser);
    const cards = matches?.matches || [];
    const hotelCard = cards.find((c) => c.listingId === franchiseBrandHugeBudget.id);
    if (hotelCard) {
      expect(hotelCard.score).toBeLessThanOrEqual(50);
    }
  });

  it('Scenario: Detail Page Recommendations and Self-Match Prevention', async () => {
    const store = new MemoryFranchiseListingStore([franchiseBrandA]);
    const service = new FranchiseMatchService(store);

    const detailSection = await service.getListingRecommendations(franchiseBrandA);
    if (detailSection) {
      expect(detailSection.matches.some((c) => c.listingId === franchiseBrandA.id)).toBe(false);
    }
  });
});
