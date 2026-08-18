import { describe, expect, it } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { PartnershipMatchService } from '@/features/partnership-matching/service';

class MemoryPartnershipListingStore {
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
}

describe('Girişimbee Partnership (Ortaklık) Matching Stress & Acceptance Test Suite', () => {
  const seekingUser = ids.user('test-usr-syn-partner-seeking-1');
  const joiningUser = ids.user('test-usr-syn-partner-joining-1');
  const otherSeekingUser = ids.user('test-usr-syn-partner-seeking-2');
  const otherJoiningUser = ids.user('test-usr-syn-partner-joining-2');

  // Base: Entrepreneur Seeking a Technical / Operational Partner
  const seekingMainListing = createListing({
    id: ids.listing('test-lst-syn-partner-seek-main'),
    ownerId: seekingUser,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Fintech Girişimimiz İçin Teknik Kurucu Ortak Arıyoruz',
    shortDescription: 'Tohum öncesi aşamada, MVP hazır fintech girişimimize CTO ortak arıyoruz.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: {
      partnershipIntent: 'seeking',
      primarySector: 'Finans / Bankacılık',
      preferredSectors: 'Finans / Bankacılık, Bilişim / Yazılım',
      partnerType: 'teknik',
      stage: 'mvp',
      timeCommitment: 'full-time',
      investmentAmount: 250000,
      equityOffered: '%15 - %25',
      preferredCity: 'İstanbul',
      preferredDistrict: 'Kadıköy',
      contactPhone: '05553334455',
      contactEmail: 'seeking.partner@example.com',
    },
  });

  it('Scenario 1: Seeking -> Joining Strong Match (Aynı sektör, MVP aşaması, Tam zamanlı, Teknik ortak)', async () => {
    const joiningListingStrong = createListing({
      id: ids.listing('test-lst-syn-partner-join-strong'),
      ownerId: joiningUser,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Fintech ve SaaS Girişimlerine CTO Olarak Ortak Olmak İstiyorum',
      shortDescription: '12 yıllık backend ve fintech tecrübem ile tam zamanlı ortaklık arıyorum.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'joining',
        primarySector: 'Finans / Bankacılık',
        preferredSectors: 'Finans / Bankacılık, Bilişim / Yazılım',
        partnerType: 'teknik',
        stage: 'mvp',
        timeCommitment: 'full-time',
        capitalContribution: '200000',
        preferredCity: 'İstanbul',
        contactPhone: '05559998877',
      },
    });

    const store = new MemoryPartnershipListingStore([seekingMainListing, joiningListingStrong]);
    const service = new PartnershipMatchService(store);

    const matches = await service.getPartnershipMatches(seekingUser);
    expect(matches.partners).not.toBeNull();
    const topCard = matches.partners!.matches[0];
    expect(topCard).toBeDefined();
    expect(topCard.score).toBeGreaterThanOrEqual(80);
    // Privacy: No contact phone or email leak
    expect((topCard as any).contactPhone).toBeUndefined();
    expect((topCard as any).contactEmail).toBeUndefined();
  });

  it('Scenario 3 & 4: Intent Isolation (Seeking -> Seeking and Joining -> Joining MUST NEVER match)', async () => {
    // Another seeking listing
    const otherSeekingListing = createListing({
      id: ids.listing('test-lst-syn-partner-seek-other'),
      ownerId: otherSeekingUser,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Fintech Girişimine Satış Ortağı Arıyorum',
      shortDescription: 'Fintech girişimi için satış ortağı aranıyor.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'seeking',
        primarySector: 'Finans / Bankacılık',
        partnerType: 'teknik',
        stage: 'mvp',
      },
    });

    const store = new MemoryPartnershipListingStore([seekingMainListing, otherSeekingListing]);
    const service = new PartnershipMatchService(store);

    const matches = await service.getPartnershipMatches(seekingUser);
    const cards = matches.partners?.matches || [];
    // Seeking must NOT match Seeking
    expect(cards.some((c) => c.listingId === otherSeekingListing.id)).toBe(false);
  });

  it('Scenario: Joining -> Joining Intent Isolation', async () => {
    const joiningListing1 = createListing({
      id: ids.listing('test-lst-syn-partner-join-1'),
      ownerId: joiningUser,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Fintech Ortak Olmak İstiyorum',
      shortDescription: 'Fintech girişimine ortak olmak isteyen profesyonel.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-01T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'joining',
        primarySector: 'Finans / Bankacılık',
        partnerType: 'teknik',
      },
    });

    const joiningListing2 = createListing({
      id: ids.listing('test-lst-syn-partner-join-2'),
      ownerId: otherJoiningUser,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Fintech Ortak Olmak İsteyen Yazılımcı',
      shortDescription: 'Fintech girişimine katılmak istiyorum.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'joining',
        primarySector: 'Finans / Bankacılık',
        partnerType: 'teknik',
      },
    });

    const store = new MemoryPartnershipListingStore([joiningListing1, joiningListing2]);
    const service = new PartnershipMatchService(store);

    const matches = await service.getPartnershipMatches(joiningUser);
    const cards = matches.ventures?.matches || [];
    // Joining must NOT match Joining
    expect(cards.some((c) => c.listingId === joiningListing2.id)).toBe(false);
  });

  it('Scenario: Different Stage / Sector / Time Commitment Match Score Degradation', async () => {
    const joiningListingWeak = createListing({
      id: ids.listing('test-lst-syn-partner-join-weak'),
      ownerId: otherJoiningUser,
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Tarım ve Gıda Girişimine Danışman Ortak',
      shortDescription: 'Gıda sektöründe haftada birkaç saat danışmanlık ortaklığı.',
      city: 'İzmir',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'joining',
        primarySector: 'Tarım / Hayvancılık',
        partnerType: 'finansal',
        stage: 'growth',
        timeCommitment: 'part-time',
        preferredCity: 'İzmir',
      },
    });

    const store = new MemoryPartnershipListingStore([seekingMainListing, joiningListingWeak]);
    const service = new PartnershipMatchService(store);

    const matches = await service.getPartnershipMatches(seekingUser);
    const cards = matches.partners?.matches || [];
    const weakCard = cards.find((c) => c.listingId === joiningListingWeak.id);
    if (weakCard) {
      expect(weakCard.score).toBeLessThan(55);
    }
  });

  it('Scenario: Self-Match Prevention (A user cannot match with their own partnership listing)', async () => {
    const selfJoiningListing = createListing({
      id: ids.listing('test-lst-syn-partner-join-self'),
      ownerId: seekingUser, // SAME owner as seekingMainListing!
      categoryId: CATEGORY_IDS.ortakBul,
      listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
      moduleKey: 'founders',
      title: 'Kendi Şirketime Ortak Adayı',
      shortDescription: 'Kendi açtığım ortaklık ilanı.',
      city: 'İstanbul',
      status: 'published',
      publishedAt: '2026-08-02T00:00:00.000Z',
      customFields: {
        partnershipIntent: 'joining',
        primarySector: 'Finans / Bankacılık',
        partnerType: 'teknik',
      },
    });

    const store = new MemoryPartnershipListingStore([seekingMainListing, selfJoiningListing]);
    const service = new PartnershipMatchService(store);

    const matches = await service.getPartnershipMatches(seekingUser);
    const cards = matches.partners?.matches || [];
    expect(cards.some((c) => c.listingId === selfJoiningListing.id)).toBe(false);
  });
});
