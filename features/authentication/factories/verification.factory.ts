import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Verification } from '@/features/authentication/types/verification.types';

export function createVerification(overrides: Partial<Verification> & Pick<Verification, 'userId' | 'type'>): Verification {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.verification(crypto.randomUUID()),
    userId: overrides.userId,
    companyId: overrides.companyId ?? null,
    type: overrides.type,
    status: overrides.status ?? 'pending',
    documentUrls: overrides.documentUrls ?? [],
    reviewerId: overrides.reviewerId ?? null,
    reviewedAt: overrides.reviewedAt ?? null,
    rejectionReason: overrides.rejectionReason ?? null,
    expiresAt: overrides.expiresAt ?? null,
    metadata: overrides.metadata ?? {},
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}
