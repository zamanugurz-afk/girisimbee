import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { FranchiseBuyProfile } from '@/features/profiles/types/franchise-profile.types';
import { ids, type UserId, type ProfileId } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { FranchiseMatchService } from '@/features/franchise-matching/service';

const USER_ID = ids.user('user-investor');
const OWNER_1_ID = ids.user('owner-brand-1');
const OWNER_2_ID = ids.user('owner-brand-2');

function pageOf(data: Listing[]): PaginatedResult<Listing> {
  return { data, total: data.length, page: 1, limit: data.length || 20, hasMore: false };
}

function franchiseListing(overrides: Partial<Listing> = {}): Listing {
  return createListing({
    ownerId: OWNER_1_ID,
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    title: 'Kahve Dünyası Şubesi',
    shortDescription: 'Franchise fırsatı.',
    status: 'published',
    city: 'İstanbul',
    industry: 'Gıda & İçecek',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: {
      companyName: 'Kahve Dünyası',
      sector: 'Gıda & İçecek',
      businessCategory: 'Cafe & Restoran',
      totalInvestment: 1000000,
      minCapitalRequirement: 750000,
      availableCities: ['İstanbul', 'İzmir'],
      minSquareMeters: 80,
      mallAvailable: true,
      streetStoreAvailable: true,
      experienceRequirement: '1-3 yıl işletme deneyimi',
    },
    ...overrides,
  });
}

class MemoryListingStore {
  constructor(private readonly listings: Listing[]) {}

  async search(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const statuses = filter.status ? (Array.isArray(filter.status) ? filter.status : [filter.status]) : null;
    const rows = this.listings.filter((listing) => {
      if (filter.ownerId && listing.ownerId !== filter.ownerId) return false;
      if (statuses && !statuses.includes(listing.status)) return false;
      return true;
    });
    return pageOf(rows.slice(0, pagination?.limit ?? 100));
  }

  async findPublished(filter: ListingFilter, pagination?: PaginationParams): Promise<PaginatedResult<Listing>> {
    const rows = this.listings.filter((listing) => {
      if (listing.status !== 'published') return false;
      if (filter.categoryId && listing.categoryId !== filter.categoryId) return false;
      return true;
    });
    return pageOf(rows.slice(0, pagination?.limit ?? 100));
  }
}

class MemoryCompanyStore {
  constructor(private readonly company: Company | null) {}
  async findByOwnerId(_ownerId: UserId): Promise<Company | null> {
    return this.company;
  }
}

class MemoryProfileStore {
  constructor(private readonly profile: Profile | null) {}
  async findByUserId(_userId: UserId): Promise<Profile | null> {
    return this.profile;
  }
}

class MemoryModuleProfileStore {
  constructor(private readonly buyProfile: FranchiseBuyProfile | null) {}
  async findFranchiseProfile(_profileId: ProfileId): Promise<FranchiseBuyProfile | null> {
    return this.buyProfile;
  }
}

describe('FranchiseMatchService', () => {
  it('prevents self-matching on listing detail recommendations', async () => {
    const opp1 = franchiseListing({
      id: ids.listing('franchise-1'),
      title: 'Franchise Marka 1',
    });
    const opp2 = franchiseListing({
      id: ids.listing('franchise-2'),
      ownerId: OWNER_2_ID,
      title: 'Franchise Marka 2',
    });

    const service = new FranchiseMatchService(
      new MemoryListingStore([opp1, opp2]),
      new MemoryCompanyStore(null),
      new MemoryProfileStore(null),
      new MemoryModuleProfileStore(null),
    );

    const recs = await service.getListingRecommendations(opp1);
    expect(recs).not.toBeNull();
    expect(recs?.title).toBe('Sana Uygun Diğer Franchise Fırsatları');
    // Must NOT contain opp1 itself
    expect(recs?.matches.some((m) => m.listingId === String(opp1.id))).toBe(false);
    expect(recs?.matches.some((m) => m.listingId === String(opp2.id))).toBe(true);
  });

  it('filters out draft / unpublished franchise listings', async () => {
    const oppPublished = franchiseListing({
      id: ids.listing('published-opp'),
      status: 'published',
    });
    const oppDraft = franchiseListing({
      id: ids.listing('draft-opp'),
      ownerId: OWNER_2_ID,
      status: 'draft',
    });

    const service = new FranchiseMatchService(
      new MemoryListingStore([oppPublished, oppDraft]),
      new MemoryCompanyStore(null),
      new MemoryProfileStore(null),
      new MemoryModuleProfileStore(null),
    );

    const recs = await service.getListingRecommendations(oppPublished);
    expect(recs?.matches.some((m) => m.listingId === String(oppDraft.id))).toBe(false);
  });

  it('generates recommendations based on company industry and location', async () => {
    const company: Company = {
      id: ids.company('comp-investor'),
      ownerId: USER_ID,
      name: 'Gıda Yatırımları Ltd.',
      slug: 'gida-yatirimlari',
      logoUrl: null,
      coverUrl: null,
      description: 'Restoran ve gıda yatırımı',
      website: null,
      linkedInUrl: null,
      twitterUrl: null,
      city: 'İstanbul',
      location: 'İstanbul',
      country: 'Türkiye',
      industry: 'Gıda & İçecek',
      employeeCount: '11-50',
      foundedYear: 2020,
      contactEmail: null,
      isVerified: true,
      websiteVerified: true,
      emailVerified: true,
      status: 'active',
      metadata: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    };

    const opp = franchiseListing({
      id: ids.listing('opp-food'),
      title: 'Burger & Fries Franchise',
      customFields: {
        sector: 'Gıda & İçecek',
        businessCategory: 'Fast food / Quick service',
        totalInvestment: 800000,
        availableCities: ['İstanbul'],
      },
    });

    const service = new FranchiseMatchService(
      new MemoryListingStore([opp]),
      new MemoryCompanyStore(company),
      new MemoryProfileStore(null),
      new MemoryModuleProfileStore(null),
    );

    const matches = await service.getFranchiseMatches(USER_ID);
    expect(matches).not.toBeNull();
    expect(matches?.matches.length).toBeGreaterThanOrEqual(1);
    expect(matches?.matches[0].score).toBeGreaterThanOrEqual(80);
  });
});
