import { ids, type ContactRequestId, type ListingId, type UserId } from '@/lib/domain/ids';
import type { ContactRequestRepository } from '@/features/contact-requests/repositories/contact-request.repository';
import type {
  CreateContactRequestInput,
  ListingContactRequest,
} from '@/features/contact-requests/types/contact-request.types';
import { createContactRequestEntity } from '@/features/contact-requests/repository/supabase/contact-request.mapper';
import { isAllowedContactRequestTransition } from '@/features/contact-requests/lib/contact-request-transitions';

const MOCK_ACCEPT_CONVERSATION_ID = ids.conversation('c0000001-0001-4000-8000-000000000001');

export class MockContactRequestRepository implements ContactRequestRepository {
  private rows = new Map<string, ListingContactRequest>();

  async create(input: CreateContactRequestInput) {
    const entity = createContactRequestEntity(input);
    this.rows.set(String(entity.id), entity);
    return entity;
  }

  async findById(id: ContactRequestId) {
    return this.rows.get(String(id)) ?? null;
  }

  async findActiveForListingRequester(listingId: ListingId, requesterUserId: UserId) {
    return (
      [...this.rows.values()]
        .filter(
          (r) =>
            r.listingId === listingId
            && r.requesterUserId === requesterUserId
            && (r.status === 'pending' || r.status === 'accepted'),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    );
  }

  async findAcceptedForListingParticipants(
    listingId: ListingId,
    ownerUserId: UserId,
    requesterUserId: UserId,
  ) {
    return (
      [...this.rows.values()].find(
        (r) =>
          r.listingId === listingId
          && r.ownerUserId === ownerUserId
          && r.requesterUserId === requesterUserId
          && r.status === 'accepted',
      ) ?? null
    );
  }

  async listForOwner(ownerUserId: UserId) {
    return [...this.rows.values()]
      .filter((r) => r.ownerUserId === ownerUserId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listForRequester(requesterUserId: UserId) {
    return [...this.rows.values()]
      .filter((r) => r.requesterUserId === requesterUserId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listForListingOwner(listingId: ListingId, ownerUserId: UserId) {
    return [...this.rows.values()]
      .filter((r) => r.listingId === listingId && r.ownerUserId === ownerUserId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async update(id: ContactRequestId, patch: Partial<ListingContactRequest>) {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Contact request not found');

    if (patch.status && patch.status !== existing.status) {
      const actor =
        patch.status === 'cancelled'
          ? 'requester'
          : patch.status === 'expired'
            ? 'service'
            : 'owner';
      if (
        !isAllowedContactRequestTransition({
          from: existing.status,
          to: patch.status,
          actor,
        })
      ) {
        throw new Error('contact_request_invalid_transition');
      }
    }

    const now = new Date().toISOString();
    const next: ListingContactRequest = {
      ...existing,
      ...patch,
      // Mirror SECURITY DEFINER accept RPC: create conversation when not supplied.
      conversationId:
        patch.status === 'accepted'
          ? (patch.conversationId ?? existing.conversationId ?? MOCK_ACCEPT_CONVERSATION_ID)
          : (patch.conversationId ?? existing.conversationId),
      respondedAt: patch.respondedAt ?? existing.respondedAt ?? now,
    };
    this.rows.set(String(id), next);
    return next;
  }

  /** Test helper — simulate malicious direct status write (must fail matrix). */
  async forceStatus(
    id: ContactRequestId,
    status: ListingContactRequest['status'],
    actor: 'requester' | 'owner' | 'admin' | 'service',
  ) {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Contact request not found');
    if (
      !isAllowedContactRequestTransition({
        from: existing.status,
        to: status,
        actor,
      })
    ) {
      throw new Error('contact_request_invalid_transition');
    }
    return this.update(id, { status });
  }

  async countCreatedSince(requesterUserId: UserId, sinceIso: string) {
    return [...this.rows.values()].filter(
      (r) => r.requesterUserId === requesterUserId && r.createdAt >= sinceIso,
    ).length;
  }
}
