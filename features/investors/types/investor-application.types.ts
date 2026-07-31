/**
 * Investor match workflow — wraps marketplace_matches (moduleKey: investors).
 * Investor initiates to entrepreneur startups or receives interest on thesis listings.
 */
import type { MatchStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { MatchId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

export type InvestorApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface InvestorApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface InvestorApplicationStatusEvent {
  status: InvestorApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface InvestorApplicationMetadata {
  notes?: InvestorApplicationNote[];
  statusHistory?: InvestorApplicationStatusEvent[];
  coverMessage?: string | null;
  withdrawn?: boolean;
}

export interface InvestorApplicationFilter {
  listingId?: ListingId;
  investorProfileId?: ProfileId;
  entrepreneurProfileId?: ProfileId;
  status?: InvestorApplicationStatus | InvestorApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface InvestorApplicationSummary {
  id: MatchId;
  listingId: ListingId | null;
  targetListingId: ListingId | null;
  initiatorProfileId: ProfileId;
  targetProfileId: ProfileId;
  status: InvestorApplicationStatus;
  coverMessage: string | null;
  submittedAt: string;
  contactedAt: string | null;
  updatedAt: string;
}

export interface InvestorApplicationDetail extends InvestorApplicationSummary {
  notes: InvestorApplicationNote[];
  history: InvestorApplicationStatusEvent[];
  listing: Listing | null;
  targetListing: Listing | null;
}

export interface InvestorApplicationContactResult {
  application: InvestorApplicationSummary;
  contact: ExternalContactInfo;
}

export const INVESTOR_TO_MATCH_STATUS: Record<
  InvestorApplicationStatus,
  MatchStatus | null
> = {
  pending: 'requested',
  reviewing: 'accepted',
  contacted: 'contacted',
  accepted: 'closed_won',
  rejected: 'declined',
  withdrawn: 'declined',
};

export const MATCH_TO_INVESTOR_STATUS: Partial<
  Record<MatchStatus, InvestorApplicationStatus>
> = {
  requested: 'pending',
  accepted: 'reviewing',
  contacted: 'contacted',
  closed_won: 'accepted',
  declined: 'rejected',
  closed_lost: 'rejected',
};
