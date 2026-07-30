/**
 * Application — user expresses interest in a listing (İlgileniyorum).
 *
 * Purpose: Track intent, enable owner review, start conversations.
 * Relations: belongs to Listing and User (applicant).
 * Lifecycle: submitted → viewed → accepted | rejected | withdrawn
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { ApplicationId, ListingId, UserId, ConversationId } from '@/lib/domain/ids';

export type ApplicationStatus =
  | 'submitted'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'deleted';

export interface Application extends Timestamps, SoftDeletable {
  id: ApplicationId;
  listingId: ListingId;
  applicantId: UserId;
  status: ApplicationStatus;
  coverMessage: string | null;
  conversationId: ConversationId | null;
  viewedAt: string | null;
  respondedAt: string | null;
  metadata: Record<string, unknown>;
}

export type CreateApplicationInput = Pick<Application, 'listingId' | 'applicantId'> & {
  coverMessage?: string | null;
  metadata?: Record<string, unknown>;
};

export type UpdateApplicationInput = Partial<
  Pick<Application, 'status' | 'coverMessage' | 'conversationId' | 'viewedAt' | 'respondedAt'>
>;

export interface ApplicationFilter {
  listingId?: ListingId;
  applicantId?: UserId;
  status?: ApplicationStatus | ApplicationStatus[];
  includeDeleted?: boolean;
}

export const APPLICATION_INDEXES: IndexDefinition[] = [
  { name: 'applications_listing_applicant_unique', columns: ['listing_id', 'applicant_id'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'applications_listing_id_idx', columns: ['listing_id'] },
  { name: 'applications_applicant_id_idx', columns: ['applicant_id'] },
  { name: 'applications_status_idx', columns: ['status'] },
  { name: 'applications_created_at_idx', columns: ['created_at'] },
];

export const APPLICATION_LIFECYCLE: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  submitted: ['viewed', 'accepted', 'rejected', 'withdrawn', 'deleted'],
  viewed: ['accepted', 'rejected', 'withdrawn', 'deleted'],
  accepted: ['withdrawn', 'deleted'],
  rejected: ['deleted'],
  withdrawn: ['deleted'],
  deleted: [],
};

export const APPLICATION_VALIDATION: ValidationRule[] = [
  { field: 'listingId', rule: 'required|uuid', message: 'İlan gerekli.' },
  { field: 'applicantId', rule: 'required|uuid', message: 'Başvuran gerekli.' },
  { field: 'coverMessage', rule: 'nullable|max:2000', message: 'Mesaj en fazla 2000 karakter.' },
];
