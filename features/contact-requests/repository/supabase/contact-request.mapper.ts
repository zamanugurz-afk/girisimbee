import { ids } from '@/lib/domain/ids';
import type {
  CreateContactRequestInput,
  ListingContactRequest,
} from '@/features/contact-requests/types/contact-request.types';

export interface ContactRequestRow {
  id: string;
  listing_id: string;
  requester_user_id: string;
  owner_user_id: string;
  message: string | null;
  status: ListingContactRequest['status'];
  conversation_id: string | null;
  terms_version: string;
  terms_accepted_at: string;
  owner_terms_version: string | null;
  owner_terms_accepted_at: string | null;
  created_at: string;
  responded_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
}

export function mapContactRequestRow(row: ContactRequestRow): ListingContactRequest {
  return {
    id: ids.contactRequest(row.id),
    listingId: ids.listing(row.listing_id),
    requesterUserId: ids.user(row.requester_user_id),
    ownerUserId: ids.user(row.owner_user_id),
    message: row.message,
    status: row.status,
    conversationId: row.conversation_id ? ids.conversation(row.conversation_id) : null,
    termsVersion: row.terms_version,
    termsAcceptedAt: row.terms_accepted_at,
    ownerTermsVersion: row.owner_terms_version,
    ownerTermsAcceptedAt: row.owner_terms_accepted_at,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    acceptedAt: row.accepted_at,
    rejectedAt: row.rejected_at,
    cancelledAt: row.cancelled_at,
    expiresAt: row.expires_at,
  };
}

export function createContactRequestEntity(
  input: CreateContactRequestInput,
): ListingContactRequest {
  const now = new Date().toISOString();
  return {
    id: ids.contactRequest(crypto.randomUUID()),
    listingId: input.listingId,
    requesterUserId: input.requesterUserId,
    ownerUserId: input.ownerUserId,
    message: input.message?.trim() || null,
    status: 'pending',
    conversationId: null,
    termsVersion: input.termsVersion,
    termsAcceptedAt: now,
    ownerTermsVersion: null,
    ownerTermsAcceptedAt: null,
    createdAt: now,
    respondedAt: null,
    acceptedAt: null,
    rejectedAt: null,
    cancelledAt: null,
    expiresAt: input.expiresAt,
  };
}

export function toContactRequestInsert(entity: ListingContactRequest) {
  return {
    id: entity.id,
    listing_id: entity.listingId,
    requester_user_id: entity.requesterUserId,
    owner_user_id: entity.ownerUserId,
    message: entity.message,
    status: entity.status,
    conversation_id: entity.conversationId,
    terms_version: entity.termsVersion,
    terms_accepted_at: entity.termsAcceptedAt,
    owner_terms_version: entity.ownerTermsVersion,
    owner_terms_accepted_at: entity.ownerTermsAcceptedAt,
    created_at: entity.createdAt,
    responded_at: entity.respondedAt,
    accepted_at: entity.acceptedAt,
    rejected_at: entity.rejectedAt,
    cancelled_at: entity.cancelledAt,
    expires_at: entity.expiresAt,
  };
}
