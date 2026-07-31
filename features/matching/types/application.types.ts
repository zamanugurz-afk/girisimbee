/**
 * Application — job seeker→job or franchise applicant→listing workflow.
 * Jobs: submitted → reviewing → unlocked (payment) → contacted → hired
 * Franchise: submitted → reviewing → contacted → accepted
 */
import type { Timestamps, SoftDeletable } from '@/lib/domain/base';
import type {
  ApplicationStatus,
  AnonymousApplicationSnapshot,
} from '@/lib/domain/marketplace-enums';
import type { ModuleKey } from '@/lib/domain/modules';
import type {
  ApplicationId,
  ListingId,
  ProfileId,
  PaymentId,
} from '@/lib/domain/ids';

export type ApplicationModuleKey = Extract<
  ModuleKey,
  'candidates' | 'employers' | 'franchise'
>;

export interface MarketplaceApplication extends Timestamps, SoftDeletable {
  id: ApplicationId;
  moduleKey: ApplicationModuleKey;
  listingId: ListingId;
  applicantProfileId: ProfileId;
  status: ApplicationStatus;
  coverMessage: string | null;
  anonymousSnapshot: AnonymousApplicationSnapshot;
  unlockedAt: string | null;
  paymentId: PaymentId | null;
  contactedAt: string | null;
  reviewedAt: string | null;
  metadata: Record<string, unknown>;
}

export type CreateApplicationInput = Pick<
  MarketplaceApplication,
  'moduleKey' | 'listingId' | 'applicantProfileId'
> & {
  coverMessage?: string | null;
  anonymousSnapshot?: AnonymousApplicationSnapshot;
  metadata?: Record<string, unknown>;
};

export type UpdateApplicationInput = Partial<
  Pick<
    MarketplaceApplication,
    | 'status'
    | 'coverMessage'
    | 'unlockedAt'
    | 'paymentId'
    | 'contactedAt'
    | 'reviewedAt'
    | 'metadata'
  >
>;

export interface ApplicationFilter {
  moduleKey?: ApplicationModuleKey;
  listingId?: ListingId;
  applicantProfileId?: ProfileId;
  status?: ApplicationStatus | ApplicationStatus[];
  submittedAfter?: string;
  submittedBefore?: string;
  includeDeleted?: boolean;
}
