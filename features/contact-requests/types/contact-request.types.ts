import type { ContactRequestId, ConversationId, ListingId, UserId } from '@/lib/domain/ids';

export type ContactRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export interface ListingContactRequest {
  id: ContactRequestId;
  listingId: ListingId;
  requesterUserId: UserId;
  ownerUserId: UserId;
  message: string | null;
  status: ContactRequestStatus;
  conversationId: ConversationId | null;
  termsVersion: string;
  termsAcceptedAt: string;
  ownerTermsVersion: string | null;
  ownerTermsAcceptedAt: string | null;
  createdAt: string;
  respondedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string;
}

export type CreateContactRequestInput = {
  listingId: ListingId;
  requesterUserId: UserId;
  ownerUserId: UserId;
  message?: string | null;
  termsVersion: string;
  expiresAt: string;
};

export type ContactRequestPublicView = {
  id: string;
  listingId: string;
  status: ContactRequestStatus;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  conversationId: string | null;
  /** Effective status after expiry check */
  effectiveStatus: ContactRequestStatus;
  requesterDisplayName?: string | null;
  listingTitle?: string | null;
  /**
   * Owner phone — only populated for the accepted requester of this listing.
   * Never returned for pending / rejected / other users.
   */
  ownerContactPhone?: string | null;
  /**
   * Owner identity — only for accepted requester (display / first / last name).
   * Never returned for pending / rejected / other users.
   */
  ownerDisplayName?: string | null;
  ownerFirstName?: string | null;
  ownerLastName?: string | null;
  ownerFullName?: string | null;
};

export type AcceptedOwnerIdentity = {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
};
