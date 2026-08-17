import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CAREER_CONTACT_NOTIFICATION } from '@/features/contact-requests/config/career-contact-notification-copy';
import { CONTACT_CTA_DEFAULT_LABEL, CONTACT_CTA_PRIVACY_SHORT } from '@/features/contact-requests/config/contact-cta-copy';
import { MockContactRequestRepository } from '@/features/contact-requests/repository/mock/contact-request.repository.mock';
import { ContactRequestService } from '@/features/contact-requests/services/contact-request.service';
import { calculateCareerProfileCompletion } from '@/features/career-profile/completion';
import { resolveCareerMatchEmptyState } from '@/features/career-profile/journey';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { CareerMatchService } from '@/features/matching-engine/career-match.service';
import { MATCH_SECTION_COPY } from '@/features/matching-engine/presentation/career-match-copy';
import { scoreNormalizedCareerSources } from '@/features/matching-engine/normalized-match';
import { extractCareerMatchProfile } from '@/features/career-profile/normalize';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { ids, type ListingId, type UserId } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';
import type { Conversation } from '@/features/messaging/types/conversation.types';

const SEEKER_ID = ids.user('u1000001-0001-4000-8000-000000000001');
const HIRER_ID = ids.user('u1000001-0001-4000-8000-000000000002');
const VALID_MESSAGE = 'Merhaba, kariyer ilaniniz hakkinda gorusmek istiyorum.';

const ALIGNED = {
  desiredRole: 'Dijital Pazarlama Uzmanı',
  primarySector: 'Teknoloji',
  experienceLevel: 'Mid',
  professionalSkills: 'SEO',
  technicalSkills: 'Google Ads',
  workType: 'Tam zamanlı',
  workplacePreference: 'Hibrit',
  preferredCity: 'İstanbul',
  educationLevel: 'Lisans',
  languages: 'İngilizce — İyi, Türkçe — Ana Dil',
  availability: 'Hemen',
};

function expectNoContactLeak(value: unknown) {
  const json = JSON.stringify(value);
  expect(json).not.toMatch(/contactPhone|contactEmail|contactWhatsapp/i);
  expect(json).not.toContain('05551234567');
  expect(json).not.toContain('gizli@example.com');
}

describe('career journey e2e', () => {
  let listings: MockListingRepository;
  let requests: MockContactRequestRepository;
  let profiles: MockProfileRepository;
  let notifications: INotificationService;
  let contact: ContactRequestService;
  let matching: CareerMatchService;
  let seekListingId: ListingId;
  let hireListingId: ListingId;
  let seekerId: UserId;
  let hirerId: UserId;

  beforeEach(async () => {
    listings = new MockListingRepository();
    requests = new MockContactRequestRepository();
    profiles = new MockProfileRepository();
    seekerId = SEEKER_ID;
    hirerId = HIRER_ID;

    const seek = await listings.create({
      ownerId: seekerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'Dijital pazarlama uzmanı olarak iş arıyorum',
      shortDescription: 'Anonim kariyer özeti, en az yirmi karakter.',
      status: 'published',
      customFields: { ...ALIGNED },
      contactPhone: '05551234567',
      contactEmail: 'gizli@example.com',
    });
    const hire = await listings.create({
      ownerId: hirerId,
      categoryId: CATEGORY_IDS.iseAl,
      listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
      moduleKey: 'employers',
      title: 'Dijital pazarlama uzmanı arıyoruz',
      shortDescription: 'Açık pozisyon ilanı, en az yirmi karakter.',
      status: 'published',
      customFields: { ...ALIGNED, positionTitle: ALIGNED.desiredRole, requiredResponsibilities: 'Kampanya yönetimi' },
      contactPhone: '05559876543',
      contactEmail: 'isveren@example.com',
    });
    await listings.update(seek.id, { publishedAt: '2026-08-01T00:00:00.000Z', status: 'published' });
    await listings.update(hire.id, { publishedAt: '2026-08-02T00:00:00.000Z', status: 'published' });
    seekListingId = seek.id;
    hireListingId = hire.id;

    await profiles.create(createProfile({ userId: seekerId, displayName: 'Ayşe Yılmaz', username: 'ayse-yilmaz' }));
    await profiles.create(createProfile({ userId: hirerId, displayName: 'Açık Yazılım', username: 'acik-yazilim' }));

    notifications = {
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

    const messaging = {
      getOrCreateForListing: vi.fn(async () =>
        ({
          id: ids.conversation('c1000001-0001-4000-8000-000000000001'),
          participantIds: [seekerId, hirerId],
          listingId: hireListingId,
          companyId: null,
          status: 'open',
          lastMessageAt: null,
          lastMessagePreview: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        }) as Conversation,
      ),
    } as unknown as IMessagingService;

    contact = new ContactRequestService(requests, listings, messaging, profiles, notifications);
    matching = new CareerMatchService(listings, {
      findProfilesByUserIds: async () => [
        { userId: seekerId, displayName: 'Ayşe Yılmaz' },
        { userId: hirerId, displayName: 'Açık Yazılım' },
      ],
    });
  });

  it('TEST 1: seeker sees a matching hire listing', async () => {
    const result = await matching.getCareerMatches(seekerId);
    expect(result.opportunities?.title).toBe('Size Uygun İş İlanları');
    expect(result.opportunities?.matches[0]?.title).toBe('Dijital pazarlama uzmanı arıyoruz');
    expect(result.opportunities?.matches[0]?.href).toMatch(/^\/ilan\//);
    expect(MATCH_SECTION_COPY.opportunities.reviewCta).toBe('İlanı İncele');
    expect(CONTACT_CTA_DEFAULT_LABEL).toBe('İletişim Talebi Gönder');
  });

  it('TEST 2: employer sees a matching candidate', async () => {
    const result = await matching.getCareerMatches(hirerId);
    expect(result.candidates?.title).toBe('Size Uygun Adaylar');
    expect(result.candidates?.matches[0]?.href).toMatch(/^\/ilan\//);
    expect(result.candidates?.matches[0]?.partyLabel).toBe('Ayşe ******');
    expect(MATCH_SECTION_COPY.candidates.reviewCta).toBe('Adayı İncele');
  });

  it('TEST 3: seeker can send a contact request to the hire listing', async () => {
    const { view } = await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    expect(view.effectiveStatus).toBe('pending');
    expect(view.ownerContactPhone).toBeNull();
    expect(notifications.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: hirerId,
        title: CAREER_CONTACT_NOTIFICATION.created.title,
        actionUrl: expect.stringContaining('talep='),
      }),
    );
  });

  it('TEST 4: employer sees the incoming seeker request', async () => {
    await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const incoming = await contact.listIncomingForOwner(hirerId);
    expect(incoming).toHaveLength(1);
    expect(incoming[0]?.effectiveStatus).toBe('pending');
    expect(incoming[0]?.requesterDisplayName).toBe('Ayşe Yılmaz');
    expect(incoming[0]?.ownerContactPhone).toBeNull();
  });

  it('TEST 5: employer can accept the seeker request', async () => {
    const { entity } = await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const { view } = await contact.accept({
      requestId: entity.id,
      actorUserId: hirerId,
      acceptTerms: true,
    });
    expect(view.effectiveStatus).toBe('accepted');
    expect(notifications.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: seekerId,
        title: CAREER_CONTACT_NOTIFICATION.accepted.title,
      }),
    );
  });

  it('TEST 6: seeker sees the accepted request without a matching-score field', async () => {
    const { entity } = await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await contact.accept({ requestId: entity.id, actorUserId: hirerId, acceptTerms: true });
    const mine = await contact.getMineForListing(hireListingId, seekerId);
    expect(mine?.effectiveStatus).toBe('accepted');
    expect(mine).not.toHaveProperty('matching_score');
  });

  it('TEST 7: employer can send a contact request to the candidate listing', async () => {
    const { view } = await contact.create({
      listingId: seekListingId,
      requesterUserId: hirerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    expect(view.effectiveStatus).toBe('pending');
    expect(notifications.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: seekerId,
        title: CAREER_CONTACT_NOTIFICATION.created.title,
      }),
    );
  });

  it('TEST 8: candidate sees the incoming employer request', async () => {
    await contact.create({
      listingId: seekListingId,
      requesterUserId: hirerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const incoming = await contact.listIncomingForOwner(seekerId);
    expect(incoming[0]?.effectiveStatus).toBe('pending');
    expect(incoming[0]?.ownerContactPhone).toBeNull();
  });

  it('TEST 9: candidate can accept the employer request', async () => {
    const { entity } = await contact.create({
      listingId: seekListingId,
      requesterUserId: hirerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const { view } = await contact.accept({
      requestId: entity.id,
      actorUserId: seekerId,
      acceptTerms: true,
    });
    expect(view.effectiveStatus).toBe('accepted');
    expect(notifications.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: hirerId,
        title: CAREER_CONTACT_NOTIFICATION.accepted.title,
      }),
    );
  });

  it('TEST 10: phone, email, and WhatsApp stay hidden before accept', async () => {
    const matches = await matching.getCareerMatches(seekerId);
    expectNoContactLeak(matches);
    const { view } = await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    expect(view.ownerContactPhone).toBeNull();
    expect(JSON.stringify(view)).not.toContain('0555');
    expect(JSON.stringify(view)).not.toContain('@example.com');
    const incoming = await contact.listIncomingForOwner(hirerId);
    expect(incoming[0]?.ownerContactPhone).toBeNull();
    expect(CONTACT_CTA_PRIVACY_SHORT).toBe('İletişim bilgileriniz gizli kalır.');
  });

  it('TEST 11: the same user cannot create a duplicate pending request', async () => {
    await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await expect(
      contact.create({
        listingId: hireListingId,
        requesterUserId: seekerId,
        acceptTerms: true,
        message: VALID_MESSAGE,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('TEST 12: matching recomputes from the latest profile instead of a stored score', async () => {
    const first = await matching.getCareerMatches(seekerId);
    const firstScore = first.opportunities?.matches[0]?.score;
    expect(firstScore).toBeGreaterThanOrEqual(80);
    expect(first.opportunities?.matches[0]).not.toHaveProperty('matching_score');

    await listings.update(hireListingId, {
      customFields: {
        ...ALIGNED,
        professionalSkills: 'Satış',
        technicalSkills: 'Excel',
      },
    });

    const second = await matching.getCareerMatches(seekerId);
    expect(second.opportunities?.matches[0]?.score).toBeLessThan(firstScore ?? 0);
  });

  it('TEST 13: completion percent does not change the matching score', () => {
    const seeker = { customFields: ALIGNED };
    const hire = { customFields: { ...ALIGNED, positionTitle: ALIGNED.desiredRole } };
    const before = scoreNormalizedCareerSources(seeker, hire);
    const partial = calculateCareerProfileCompletion({
      kind: 'seek',
      source: { customFields: { desiredRole: ALIGNED.desiredRole, primarySector: ALIGNED.primarySector } },
    });
    const after = scoreNormalizedCareerSources(seeker, hire);
    expect(partial.percent).toBeGreaterThan(0);
    expect(partial.percent).toBeLessThan(100);
    expect(after.score).toBe(before.score);
    expect(extractCareerMatchProfile(seeker).role).toBe(ALIGNED.desiredRole);
  });

  it('TEST 14: matching API-shaped results never leak PII', async () => {
    const result = await matching.getCareerMatches(seekerId);
    expectNoContactLeak(result);
    expect(result.opportunities?.matches[0]).not.toHaveProperty('customFields');
    expect(JSON.stringify(result)).not.toContain('gizli@example.com');
  });

  it('keeps reject notifications on the existing contact-request path', async () => {
    const { entity } = await contact.create({
      listingId: hireListingId,
      requesterUserId: seekerId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const { effectiveStatus } = await contact.reject(entity.id, hirerId);
    expect(effectiveStatus).toBe('rejected');
    expect(notifications.send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: seekerId,
        title: CAREER_CONTACT_NOTIFICATION.rejected.title,
      }),
    );
    const mine = await contact.getMineForListing(hireListingId, seekerId);
    expect(mine?.ownerContactPhone).toBeNull();
  });

  it('classifies draft-only career listings as the no-listing empty state', async () => {
    const draftOnly = new MockListingRepository();
    const draft = await draftOnly.create({
      ownerId: seekerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      moduleKey: 'candidates',
      title: 'Taslak kariyer profili',
      shortDescription: 'Anonim kariyer özeti, en az yirmi karakter.',
      status: 'draft',
      customFields: { desiredRole: ALIGNED.desiredRole },
    });
    const service = new CareerMatchService(draftOnly);
    const result = await service.getCareerMatches(seekerId);
    expect(result.presence?.seek).toBe('draft');
    expect(result.opportunities).toBeNull();
    expect(
      resolveCareerMatchEmptyState({
        kind: 'seek',
        hasPublishedSource: false,
        hasProfileRecord: result.presence?.seek !== 'none',
        complete: false,
        matchCount: 0,
      })?.ctaLabel,
    ).toBe('İlan Oluştur');
    expect(draft.status).toBe('draft');
  });
});
