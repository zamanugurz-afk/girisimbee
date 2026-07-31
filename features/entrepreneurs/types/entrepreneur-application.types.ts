/**
 * Entrepreneur investment interest workflow — wraps marketplace_matches (moduleKey: entrepreneurs).
 * Maps match statuses to application-like API for consistency across modules.
 */
import type { MatchStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { MatchId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

/** User-facing investment application statuses */
export type EntrepreneurApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface EntrepreneurApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface EntrepreneurApplicationStatusEvent {
  status: EntrepreneurApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface EntrepreneurApplicationMetadata {
  notes?: EntrepreneurApplicationNote[];
  statusHistory?: EntrepreneurApplicationStatusEvent[];
  coverMessage?: string | null;
  withdrawn?: boolean;
}

export interface EntrepreneurApplicationFilter {
  listingId?: ListingId;
  investorProfileId?: ProfileId;
  entrepreneurProfileId?: ProfileId;
  status?: EntrepreneurApplicationStatus | EntrepreneurApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface EntrepreneurApplicationSummary {
  id: MatchId;
  listingId: ListingId | null;
  initiatorProfileId: ProfileId;
  targetProfileId: ProfileId;
  status: EntrepreneurApplicationStatus;
  coverMessage: string | null;
  submittedAt: string;
  contactedAt: string | null;
  updatedAt: string;
}

export interface EntrepreneurApplicationDetail extends EntrepreneurApplicationSummary {
  notes: EntrepreneurApplicationNote[];
  history: EntrepreneurApplicationStatusEvent[];
  listing: Listing | null;
}

export interface EntrepreneurApplicationContactResult {
  application: EntrepreneurApplicationSummary;
  contact: ExternalContactInfo;
}

/** Maps entrepreneur UI status ↔ persisted MatchStatus */
export const ENTREPRENEUR_TO_MATCH_STATUS: Record<
  EntrepreneurApplicationStatus,
  MatchStatus | null
> = {
  pending: 'requested',
  reviewing: 'accepted',
  contacted: 'contacted',
  accepted: 'closed_won',
  rejected: 'declined',
  withdrawn: 'declined',
};

export const MATCH_TO_ENTREPRENEUR_STATUS: Partial<
  Record<MatchStatus, EntrepreneurApplicationStatus>
> = {
  requested: 'pending',
  accepted: 'reviewing',
  contacted: 'contacted',
  closed_won: 'accepted',
  declined: 'rejected',
  closed_lost: 'rejected',
};
