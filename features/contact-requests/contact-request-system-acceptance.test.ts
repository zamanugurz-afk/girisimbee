import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ids, type ListingId, type UserId } from '@/lib/domain/ids';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { MockContactRequestRepository } from '@/features/contact-requests/repository/mock/contact-request.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { createProfile } from '@/features/profiles/factories/profile.factory';
import { ContactRequestService } from '@/features/contact-requests/services/contact-request.service';
import {
  isContactRequestEligibleCategory,
  isContactRequestEligibleListing,
} from '@/features/contact-requests/lib/contact-disclosure';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';

describe('GİRİŞİMBEE — Contact Request System Audit & Acceptance Suite', () => {
  const SENDER_ID = ids.user('usr-audit-sender-001');
  const OWNER_ID = ids.user('usr-audit-owner-002');

  let listings: MockListingRepository;
  let requests: MockContactRequestRepository;
  let profiles: MockProfileRepository;
  let messaging: IMessagingService;
  let notifications: INotificationService;
  let service: ContactRequestService;
  let sentNotifications: Array<{ userId: UserId; title: string; body: string }> = [];

  beforeEach(async () => {
    listings = new MockListingRepository();
    requests = new MockContactRequestRepository();
    profiles = new MockProfileRepository();
    sentNotifications = [];

    await profiles.create(
      createProfile({
        userId: SENDER_ID,
        displayName: 'Mehmet Talepçi',
        phone: '+905551112233',
        email: 'mehmet@example.com',
      }),
    );

    await profiles.create(
      createProfile({
        userId: OWNER_ID,
        displayName: 'Ayşe İlan Sahibi',
        phone: '+905559998877',
        email: 'ayse@example.com',
      }),
    );

    messaging = {} as unknown as IMessagingService;
    notifications = {
      send: vi.fn(async (input) => {
        sentNotifications.push({
          userId: input.userId,
          title: input.title,
          body: typeof input.body === 'string' ? input.body : '',
        });
        return {
          id: ids.notification(crypto.randomUUID()),
          userId: input.userId,
          type: input.type,
          status: 'delivered',
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
        };
      }),
    } as unknown as INotificationService;

    service = new ContactRequestService(requests, listings, messaging, profiles, notifications);
  });

  describe('1. Category Eligibility Matrix (Strict Whitelist of 3 Categories)', () => {
    it('ALLOWS exactly the 3 designated types in both helper and service level', async () => {
      // 1. İş Arıyorum
      expect(isContactRequestEligibleCategory('is-ariyorum')).toBe(true);
      expect(isContactRequestEligibleCategory('find-job')).toBe(true);
      expect(isContactRequestEligibleCategory('is-bul')).toBe(true);
      expect(isContactRequestEligibleCategory(CATEGORY_IDS.isBul)).toBe(true);

      // 2. Ortak Arıyorum
      expect(isContactRequestEligibleCategory('ortak-ariyorum')).toBe(true);
      expect(isContactRequestEligibleCategory('find-partner')).toBe(true);
      expect(isContactRequestEligibleCategory('ortak-bul')).toBe(true);
      expect(isContactRequestEligibleCategory(CATEGORY_IDS.ortakBul)).toBe(true);

      // 3. Ortak Olmak İstiyorum
      expect(isContactRequestEligibleCategory('ortak-olmak')).toBe(true);

      // Check listing level eligibility
      expect(isContactRequestEligibleListing({ moduleKey: 'candidates' })).toBe(true);
      expect(isContactRequestEligibleListing({ moduleKey: 'partners' })).toBe(true);
      expect(isContactRequestEligibleListing({ moduleKey: 'founders' })).toBe(true);
    });

    it('STRICTLY FORBIDS contact requests on all other 5 category types', async () => {
      const blacklisted = [
        { name: 'İşe Alıyorum', categoryId: CATEGORY_IDS.iseAl, slug: 'ise-al' },
        { name: 'İşletme Devri', categoryId: CATEGORY_IDS.isletmeDevri, slug: 'isletme-devri' },
        { name: 'Franchise', categoryId: CATEGORY_IDS.bayilikAl, slug: 'franchise' },
        { name: 'Market / Fırsatlar', categoryId: CATEGORY_IDS.genelIlan, slug: 'market' },
        { name: 'Dijital & AI', categoryId: CATEGORY_IDS.dijitalAi, slug: 'dijital-ai' },
      ];

      for (const item of blacklisted) {
        expect(isContactRequestEligibleCategory(item.slug)).toBe(false);
        expect(isContactRequestEligibleCategory(item.categoryId)).toBe(false);

        const listing = await listings.create({
          ownerId: OWNER_ID,
          categoryId: item.categoryId,
          listingTypeId: LISTING_TYPE_IDS.iseAlDefault,
          title: `${item.name} Test İlanı`,
          shortDescription: 'Bu ilan tipi için iletişim talebi olmamalıdır.',
          status: 'published',
        });
        await listings.update(listing.id, { publishedAt: new Date().toISOString() });

        // Service level POST must throw ForbiddenError
        await expect(
          service.create({
            listingId: listing.id,
            requesterUserId: SENDER_ID,
            acceptTerms: true,
            message: 'Bu mesaja izin verilmemeli en az otuz karakter.',
          }),
        ).rejects.toThrow('Bu ilan tipi için iletişim talebi özelliği bulunmamaktadır.');
      }
    });
  });

  describe('2. Contact Request Full Lifecycle & Contact Disclosure', () => {
    it('executes request -> pending (hidden contact) -> accept -> contact reveal', async () => {
      // Create eligible candidate listing
      const listing = await listings.create({
        ownerId: OWNER_ID,
        categoryId: CATEGORY_IDS.isBul,
        listingTypeId: LISTING_TYPE_IDS.isBulDefault,
        title: 'Kıdemli Yazılım Geliştirici İş Arıyor',
        shortDescription: '10 yıllık deneyimli fullstack yazılım mühendisi.',
        status: 'published',
        contactPhone: '+905559998877',
      });
      await listings.update(listing.id, { publishedAt: new Date().toISOString() });

      // Step 1: Create Request
      const { entity, view: createdView } = await service.create({
        listingId: listing.id,
        requesterUserId: SENDER_ID,
        acceptTerms: true,
        message: 'Profilinizle ilgileniyoruz, teknik liderlik pozisyonu için görüşmek isteriz.',
      });

      expect(createdView.status).toBe('pending');
      expect(createdView.effectiveStatus).toBe('pending');
      expect(createdView.ownerContactPhone).toBeNull();
      expect(createdView.ownerFullName).toBeNull();
      expect(sentNotifications.some((n) => n.title.includes('Yeni bir iletişim talebiniz var'))).toBe(true);

      // Step 2: Prevent Duplicate
      await expect(
        service.create({
          listingId: listing.id,
          requesterUserId: SENDER_ID,
          acceptTerms: true,
          message: 'İkinci kez göndermeye çalışıyorum en az otuz karakter.',
        }),
      ).rejects.toThrow('İletişim talebi zaten mevcut.');

      // Step 3: Owner views incoming request
      const incoming = await service.listIncomingForOwner(OWNER_ID);
      expect(incoming).toHaveLength(1);
      expect(incoming[0].effectiveStatus).toBe('pending');
      expect(incoming[0].requesterPhone).toBeNull();

      // Step 4: Owner accepts request
      const { view: acceptedView } = await service.accept({
        requestId: entity.id,
        actorUserId: OWNER_ID,
        acceptTerms: true,
      });

      expect(acceptedView.status).toBe('accepted');
      expect(sentNotifications.some((n) => n.title.includes('İletişim talebiniz kabul edildi'))).toBe(true);

      // Step 5: Requester views accepted request -> phone and identity revealed!
      const requesterView = await service.getMineForListing(listing.id, SENDER_ID);
      expect(requesterView?.effectiveStatus).toBe('accepted');
      expect(requesterView?.ownerContactPhone).toBe('+905559998877');
      expect(requesterView?.ownerDisplayName).toBeTruthy();

      // Step 6: Owner views accepted list -> requester contact channels revealed!
      const ownerIncoming = await service.listIncomingForOwner(OWNER_ID);
      expect(ownerIncoming[0].effectiveStatus).toBe('accepted');
      expect(ownerIncoming[0].requesterPhone).toBe('+905551112233');
      expect(ownerIncoming[0].requesterEmail).toBe('mehmet@example.com');
    });

    it('rejecting a request keeps contact channels strictly hidden', async () => {
      const listing = await listings.create({
        ownerId: OWNER_ID,
        categoryId: CATEGORY_IDS.ortakBul,
        listingTypeId: LISTING_TYPE_IDS.ortakBulDefault,
        title: 'Teknoloji Ortağı Arıyorum',
        shortDescription: 'Fintech projemiz için CTO arıyoruz.',
        status: 'published',
        contactPhone: '+905559998877',
      });
      await listings.update(listing.id, { publishedAt: new Date().toISOString() });

      const { entity } = await service.create({
        listingId: listing.id,
        requesterUserId: SENDER_ID,
        acceptTerms: true,
        message: 'Ortaklık detaylarını görüşmek istiyorum en az otuz karakter.',
      });

      // Owner rejects
      const rejected = await service.reject(entity.id, OWNER_ID);
      expect(rejected.status).toBe('rejected');
      expect(rejected.ownerContactPhone).toBeNull();

      const requesterView = await service.getMineForListing(listing.id, SENDER_ID);
      expect(requesterView?.effectiveStatus).toBe('rejected');
      expect(requesterView?.ownerContactPhone).toBeNull();
      expect(requesterView?.ownerDisplayName).toBeNull();
    });
  });
});
