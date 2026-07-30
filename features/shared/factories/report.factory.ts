import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Report } from '@/features/shared/types/report.types';

export function createReport(
  overrides: Partial<Report> & Pick<Report, 'reporterId' | 'entityType' | 'entityId' | 'reason'>,
): Report {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.report(crypto.randomUUID()),
    reporterId: overrides.reporterId,
    entityType: overrides.entityType,
    entityId: overrides.entityId,
    reason: overrides.reason,
    description: overrides.description ?? null,
    status: overrides.status ?? 'submitted',
    reviewerId: overrides.reviewerId ?? null,
    reviewedAt: overrides.reviewedAt ?? null,
    resolution: overrides.resolution ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}
