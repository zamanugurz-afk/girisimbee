import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ids, type ListingId, type UserId } from '@/lib/domain/ids';
import { ForbiddenError, ValidationError } from '@/lib/domain/errors';
import { MockContactRequestRepository } from '@/features/contact-requests/repository/mock/contact-request.repository.mock';
import { ContactRequestService } from '@/features/contact-requests/services/contact-request.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';
import type { Conversation } from '@/features/messaging/types/conversation.types';

import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';

const OWNER = ids.user('u0000001-0001-4000-8000-000000000001');
const REQUESTER = ids.user('u0000001-0001-4000-8000-000000000002');
const STRANGER = ids.user('u0000001-0001-4000-8000-000000000003');
const CONVERSATION_ID = ids.conversation('c0000001-0001-4000-8000-000000000001');
const VALID_MESSAGE = 'Merhaba, ilaniniz hakkinda bilgi almak istiyorum.';

describe('ContactRequestService', () => {
  let repo: MockContactRequestRepository;
  let listings: MockListingRepository;
  let profiles: MockProfileRepository;
  let messaging: IMessagingService;
  let notifications: INotificationService;
  let service: ContactRequestService;
  let listingId: ListingId;
  let ownerId: UserId;
  let requesterId: UserId;

  beforeEach(async () => {
    repo = new MockContactRequestRepository();
    listings = new MockListingRepository();
    profiles = new MockProfileRepository();
    ownerId = OWNER;
    requesterId = REQUESTER;

    const listing = await listings.create({
      ownerId,
      categoryId: CATEGORY_IDS.isBul,
      listingTypeId: LISTING_TYPE_IDS.isBulDefault,
      title: 'Test ilan',
      shortDescription: 'Kısa açıklama metni yeterince uzun',
      status: 'published',
      contactPhone: '+905551234567',
    });
    listingId = listing.id;
    await listings.update(listingId, { publishedAt: new Date().toISOString() });

    await profiles.create(
      createProfile({
        userId: REQUESTER,
        displayName: 'Talep Gönderen',
        username: 'talep-gonderen',
      }),
    );
    await profiles.create(
      createProfile({
        userId: OWNER,
        displayName: 'İlan Sahibi',
        username: 'ilan-sahibi',
      }),
    );

    messaging = {
      getOrCreateForListing: vi.fn(async () =>
        ({
          id: CONVERSATION_ID,
          participantIds: [OWNER, REQUESTER],
          listingId,
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

    service = new ContactRequestService(repo, listings, messaging, profiles, notifications);
  });

  it('creates a contact request when terms accepted', async () => {
    const { view } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    expect(view.effectiveStatus).toBe('pending');
    expect(view.ownerContactPhone).toBeNull();
    expect(notifications.send).toHaveBeenCalled();
  });

  it('requires terms on create', async () => {
    await expect(
      service.create({
        listingId,
        requesterUserId: requesterId,
        acceptTerms: false,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('forbids unauthorized accept', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });

    await expect(
      service.accept({
        requestId: entity.id,
        actorUserId: STRANGER,
        acceptTerms: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('accept creates conversation and reveals phone only to that requester', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });

    const pendingMine = await service.getMineForListing(listingId, requesterId);
    expect(pendingMine?.effectiveStatus).toBe('pending');
    expect(pendingMine?.ownerContactPhone).toBeNull();

    const { view } = await service.accept({
      requestId: entity.id,
      actorUserId: ownerId,
      acceptTerms: true,
    });

    expect(view.effectiveStatus).toBe('accepted');
    expect(view.conversationId).toBe(String(CONVERSATION_ID));
    expect(messaging.getOrCreateForListing).not.toHaveBeenCalled();

    const mine = await service.getMineForListing(listingId, requesterId);
    expect(mine?.effectiveStatus).toBe('accepted');
    expect(mine?.conversationId).toBe(String(CONVERSATION_ID));
    expect(mine?.ownerContactPhone).toBe('+905551234567');
    expect(mine?.ownerDisplayName).toBe('İlan Sahibi');

    const strangerMine = await service.getMineForListing(listingId, STRANGER);
    expect(strangerMine).toBeNull();
  });

  it('owner sees pending incoming requests', async () => {
    await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });

    const incoming = await service.listIncomingForOwner(ownerId);
    expect(incoming).toHaveLength(1);
    expect(incoming[0]?.effectiveStatus).toBe('pending');
    expect(incoming[0]?.ownerContactPhone).toBeNull();
    expect(incoming[0]?.requesterDisplayName).toBe('Talep Gönderen');
  });

  it('rejected requester does not get phone', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const view = await service.reject(entity.id, ownerId);
    expect(view.effectiveStatus).toBe('rejected');
    expect(view.ownerContactPhone).toBeNull();

    const mine = await service.getMineForListing(listingId, requesterId);
    expect(mine?.effectiveStatus).toBe('rejected');
    expect(mine?.ownerContactPhone).toBeNull();
    expect(messaging.getOrCreateForListing).not.toHaveBeenCalled();
  });

  it('accepted requester phone is scoped; other requester on same listing gets no phone', async () => {
    await profiles.create(
      createProfile({
        userId: STRANGER,
        displayName: 'Diğer Talepçi',
        username: 'diger-talepci',
      }),
    );

    const { entity: acceptedEntity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const { entity: otherEntity } = await service.create({
      listingId,
      requesterUserId: STRANGER,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });

    await service.accept({
      requestId: acceptedEntity.id,
      actorUserId: ownerId,
      acceptTerms: true,
    });
    await service.reject(otherEntity.id, ownerId);

    const acceptedMine = await service.getMineForListing(listingId, requesterId);
    expect(acceptedMine?.effectiveStatus).toBe('accepted');
    expect(acceptedMine?.ownerContactPhone).toBe('+905551234567');
    expect(acceptedMine?.conversationId).toBe(String(CONVERSATION_ID));

    const otherMine = await service.getMineForListing(listingId, STRANGER);
    expect(otherMine?.effectiveStatus).toBe('rejected');
    expect(otherMine?.ownerContactPhone).toBeNull();
    expect(otherMine?.conversationId).toBeNull();
  });

  it('requires terms on accept', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });

    await expect(
      service.accept({
        requestId: entity.id,
        actorUserId: ownerId,
        acceptTerms: false,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('requester can cancel pending request', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const view = await service.cancel(entity.id, requesterId);
    expect(view.effectiveStatus).toBe('cancelled');
  });

  it('forbids owner cancel', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await expect(service.cancel(entity.id, ownerId)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('owner can reject pending request', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const view = await service.reject(entity.id, ownerId);
    expect(view.effectiveStatus).toBe('rejected');
  });

  it('forbids unauthorized reject', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await expect(service.reject(entity.id, requesterId)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('blocks requester forcing accepted via repository transition matrix', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await expect(repo.forceStatus(entity.id, 'accepted', 'requester')).rejects.toThrow(
      'contact_request_invalid_transition',
    );
  });

  it('blocks owner forcing cancelled via repository transition matrix', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    await expect(repo.forceStatus(entity.id, 'cancelled', 'owner')).rejects.toThrow(
      'contact_request_invalid_transition',
    );
  });

  it('allows service expire via transition matrix', async () => {
    const { entity } = await service.create({
      listingId,
      requesterUserId: requesterId,
      acceptTerms: true,
      message: VALID_MESSAGE,
    });
    const expired = await repo.forceStatus(entity.id, 'expired', 'service');
    expect(expired.status).toBe('expired');
  });

  it('strictly forbids creating contact requests on non-eligible categories', async () => {
    const ineligibleCategories = [
      CATEGORY_IDS.iseAl,
      CATEGORY_IDS.isletmeDevri,
      CATEGORY_IDS.bayilikAl,
      CATEGORY_IDS.dijitalAi,
      CATEGORY_IDS.genelIlan,
      CATEGORY_IDS.yatirimBul,
      CATEGORY_IDS.yatirimYap,
    ];

    for (const catId of ineligibleCategories) {
      const forbiddenListing = await listings.create({
        ownerId: OWNER,
        categoryId: catId,
        listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
        title: `Forbidden test listing for ${catId}`,
        shortDescription: 'Kısa açıklama metni yeterince uzun',
        status: 'published',
      });
      await listings.update(forbiddenListing.id, { publishedAt: new Date().toISOString() });

      await expect(
        service.create({
          listingId: forbiddenListing.id,
          requesterUserId: requesterId,
          acceptTerms: true,
          message: VALID_MESSAGE,
        }),
      ).rejects.toThrow('Bu ilan tipi için iletişim talebi özelliği bulunmamaktadır.');
    }
  });

  it('allows creating contact requests on all 3 allowed categories (isBul, ortakBul seeking, ortakBul joining)', async () => {
    const allowed = [
      { cat: CATEGORY_IDS.isBul, lt: LISTING_TYPE_IDS.isBulDefault },
      { cat: CATEGORY_IDS.ortakBul, lt: LISTING_TYPE_IDS.ortakBulDefault },
    ];

    for (const item of allowed) {
      const allowedListing = await listings.create({
        ownerId: OWNER,
        categoryId: item.cat,
        listingTypeId: item.lt,
        title: `Allowed test listing for ${item.cat}`,
        shortDescription: 'Kısa açıklama metni yeterince uzun',
        status: 'published',
      });
      await listings.update(allowedListing.id, { publishedAt: new Date().toISOString() });

      const res = await service.create({
        listingId: allowedListing.id,
        requesterUserId: requesterId,
        acceptTerms: true,
        message: VALID_MESSAGE,
      });
      expect(res.entity.status).toBe('pending');
      expect(res.view.status).toBe('pending');
    }
  });
});
