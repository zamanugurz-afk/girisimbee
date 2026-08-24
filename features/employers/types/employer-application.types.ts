/**
 * Employer application workflow — anonymous unlock before full candidate view.
 * Maps to marketplace_applications (moduleKey: candidates, listing moduleKey: employers).
 */
import type { ApplicationStatus } from '@/lib/domain/marketplace-enums';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ApplicationId, ConversationId, ListingId, ProfileId } from '@/lib/domain/ids';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';
import type {
  AnonymousApplicationView,
  UnlockedApplicationView,
} from '@/features/matching/services/anonymization.service';

/** User-facing employer application statuses */
export type EmployerApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'contacted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface EmployerApplicationNote {
  id: string;
  authorProfileId: ProfileId;
  text: string;
  createdAt: string;
}

export interface EmployerApplicationStatusEvent {
  status: EmployerApplicationStatus;
  at: string;
  actorProfileId?: ProfileId;
}

export interface EmployerApplicationMetadata {
  notes?: EmployerApplicationNote[];
  statusHistory?: EmployerApplicationStatusEvent[];
}

export interface EmployerApplicationFilter {
  listingId?: ListingId;
  applicantProfileId?: ProfileId;
  status?: EmployerApplicationStatus | EmployerApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
}

export interface EmployerApplicationSummary {
  id: ApplicationId;
  listingId: ListingId;
  applicantProfileId: ProfileId;
  status: EmployerApplicationStatus;
  coverMessage: string | null;
  profileSnapshot?: CareerCardInput | null;
  conversationId?: ConversationId | null;
  submittedAt: string;
  reviewedAt: string | null;
  contactedAt: string | null;
  unlockedAt: string | null;
  updatedAt: string;
}

export interface EmployerApplicationDetail extends EmployerApplicationSummary {
  notes: EmployerApplicationNote[];
  history: EmployerApplicationStatusEvent[];
  anonymousView: AnonymousApplicationView | null;
  unlockedView: UnlockedApplicationView | null;
  listing: Listing | null;
}

export interface EmployerApplicationContactResult {
  application: EmployerApplicationSummary;
  contact: ExternalContactInfo;
}

/** Maps employer UI status ↔ persisted ApplicationStatus */
export const EMPLOYER_TO_APPLICATION_STATUS: Record<
  EmployerApplicationStatus,
  ApplicationStatus
> = {
  pending: 'submitted',
  reviewing: 'reviewing',
  contacted: 'contacted',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

export const APPLICATION_TO_EMPLOYER_STATUS: Partial<
  Record<ApplicationStatus, EmployerApplicationStatus>
> = {
  submitted: 'pending',
  reviewing: 'reviewing',
  unlocked: 'reviewing',
  contacted: 'contacted',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};
