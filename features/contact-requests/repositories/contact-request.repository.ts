import type { ContactRequestId, ListingId, UserId } from '@/lib/domain/ids';
import type {
  CreateContactRequestInput,
  ListingContactRequest,
} from '@/features/contact-requests/types/contact-request.types';

export interface ContactRequestRepository {
  create(input: CreateContactRequestInput): Promise<ListingContactRequest>;
  findById(id: ContactRequestId): Promise<ListingContactRequest | null>;
  findActiveForListingRequester(
    listingId: ListingId,
    requesterUserId: UserId,
  ): Promise<ListingContactRequest | null>;
  findAcceptedForListingParticipants(
    listingId: ListingId,
    ownerUserId: UserId,
    requesterUserId: UserId,
  ): Promise<ListingContactRequest | null>;
  listForOwner(ownerUserId: UserId, limit?: number): Promise<ListingContactRequest[]>;
  listForRequester(requesterUserId: UserId, limit?: number): Promise<ListingContactRequest[]>;
  listForListingOwner(
    listingId: ListingId,
    ownerUserId: UserId,
  ): Promise<ListingContactRequest[]>;
  update(
    id: ContactRequestId,
    patch: Partial<
      Pick<
        ListingContactRequest,
        | 'status'
        | 'conversationId'
        | 'respondedAt'
        | 'acceptedAt'
        | 'rejectedAt'
        | 'cancelledAt'
        | 'ownerTermsVersion'
        | 'ownerTermsAcceptedAt'
      >
    >,
  ): Promise<ListingContactRequest>;
  countCreatedSince(requesterUserId: UserId, sinceIso: string): Promise<number>;
}
