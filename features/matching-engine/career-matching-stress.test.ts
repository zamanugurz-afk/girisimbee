import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';

class MemoryListingStore {
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
    if (filter.listingTypeIds && Array.isArray(filter.listingTypeIds)) {
      list = list.filter((l) => filter.listingTypeIds!.includes(l.listingTypeId));
    }
    return { data: list, total: list.length, page: 1, limit: 100, hasMore: false };
  }

  async findById(id: string): Promise<Listing | null> {
    return this.listings.find((l) => l.id === id) ?? null;
  }
}

describe('Girişimbee Career Matching Stress & Acceptance Test Suite', () => {
  const seekerUser = ids.user('test-usr-syn-career-seeker-1');
  const employerUser = ids.user('test-usr-syn-career-employer-1');
  const otherUser = ids.user('test-usr-syn-career-other-1');

  // Base seeker listing
  const seekerMainListing = createListing({
    id: ids.listing('test-lst-syn-career-seek-main'),
    ownerId: seekerUser,
    categoryId: CATEGORY_IDS.isBul,
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    moduleKey: 'candidates',
    title: 'Kıdemli Satış Uzmanı Olarak İş Arıyorum',
    shortDescription: '10 yıllık kurumsal sigorta ve bankacılık satış deneyimi.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: {
      desiredRole: 'Satış Uzmanı',
      preferredRoles: 'Satış Uzmanı, Kıdemli Satış Uzmanı, Satış Danışmanı',
      primarySector: 'Sigortacılık',
      preferredSectors: 'Sigortacılık, Finans / Bankacılık',
      experienceLevel: '5+ yıl',
      professionalSkills: 'Satış Yönetimi, CRM, Müşteri Yönetimi, Müzakere, Portföy Yönetimi',
      technicalSkills: 'MS Excel, Salesforce, SAP, PowerBI',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      preferredCity: 'İstanbul',
      preferredDistrict: 'Kadıköy',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Kadıköy',
      educationLevel: 'Lisans',
      languages: 'Türkçe, İngilizce',
      availability: '1 ay içinde',
      contactPhone: '05551112233',
      contactEmail: 'synthetic.seeker@example.com',
    },
  });

  it('Scenario A: Very Strong Match (Çok Güçlü Eşleşme - Same role, sector, skills, city, hybrid)', async () => {
    const employerListingA = createListing({
      id: ids.listing('test-lst-syn-career-hire-a'),
      ownerId: employerUser,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Kıdemli Sigorta Satış Uzmanı Arıyoruz',
      shortDescription: 'Sigorta sektöründe deneyimli satış uzmanı arıyoruz.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        preferredRoles: 'Satış Uzmanı, Kıdemli Satış Uzmanı',
        primarySector: 'Sigortacılık',
        experienceLevel: '5+ yıl',
        professionalSkills: 'Satış Yönetimi, CRM, Müşteri Yönetimi',
        technicalSkills: 'Salesforce, MS Excel',
        workType: 'Tam zamanlı',
        workplacePreference: 'Hibrit',
        preferredCity: 'İstanbul',
        preferredDistrict: 'Kadıköy',
        educationLevel: 'Lisans',
        languages: 'Türkçe',
        availability: '1 ay içinde',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, employerListingA]);
    const service = new CareerMatchService(store);

    const matches = await service.getCareerMatches(seekerUser);
    expect(matches.opportunities).not.toBeNull();
    const topCard = matches.opportunities!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(80);
    expect(['very_strong', 'high', 'strong']).toContain(topCard.band);
    expect(topCard.reasons.length).toBeGreaterThan(0);
    // Masking check
    expect((topCard as any).contactPhone).toBeUndefined();
    expect((topCard as any).contactEmail).toBeUndefined();
  });

  it('Scenario B & I: Same City with District Distance (İstanbul Anadolu vs İstanbul Avrupa)', async () => {
    const employerListingB = createListing({
      id: ids.listing('test-lst-syn-career-hire-b'),
      ownerId: employerUser,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Avrupa Yakası Satış Temsilcisi',
      shortDescription: 'Maslak ofisimizde çalışacak satış uzmanı.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        primarySector: 'Sigortacılık',
        experienceLevel: '3-5 yıl',
        professionalSkills: 'Satış Yönetimi, CRM',
        technicalSkills: 'MS Excel',
        workType: 'Tam zamanlı',
        workplacePreference: 'İş yerinde',
        preferredCity: 'İstanbul',
        preferredDistrict: 'Sarıyer', // Avrupa
        educationLevel: 'Lisans',
        languages: 'Türkçe',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, employerListingB]);
    const service = new CareerMatchService(store);

    const matches = await service.getCareerMatches(seekerUser);
    expect(matches.opportunities).not.toBeNull();
    const topCard = matches.opportunities!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(65);
  });

  it('Scenario F: Same Role / Different Sector (Bilişim vs Sigortacılık)', async () => {
    const employerListingF = createListing({
      id: ids.listing('test-lst-syn-career-hire-f'),
      ownerId: employerUser,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Bilişim Yazılım Satış Uzmanı',
      shortDescription: 'SaaS ürünlerimizin satışını yapacak uzman.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        primarySector: 'Bilişim / Yazılım', // Different sector
        experienceLevel: '5+ yıl',
        professionalSkills: 'Satış Yönetimi, CRM',
        technicalSkills: 'MS Excel',
        workType: 'Tam zamanlı',
        workplacePreference: 'Hibrit',
        preferredCity: 'İstanbul',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, employerListingF]);
    const service = new CareerMatchService(store);

    const matches = await service.getCareerMatches(seekerUser);
    expect(matches.opportunities).not.toBeNull();
    const topCard = matches.opportunities!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(55);
    expect(topCard.score).toBeLessThanOrEqual(85);
  });

  it('Scenario E: Completely Incompatible Profile (Aşçı vs Satış Uzmanı)', async () => {
    const employerListingE = createListing({
      id: ids.listing('test-lst-syn-career-hire-e'),
      ownerId: employerUser,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Restoran Aşçısı Arıyoruz',
      shortDescription: 'İtalyan mutfağında deneyimli şef / aşçı.',
      city: 'İzmir',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Aşçı',
        primarySector: 'Gıda / Yeme İçme',
        experienceLevel: '1-3 yıl',
        professionalSkills: 'Mutfak Yönetimi, Hijyen',
        technicalSkills: 'İtalyan Mutfağı, Pasta Yapımı',
        workType: 'Vardiyalı',
        workplacePreference: 'İş yerinde',
        preferredCity: 'İzmir',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, employerListingE]);
    const service = new CareerMatchService(store);

    const matches = await service.getCareerMatches(seekerUser);
    const cards = matches.opportunities?.matches || [];
    expect(cards.some((c) => c.listingId === employerListingE.id)).toBe(false);
  });

  it('Scenario: Self-Match Prevention', async () => {
    const selfHireListing = createListing({
      id: ids.listing('test-lst-syn-career-hire-self'),
      ownerId: seekerUser, // SAME owner!
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Kendi Şirketime Satış Uzmanı',
      shortDescription: 'Kendi açtığım işveren ilanı.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        primarySector: 'Sigortacılık',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, selfHireListing]);
    const service = new CareerMatchService(store);

    const matches = await service.getCareerMatches(seekerUser);
    const cards = matches.opportunities?.matches || [];
    expect(cards.some((c) => c.listingId === selfHireListing.id)).toBe(false);
  });

  it('Scenario: Detail Page Recommendations and Score Consistency', async () => {
    const employerListingD = createListing({
      id: ids.listing('test-lst-syn-career-hire-d'),
      ownerId: employerUser,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Kurumsal Satış Yöneticisi',
      shortDescription: 'Sigorta ve finans portföyü için yönetici.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        desiredRole: 'Satış Uzmanı',
        preferredRoles: 'Satış Uzmanı, Satış Yöneticisi',
        primarySector: 'Sigortacılık',
        experienceLevel: '5+ yıl',
        professionalSkills: 'Satış Yönetimi, CRM, Portföy Yönetimi',
        technicalSkills: 'Salesforce',
        workType: 'Tam zamanlı',
        workplacePreference: 'Hibrit',
        preferredCity: 'İstanbul',
      },
    });

    const store = new MemoryListingStore([seekerMainListing, employerListingD]);
    const service = new CareerMatchService(store);

    // 1. Dashboard Matches
    const dashboardMatches = await service.getCareerMatches(seekerUser);
    const dashboardCard = dashboardMatches.opportunities?.matches.find((c) => c.listingId === employerListingD.id);
    expect(dashboardCard).toBeDefined();

    // 2. Detail Page Recommendations
    const detailSection = await service.getListingRecommendations(employerListingD);
    expect(detailSection).not.toBeNull();
    const detailCard = detailSection!.matches.find((c) => c.listingId === seekerMainListing.id);
    expect(detailCard).toBeDefined();

    // Scores MUST be identical
    expect(dashboardCard!.score).toBe(detailCard!.score);
    expect(dashboardCard!.band).toBe(detailCard!.band);
  });
});
