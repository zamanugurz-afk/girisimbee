import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/domain/errors';
import type { ContactRequestId, ListingId, UserId } from '@/lib/domain/ids';
import type { ContactRequestRepository } from '@/features/contact-requests/repositories/contact-request.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { INotificationService } from '@/features/notifications/services/notification.service.interface';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type {
  ContactRequestPublicView,
  ContactRequestStatus,
  ListingContactRequest,
} from '@/features/contact-requests/types/contact-request.types';
import {
  CONTACT_REQUEST_CONFIG,
  computeContactRequestExpiresAt,
} from '@/features/contact-requests/config/contact-request.config';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';

function effectiveStatus(row: ListingContactRequest, now = new Date()): ContactRequestStatus {
  if (row.status === 'pending' && new Date(row.expiresAt).getTime() < now.getTime()) {
    return 'expired';
  }
  return row.status;
}

function toPublicView(
  row: ListingContactRequest,
  extras?: {
    requesterDisplayName?: string | null;
    listingTitle?: string | null;
    ownerContactPhone?: string | null;
    ownerDisplayName?: string | null;
    ownerFirstName?: string | null;
    ownerLastName?: string | null;
    ownerFullName?: string | null;
  },
): ContactRequestPublicView {
  const status = effectiveStatus(row);
  return {
    id: String(row.id),
    listingId: String(row.listingId),
    status: row.status,
    effectiveStatus: status,
    message: row.message,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    respondedAt: row.respondedAt,
    conversationId: row.conversationId ? String(row.conversationId) : null,
    requesterDisplayName: extras?.requesterDisplayName ?? null,
    listingTitle: extras?.listingTitle ?? null,
    ownerContactPhone: extras?.ownerContactPhone ?? null,
    ownerDisplayName: extras?.ownerDisplayName ?? null,
    ownerFirstName: extras?.ownerFirstName ?? null,
    ownerLastName: extras?.ownerLastName ?? null,
    ownerFullName: extras?.ownerFullName ?? null,
  };
}

export class ContactRequestService {
  constructor(
    private readonly repo: ContactRequestRepository,
    private readonly listings: ListingRepository,
    private readonly messaging: IMessagingService,
    private readonly profiles: ProfileRepository,
    private readonly notifications: INotificationService,
  ) {}

  termsVersion() {
    return LEGAL_DOCUMENT_VERSIONS.contact_communication.version;
  }

  private async withRevealedOwnerContact(
    row: ListingContactRequest,
    extras?: { requesterDisplayName?: string | null; listingTitle?: string | null },
  ): Promise<ContactRequestPublicView> {
    const view = toPublicView(row, extras);
    if (view.effectiveStatus !== 'accepted') {
      return {
        ...view,
        ownerContactPhone: null,
        ownerDisplayName: null,
        ownerFirstName: null,
        ownerLastName: null,
        ownerFullName: null,
      };
    }
    const [phone, identity] = await Promise.all([
      this.listings.getAcceptedRequesterContactPhone(row.listingId),
      this.listings.getAcceptedRequesterOwnerIdentity(row.listingId),
    ]);
    return {
      ...view,
      ownerContactPhone: phone,
      ownerDisplayName: identity?.displayName ?? null,
      ownerFirstName: identity?.firstName ?? null,
      ownerLastName: identity?.lastName ?? null,
      ownerFullName: identity?.fullName ?? identity?.displayName ?? null,
    };
  }

  async getMineForListing(listingId: ListingId, userId: UserId): Promise<ContactRequestPublicView | null> {
    const row = await this.repo.findActiveForListingRequester(listingId, userId);
    if (!row) {
      const all = await this.repo.listForRequester(userId, 20);
      const latest = all.find((r) => r.listingId === listingId);
      return latest ? this.withRevealedOwnerContact(latest) : null;
    }
    return this.withRevealedOwnerContact(row);
  }

  async create(input: {
    listingId: ListingId;
    requesterUserId: UserId;
    message?: string | null;
    acceptTerms: boolean;
  }): Promise<{ view: ContactRequestPublicView; entity: ListingContactRequest }> {
    if (!input.acceptTerms) {
      throw new ValidationError('İletişim ve Mesajlaşma Kullanım Koşulları kabul edilmelidir.', {
        acceptTerms: ['Zorunlu'],
      });
    }

    const listing = await this.listings.findById(input.listingId);
    if (!listing || listing.status !== 'published' || listing.deletedAt) {
      throw new NotFoundError('Listing', input.listingId);
    }
    if (listing.ownerId === input.requesterUserId) {
      throw new ForbiddenError('Kendi ilanınıza iletişim talebi gönderemezsiniz.');
    }

    const existing = await this.repo.findActiveForListingRequester(
      input.listingId,
      input.requesterUserId,
    );
    if (existing) {
      throw new ValidationError('İletişim talebi zaten mevcut.', {
        request: ['Bu ilan için aktif talebiniz var.'],
      });
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await this.repo.countCreatedSince(input.requesterUserId, hourAgo);
    if (recent >= CONTACT_REQUEST_CONFIG.maxCreatesPerHour) {
      throw new ValidationError('Çok fazla talep gönderdiniz. Lütfen daha sonra tekrar deneyin.', {
        rate: ['Rate limit'],
      });
    }

    const message = input.message?.trim() || '';
    if (message.length < CONTACT_REQUEST_CONFIG.messageMinLength) {
      throw new ValidationError('Mesaj çok kısa.', {
        message: [`En az ${CONTACT_REQUEST_CONFIG.messageMinLength} karakter yazın.`],
      });
    }
    if (message.length > CONTACT_REQUEST_CONFIG.messageMaxLength) {
      throw new ValidationError('Mesaj çok uzun.', {
        message: [`En fazla ${CONTACT_REQUEST_CONFIG.messageMaxLength} karakter.`],
      });
    }

    const created = await this.repo.create({
      listingId: input.listingId,
      requesterUserId: input.requesterUserId,
      ownerUserId: listing.ownerId,
      message,
      termsVersion: this.termsVersion(),
      expiresAt: computeContactRequestExpiresAt(),
    });

    const requester = await this.profiles.findByUserId(input.requesterUserId);
    const requesterName = requester?.displayName?.trim() || 'Bir kullanıcı';
    try {
      await this.notifications.send({
        userId: listing.ownerId,
        type: 'system',
        title: 'Yeni iletişim talebi',
        body: `${requesterName}, “${listing.title}” ilanınız için iletişim talebi gönderdi.`,
        actionUrl: `${DASHBOARD_ROUTES.iletisimTalepleri}?talep=${created.id}`,
        entityType: 'listing',
        entityId: String(listing.id),
        metadata: {
          kind: 'contact_request',
          event: 'CONTACT_REQUEST_CREATED',
          contactRequestId: String(created.id),
        },
      });
    } catch {
      // non-fatal
    }

    return {
      entity: created,
      view: toPublicView(created, {
        listingTitle: listing.title,
        requesterDisplayName: requesterName,
        ownerContactPhone: null,
      }),
    };
  }

  async cancel(requestId: ContactRequestId, actorUserId: UserId): Promise<ContactRequestPublicView> {
    const row = await this.repo.findById(requestId);
    if (!row) throw new NotFoundError('ContactRequest', requestId);
    if (row.requesterUserId !== actorUserId) {
      throw new ForbiddenError('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (effectiveStatus(row) !== 'pending') {
      throw new ValidationError('Yalnızca bekleyen talepler iptal edilebilir.', {
        status: [row.status],
      });
    }
    const now = new Date().toISOString();
    const updated = await this.repo.update(requestId, {
      status: 'cancelled',
      cancelledAt: now,
      respondedAt: now,
    });
    return toPublicView(updated, { ownerContactPhone: null });
  }

  async reject(requestId: ContactRequestId, actorUserId: UserId): Promise<ContactRequestPublicView> {
    const row = await this.repo.findById(requestId);
    if (!row) throw new NotFoundError('ContactRequest', requestId);
    if (row.ownerUserId !== actorUserId) {
      throw new ForbiddenError('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (effectiveStatus(row) !== 'pending') {
      throw new ValidationError('Talep yanıtlanabilir durumda değil.', { status: [row.status] });
    }
    const now = new Date().toISOString();
    const updated = await this.repo.update(requestId, {
      status: 'rejected',
      rejectedAt: now,
      respondedAt: now,
    });

    try {
      await this.notifications.send({
        userId: row.requesterUserId,
        type: 'system',
        title: 'İletişim talebi reddedildi',
        body: 'İletişim talebiniz ilan sahibi tarafından reddedildi.',
        actionUrl: `/ilan/${row.listingId}`,
        entityType: 'listing',
        entityId: String(row.listingId),
        metadata: {
          kind: 'contact_request',
          event: 'CONTACT_REQUEST_REJECTED',
          contactRequestId: String(row.id),
        },
      });
    } catch {
      // non-fatal
    }

    return toPublicView(updated, { ownerContactPhone: null });
  }

  async accept(input: {
    requestId: ContactRequestId;
    actorUserId: UserId;
    acceptTerms: boolean;
  }): Promise<{ view: ContactRequestPublicView; entity: ListingContactRequest }> {
    if (!input.acceptTerms) {
      throw new ValidationError('İletişim ve Mesajlaşma Kullanım Koşulları kabul edilmelidir.', {
        acceptTerms: ['Zorunlu'],
      });
    }

    const row = await this.repo.findById(input.requestId);
    if (!row) throw new NotFoundError('ContactRequest', input.requestId);
    if (row.ownerUserId !== input.actorUserId) {
      throw new ForbiddenError('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (effectiveStatus(row) !== 'pending') {
      throw new ValidationError('Talep yanıtlanabilir durumda değil.', { status: [row.status] });
    }

    const listing = await this.listings.findById(row.listingId);
    if (!listing || listing.status !== 'published' || listing.deletedAt) {
      throw new ValidationError('Bu ilan artık iletişim taleplerine açık değil.', {
        listing: ['unavailable'],
      });
    }
    if (listing.ownerId !== input.actorUserId) {
      throw new ForbiddenError('Bu işlem için yetkiniz bulunmuyor.');
    }

    const conversation = await this.messaging.getOrCreateForListing(
      row.listingId,
      row.ownerUserId,
      row.requesterUserId,
      { bypassContactRequestGate: true },
    );

    const now = new Date().toISOString();
    const updated = await this.repo.update(row.id, {
      status: 'accepted',
      acceptedAt: now,
      respondedAt: now,
      conversationId: conversation.id,
      ownerTermsVersion: this.termsVersion(),
      ownerTermsAcceptedAt: now,
    });

    try {
      await this.notifications.send({
        userId: row.requesterUserId,
        type: 'system',
        title: 'İletişim talebiniz kabul edildi',
        body: 'İlan sahibi iletişim talebinizi kabul etti. Mesajlaşabilir; telefon ve ad-soyad bilgisi yalnızca size açıldı.',
        actionUrl: `${DASHBOARD_ROUTES.mesajlarim}?c=${conversation.id}`,
        entityType: 'conversation',
        entityId: String(conversation.id),
        metadata: {
          kind: 'contact_request',
          event: 'CONTACT_REQUEST_ACCEPTED',
          contactRequestId: String(row.id),
        },
      });
    } catch {
      // non-fatal
    }

    return {
      entity: updated,
      view: toPublicView(updated, {
        listingTitle: listing.title,
        ownerContactPhone: null,
      }),
    };
  }

  async listIncomingForOwner(ownerUserId: UserId): Promise<ContactRequestPublicView[]> {
    const rows = await this.repo.listForOwner(ownerUserId);
    return Promise.all(
      rows.map(async (row) => {
        const [profile, listing] = await Promise.all([
          this.profiles.findByUserId(row.requesterUserId),
          this.listings.findById(row.listingId),
        ]);
        return toPublicView(row, {
          requesterDisplayName: profile?.displayName ?? 'Kullanıcı',
          listingTitle: listing?.title ?? null,
          ownerContactPhone: null,
        });
      }),
    );
  }

  async hasAcceptedPair(
    listingId: ListingId,
    ownerUserId: UserId,
    requesterUserId: UserId,
  ): Promise<boolean> {
    const row = await this.repo.findAcceptedForListingParticipants(
      listingId,
      ownerUserId,
      requesterUserId,
    );
    return Boolean(row);
  }
}
