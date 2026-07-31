/**
 * Founder partnership workflow — wraps marketplace_matches (moduleKey: founders).
 */
import type { MatchStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { MatchId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

export type FounderApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface FounderApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface FounderApplicationStatusEvent {
  status: FounderApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface FounderApplicationMetadata {
  notes?: FounderApplicationNote[];
  statusHistory?: FounderApplicationStatusEvent[];
  coverMessage?: string | null;
  withdrawn?: boolean;
}

export interface FounderApplicationFilter {
  listingId?: ListingId;
  founderProfileId?: ProfileId;
  applicantProfileId?: ProfileId;
  status?: FounderApplicationStatus | FounderApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface FounderApplicationSummary {
  id: MatchId;
  listingId: ListingId | null;
  initiatorProfileId: ProfileId;
  targetProfileId: ProfileId;
  status: FounderApplicationStatus;
  coverMessage: string | null;
  submittedAt: string;
  contactedAt: string | null;
  updatedAt: string;
}

export interface FounderApplicationDetail extends FounderApplicationSummary {
  notes: FounderApplicationNote[];
  history: FounderApplicationStatusEvent[];
  listing: Listing | null;
}

export interface FounderApplicationContactResult {
  application: FounderApplicationSummary;
  contact: ExternalContactInfo;
}

export const FOUNDER_TO_MATCH_STATUS: Record<
  FounderApplicationStatus,
  MatchStatus | null
> = {
  pending: 'requested',
  reviewing: 'accepted',
  contacted: 'contacted',
  accepted: 'closed_won',
  rejected: 'declined',
  withdrawn: 'declined',
};

export const MATCH_TO_FOUNDER_STATUS: Partial<
  Record<MatchStatus, FounderApplicationStatus>
> = {
  requested: 'pending',
  accepted: 'reviewing',
  contacted: 'contacted',
  closed_won: 'accepted',
  declined: 'rejected',
  closed_lost: 'rejected',
};
