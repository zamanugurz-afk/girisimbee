import { describe, expect, it, vi } from 'vitest';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { createListing } from '@/features/listings/factories/listing.factory';
import type { Listing, ListingFilter } from '@/features/listings/types/listing.entity.types';
import { ids } from '@/lib/domain/ids';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';
import { PartnershipMatchService } from '@/features/partnership-matching/service';
import { DigitalSolutionMatchService } from '@/features/digital-solution-matching/service';
import { FranchiseMatchService } from '@/features/franchise-matching/service';
import { ContactRequestService } from '@/features/contact-requests/services/contact-request.service';
import { MockContactRequestRepository } from '@/features/contact-requests/repository/mock/contact-request.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';

class CrossCategoryMemoryStore {
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

describe('Girişimbee Cross-Category Isolation & Contact Request Stress Test Suite', () => {
  const userA = ids.user('test-usr-syn-cross-a');
  const userB = ids.user('test-usr-syn-cross-b');

  // Listings across all categories
  const careerListing = createListing({
    id: ids.listing('test-lst-syn-career-1'),
    ownerId: userA,
    categoryId: CATEGORY_IDS.isBul,
    listingTypeId: LISTING_TYPE_IDS.isBulDefault,
    moduleKey: 'candidates',
    title: 'Satış Uzmanı İş Arıyor',
    shortDescription: 'Sigorta satış uzmanı kariyer ilanı.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { desiredRole: 'Satış Uzmanı', primarySector: 'Sigortacılık' },
  });

  const partnerListing = createListing({
    id: ids.listing('test-lst-syn-partner-1'),
    ownerId: userB,
    categoryId: CATEGORY_IDS.ortakBul,
    listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
    moduleKey: 'founders',
    title: 'Fintech Girişimine Kurucu Ortak',
    shortDescription: 'Fintech girişimi için kurucu ortak arıyoruz.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { partnershipIntent: 'seeking', primarySector: 'Finans / Bankacılık', partnerType: 'teknik' },
  });

  const digitalListing = createListing({
    id: ids.listing('test-lst-syn-digital-1'),
    ownerId: userB,
    categoryId: CATEGORY_IDS.dijitalAi,
    listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
    title: 'E-Ticaret ve CRM SaaS Çözümü',
    shortDescription: 'KOBİ e-ticaret ve CRM yazılımı.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { capabilities: ['crm', 'eticaret'], sector: 'Bilişim / Yazılım' },
  });

  const franchiseListing = createListing({
    id: ids.listing('test-lst-syn-franchise-1'),
    ownerId: userB,
    categoryId: CATEGORY_IDS.bayilikAl,
    listingTypeId: LISTING_TYPE_IDS.franchiseGiveDefault,
    moduleKey: 'franchise',
    title: 'Kahve Bayilik Zinciri',
    shortDescription: 'Kahve zinciri franchise bayiliği.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { sector: 'Gıda / Yeme İçme', totalInvestment: 1000000 },
  });

  const marketListing = createListing({
    id: ids.listing('test-lst-syn-market-1'),
    ownerId: userB,
    categoryId: CATEGORY_IDS.genelIlan,
    listingTypeId: LISTING_TYPE_IDS.genelIlanDefault,
    title: 'Devren Satılık Restoran Ekipmanı',
    shortDescription: 'Endüstriyel mutfak restoran ekipmanları.',
    city: 'İstanbul',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    customFields: { price: 150000 },
  });

  const allPool = [careerListing, partnerListing, digitalListing, franchiseListing, marketListing];

  it('Strict Cross-Category Isolation: Career Match Service NEVER matches with Partner, Digital, Franchise, or Market', async () => {
    const store = new CrossCategoryMemoryStore(allPool);
    const careerService = new CareerMatchService(store);

    const matches = await careerService.getCareerMatches(userA);
    const allCards = [
      ...(matches.opportunities?.matches || []),
      ...(matches.candidates?.matches || []),
    ];

    expect(allCards.some((c) => c.listingId === partnerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === digitalListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === franchiseListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === marketListing.id)).toBe(false);
  });

  it('Strict Cross-Category Isolation: Partnership Match Service NEVER matches with Career, Digital, Franchise, or Market', async () => {
    const store = new CrossCategoryMemoryStore(allPool);
    const partnerService = new PartnershipMatchService(store);

    const matches = await partnerService.getPartnershipMatches(userB);
    const allCards = [
      ...(matches.partners?.matches || []),
      ...(matches.ventures?.matches || []),
    ];

    expect(allCards.some((c) => c.listingId === careerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === digitalListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === franchiseListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === marketListing.id)).toBe(false);
  });

  it('Strict Cross-Category Isolation: Digital Solution Match Service NEVER matches with Career, Partner, Franchise, or Market', async () => {
    const store = new CrossCategoryMemoryStore(allPool);
    const digitalService = new DigitalSolutionMatchService(store);

    const matches = await digitalService.getDigitalSolutionMatches(userA);
    const allCards = matches.solutions?.matches || [];

    expect(allCards.some((c) => c.listingId === careerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === partnerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === franchiseListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === marketListing.id)).toBe(false);
  });

  it('Strict Cross-Category Isolation: Franchise Match Service NEVER matches with Career, Partner, Digital, or Market', async () => {
    const store = new CrossCategoryMemoryStore(allPool);
    const franchiseService = new FranchiseMatchService(store);

    const matches = await franchiseService.getFranchiseMatches(userA);
    const allCards = matches?.matches || [];

    expect(allCards.some((c) => c.listingId === careerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === partnerListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === digitalListing.id)).toBe(false);
    expect(allCards.some((c) => c.listingId === marketListing.id)).toBe(false);
  });

  it('Empty State Test: Users with no matchable intent or compatible pool receive clear empty state without crashes', async () => {
    const emptyUser = ids.user('test-usr-syn-empty-1');
    const store = new CrossCategoryMemoryStore(allPool);

    const careerService = new CareerMatchService(store);
    const careerMatches = await careerService.getCareerMatches(emptyUser);
    expect(careerMatches.opportunities).toBeNull();
    expect(careerMatches.candidates).toBeNull();

    const partnerService = new PartnershipMatchService(store);
    const partnerMatches = await partnerService.getPartnershipMatches(emptyUser);
    expect(partnerMatches.partners).toBeNull();
    expect(partnerMatches.ventures).toBeNull();

    const digitalService = new DigitalSolutionMatchService(store);
    const digitalMatches = await digitalService.getDigitalSolutionMatches(emptyUser);
    expect(digitalMatches.solutions).toBeNull();

    const franchiseService = new FranchiseMatchService(store);
    const franchiseMatches = await franchiseService.getFranchiseMatches(emptyUser);
    if (franchiseMatches) {
      expect(franchiseMatches.matches.length).toBe(0);
    }
  });

  it('Contact Request Lifecycle: Request -> Pending -> Accepted -> PII is strictly protected until Accepted', async () => {
    const repo = new MockContactRequestRepository();
    const listings = new MockListingRepository();
    const profiles = new MockProfileRepository();

    const senderId = ids.user('test-usr-syn-sender');
    const receiverId = ids.user('test-usr-syn-receiver');

    const listing = await listings.create({
      ownerId: receiverId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Kıdemli Satış Uzmanı Aday Profili',
      shortDescription: 'Kurumsal satış uzmanı iş arıyor, profil detayları burada.',
      status: 'published',
      contactPhone: '+905551112233',
    });
    await listings.update(listing.id, { publishedAt: new Date().toISOString() });

    await profiles.create(
      createProfile({
        userId: senderId,
        displayName: 'Aday Mehmet',
        username: 'aday-mehmet',
      }),
    );
    await profiles.create(
      createProfile({
        userId: receiverId,
        displayName: 'İşveren Firma',
        username: 'isveren-firma',
      }),
    );

    const messaging = {
      getOrCreateForListing: vi.fn(async () => ({
        id: ids.conversation(crypto.randomUUID()),
        participantIds: [receiverId, senderId],
        listingId: listing.id,
        companyId: null,
        status: 'open' as const,
        lastMessageAt: null,
        lastMessagePreview: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      })),
    } as unknown as IMessagingService;

    const notifications: INotificationService = {
      send: vi.fn(async (input) => ({
        id: ids.notification(crypto.randomUUID()),
        userId: input.userId,
        type: input.type,
        status: 'delivered' as const,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        readAt: null,
        deliveredAt: new Date().toISOString(),
        metadata: input.metadata ?? {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      })),
    } as unknown as INotificationService;

    const contactService = new ContactRequestService(repo, listings, messaging, profiles, notifications);

    // 1. Create Contact Request
    const { view: createdView } = await contactService.create({
      listingId: listing.id,
      requesterUserId: senderId,
      message: 'İlanınızla ilgileniyorum, detayları görüşmek isterim.',
      acceptTerms: true,
    });

    expect(createdView.status).toBe('pending');
    expect(createdView.effectiveStatus).toBe('pending');
    // Before accept: owner phone & PII MUST be hidden / null
    expect(createdView.ownerContactPhone).toBeNull();
    expect(createdView.ownerFullName).toBeNull();

    // 2. Receiver views requests
    const receiverInbox = await contactService.listIncomingForOwner(receiverId);
    expect(receiverInbox.length).toBe(1);
    expect(receiverInbox[0].id).toBe(createdView.id);
    expect(receiverInbox[0].status).toBe('pending');

    // 3. Accept Request
    const { view: acceptedView } = await contactService.accept({
      requestId: ids.contactRequest(createdView.id),
      actorUserId: receiverId,
      acceptTerms: true,
    });
    expect(acceptedView.status).toBe('accepted');
    expect(acceptedView.respondedAt).toBeDefined();
  });
});
