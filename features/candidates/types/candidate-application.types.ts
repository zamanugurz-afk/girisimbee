/**
 * Candidate application workflow — job seeker applies to employer listings.
 * Maps to marketplace_applications (moduleKey: candidates, listing moduleKey: employers).
 */
import type { ApplicationStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';

/** User-facing candidate application statuses */
export type CandidateApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface CandidateApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface CandidateApplicationStatusEvent {
  status: CandidateApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface CandidateApplicationMetadata {
  notes?: CandidateApplicationNote[];
  statusHistory?: CandidateApplicationStatusEvent[];
}

export interface CandidateApplicationFilter {
  listingId?: ListingId;
  applicantProfileId?: ProfileId;
  status?: CandidateApplicationStatus | CandidateApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface CandidateApplicationSummary {
  id: ApplicationId;
  listingId: ListingId;
  applicantProfileId: ProfileId;
  status: CandidateApplicationStatus;
  coverMessage: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  contactedAt: string | null;
  unlockedAt: string | null;
  updatedAt: string;
}

export interface CandidateApplicationDetail extends CandidateApplicationSummary {
  notes: CandidateApplicationNote[];
  history: CandidateApplicationStatusEvent[];
  listing: Listing | null;
}

export interface CandidateApplicationContactResult {
  application: CandidateApplicationSummary;
  contact: ExternalContactInfo;
}

/** Maps candidate UI status ↔ persisted ApplicationStatus */
export const CANDIDATE_TO_APPLICATION_STATUS: Record<
  CandidateApplicationStatus,
  ApplicationStatus
> = {
  pending: 'submitted',
  reviewing: 'reviewing',
  contacted: 'contacted',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

export const APPLICATION_TO_CANDIDATE_STATUS: Partial<
  Record<ApplicationStatus, CandidateApplicationStatus>
> = {
  submitted: 'pending',
  reviewing: 'reviewing',
  unlocked: 'reviewing',
  contacted: 'contacted',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};
