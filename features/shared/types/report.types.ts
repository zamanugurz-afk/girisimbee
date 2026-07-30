/**
 * Report — abuse, spam, and content moderation reports.
 *
 * Purpose: Maintain platform trust; queue for moderator review.
 * Relations: reporter User; polymorphic target entity.
 * Lifecycle: submitted → in_review → resolved | dismissed
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { ReportId, UserId } from '@/lib/domain/ids';

export type ReportReason =
  | 'spam'
  | 'fraud'
  | 'harassment'
  | 'misleading'
  | 'inappropriate'
  | 'duplicate'
  | 'other';

export type ReportEntityType = 'listing' | 'user' | 'company' | 'message' | 'profile';

export type ReportStatus = 'submitted' | 'in_review' | 'resolved' | 'dismissed' | 'deleted';

export interface Report extends Timestamps, SoftDeletable {
  id: ReportId;
  reporterId: UserId;
  entityType: ReportEntityType;
  entityId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewerId: UserId | null;
  reviewedAt: string | null;
  resolution: string | null;
}

export type CreateReportInput = Pick<Report, 'reporterId' | 'entityType' | 'entityId' | 'reason'> & {
  description?: string | null;
};

export type UpdateReportInput = Partial<
  Pick<Report, 'status' | 'reviewerId' | 'reviewedAt' | 'resolution'>
>;

export interface ReportFilter {
  reporterId?: UserId;
  entityType?: ReportEntityType;
  entityId?: string;
  reason?: ReportReason;
  status?: ReportStatus | ReportStatus[];
  includeDeleted?: boolean;
}

export const REPORT_INDEXES: IndexDefinition[] = [
  { name: 'reports_entity_idx', columns: ['entity_type', 'entity_id'] },
  { name: 'reports_reporter_id_idx', columns: ['reporter_id'] },
  { name: 'reports_status_idx', columns: ['status'] },
  { name: 'reports_created_at_idx', columns: ['created_at'] },
];

export const REPORT_LIFECYCLE: Record<ReportStatus, readonly ReportStatus[]> = {
  submitted: ['in_review', 'dismissed', 'deleted'],
  in_review: ['resolved', 'dismissed', 'deleted'],
  resolved: ['deleted'],
  dismissed: ['deleted'],
  deleted: [],
};

export const REPORT_VALIDATION: ValidationRule[] = [
  { field: 'reason', rule: 'required|in:spam,fraud,harassment,misleading,inappropriate,duplicate,other', message: 'Geçerli sebep seçin.' },
  { field: 'description', rule: 'nullable|max:2000', message: 'Açıklama en fazla 2000 karakter.' },
];
