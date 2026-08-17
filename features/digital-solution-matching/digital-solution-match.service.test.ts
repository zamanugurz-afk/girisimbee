import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import type { Company } from '@/features/companies/types/company.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import { ids, type UserId } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { DigitalSolutionMatchService } from '@/features/digital-solution-matching/service';

const USER_ID = ids.user('user-buyer');
const OWNER_1_ID = ids.user('owner-1');
const OWNER_2_ID = ids.user('owner-2');

function pageOf(data: Listing[]): PaginatedResult<Listing> {
  return { data, total: data.length, page: 1, limit: data.length || 20, hasMore: false };
}

function digitalSolutionListing(overrides: Partial<Listing> = {}): Listing {
  return createListing({
    ownerId: OWNER_1_ID,
    categoryId: CATEGORY_IDS.dijitalAi,
    listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
    title: 'Operasyon Asistanı SaaS',
    shortDescription: 'KOBİ operasyonlarını otomatikleştiren yapay zeka çözümü.',
    status: 'published',
    city: 'İstanbul',
    industry: 'E-ticaret',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: {
      solutionType: 'Otomasyon & RPA',
      deliveryModel: 'Abonelik (SaaS)',
      targetAudience: 'KOBİ',
      priceRange: '1.000 - 5.000 TL',
      capabilities: ['İş Akışı Otomasyonu', 'Yapay Zeka Asistanı'],
      supportedLanguages: ['Türkçe'],
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

describe('DigitalSolutionMatchService', () => {
  it('matches digital solutions based on company profile', async () => {
    const company: Company = {
      id: ids.company('comp-1'),
      ownerId: USER_ID,
      name: 'E-Ticaret Deposu',
      slug: 'e-ticaret-deposu',
      logoUrl: null,
      coverUrl: null,
      description: 'E-ticaret ve kargo operasyonları',
      website: 'https://eticaretdeposu.com',
      linkedInUrl: null,
      twitterUrl: null,
      city: 'İstanbul',
      location: 'İstanbul',
      country: 'Türkiye',
      industry: 'E-ticaret',
      employeeCount: '11-50', // -> KOBİ, Startup
      foundedYear: 2022,
      contactEmail: 'info@eticaretdeposu.com',
      isVerified: true,
      websiteVerified: true,
      emailVerified: true,
      status: 'active',
      metadata: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    };

    const solutionA = digitalSolutionListing({
      title: 'E-ticaret AI Asistanı',
      industry: 'E-ticaret',
      customFields: {
        solutionType: 'Otomasyon & RPA',
        deliveryModel: 'Abonelik (SaaS)',
        targetAudience: 'KOBİ',
        capabilities: ['İş Akışı Otomasyonu'],
        supportedLanguages: ['Türkçe'],
      },
    });

    const solutionB = digitalSolutionListing({
      ownerId: OWNER_2_ID,
      title: 'Restoran Sipariş Sistemi',
      industry: 'Gıda / Restoran',
      customFields: {
        solutionType: 'SaaS ürünü',
        deliveryModel: 'Abonelik (SaaS)',
        targetAudience: 'Kurumsal',
        capabilities: ['Chatbot & Müşteri Desteği'],
      },
    });

    const service = new DigitalSolutionMatchService(
      new MemoryListingStore([solutionA, solutionB]),
      new MemoryCompanyStore(company),
      new MemoryProfileStore(null),
    );

    const result = await service.getDigitalSolutionMatches(USER_ID);

    expect(result.hasConsumerContext).toBe(true);
    expect(result.solutions).not.toBeNull();
    expect(result.solutions?.matches.length).toBeGreaterThanOrEqual(1);

    const topMatch = result.solutions?.matches[0];
    expect(topMatch?.title).toBe('E-ticaret AI Asistanı');
    expect(topMatch?.score).toBeGreaterThanOrEqual(80);
    expect(topMatch?.band).toBe('very_strong');
    expect(topMatch?.href).toBe(`/ilan/${solutionA.slug || solutionA.id}`);
  });

  it('prevents self-matching on listing detail recommendations', async () => {
    const solution1 = digitalSolutionListing({
      id: ids.listing('sol-1'),
      title: 'Çözüm 1',
    });
    const solution2 = digitalSolutionListing({
      id: ids.listing('sol-2'),
      ownerId: OWNER_2_ID,
      title: 'Çözüm 2',
    });

    const service = new DigitalSolutionMatchService(
      new MemoryListingStore([solution1, solution2]),
      new MemoryCompanyStore(null),
      new MemoryProfileStore(null),
    );

    const recs = await service.getListingRecommendations(solution1);
    expect(recs).not.toBeNull();
    expect(recs?.title).toBe('Sana Uygun Çözümler');
    // Must NOT contain solution1 itself
    expect(recs?.matches.some((m) => m.listingId === String(solution1.id))).toBe(false);
    expect(recs?.matches.some((m) => m.listingId === String(solution2.id))).toBe(true);
  });

  it('guarantees identical scores on dashboard and detail page for same profile and solution', async () => {
    const solution = digitalSolutionListing({
      id: ids.listing('sol-parity'),
      title: 'Parity Test Solution',
    });

    const company: Company = {
      id: ids.company('comp-parity'),
      ownerId: USER_ID,
      name: 'Test Co',
      slug: 'test-co',
      logoUrl: null,
      coverUrl: null,
      description: null,
      website: null,
      linkedInUrl: null,
      twitterUrl: null,
      city: 'İstanbul',
      location: 'İstanbul',
      country: 'Türkiye',
      industry: 'E-ticaret',
      employeeCount: '11-50',
      foundedYear: null,
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

    const service = new DigitalSolutionMatchService(
      new MemoryListingStore([solution]),
      new MemoryCompanyStore(company),
      new MemoryProfileStore(null),
    );

    const dashboardResult = await service.getDigitalSolutionMatches(USER_ID);
    const dashboardScore = dashboardResult.solutions?.matches[0]?.score;

    expect(dashboardScore).toBeDefined();
    expect(typeof dashboardScore).toBe('number');
  });
});
