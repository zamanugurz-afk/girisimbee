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
  ConversationId,
  ListingId,
  ProfileId,
  PaymentId,
} from '@/lib/domain/ids';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';

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
  profileSnapshot?: CareerCardInput | null;
  conversationId?: ConversationId | null;
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
  profileSnapshot?: CareerCardInput | null;
  conversationId?: ConversationId | null;
  metadata?: Record<string, unknown>;
};

export type UpdateApplicationInput = Partial<
  Pick<
    MarketplaceApplication,
    | 'status'
    | 'coverMessage'
    | 'profileSnapshot'
    | 'conversationId'
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
