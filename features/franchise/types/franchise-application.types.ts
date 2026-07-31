/**
 * Franchise application workflow — Bayilik Al ↔ Bayilik Ver.
 * Maps to marketplace_applications (moduleKey: franchise).
 */
import type { ApplicationStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { FranchiseBuyProfile } from '@/features/profiles/types/franchise-profile.types';

/** User-facing franchise application statuses */
export type FranchiseApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface FranchiseApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface FranchiseApplicationStatusEvent {
  status: FranchiseApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface FranchiseApplicationMetadata {
  notes?: FranchiseApplicationNote[];
  statusHistory?: FranchiseApplicationStatusEvent[];
}

export interface FranchiseApplicationFilter {
  listingId?: ListingId;
  applicantProfileId?: ProfileId;
  status?: FranchiseApplicationStatus | FranchiseApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface FranchiseApplicationSummary {
  id: ApplicationId;
  listingId: ListingId;
  applicantProfileId: ProfileId;
  status: FranchiseApplicationStatus;
  coverMessage: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  contactedAt: string | null;
  updatedAt: string;
}

export interface FranchiseApplicationDetail extends FranchiseApplicationSummary {
  notes: FranchiseApplicationNote[];
  history: FranchiseApplicationStatusEvent[];
  applicantProfile: FranchiseBuyProfile | null;
  listing: Listing | null;
}

export interface FranchiseApplicationContactResult {
  application: FranchiseApplicationSummary;
  contact: ExternalContactInfo;
}

/** Maps franchise UI status ↔ persisted ApplicationStatus */
export const FRANCHISE_TO_APPLICATION_STATUS: Record<
  FranchiseApplicationStatus,
  ApplicationStatus
> = {
  pending: 'submitted',
  reviewing: 'reviewing',
  contacted: 'contacted',
  approved: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

export const APPLICATION_TO_FRANCHISE_STATUS: Partial<
  Record<ApplicationStatus, FranchiseApplicationStatus>
> = {
  submitted: 'pending',
  reviewing: 'reviewing',
  contacted: 'contacted',
  accepted: 'approved',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};
