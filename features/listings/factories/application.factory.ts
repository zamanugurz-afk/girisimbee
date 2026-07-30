import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Application, CreateApplicationInput } from '@/features/listings/types/application.types';

export function createApplication(
  overrides: Partial<Application> & Pick<Application, 'listingId' | 'applicantId'>,
): Application {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.application(crypto.randomUUID()),
    listingId: overrides.listingId,
    applicantId: overrides.applicantId,
    status: overrides.status ?? 'submitted',
    coverMessage: overrides.coverMessage ?? null,
    conversationId: overrides.conversationId ?? null,
    viewedAt: overrides.viewedAt ?? null,
    respondedAt: overrides.respondedAt ?? null,
    metadata: overrides.metadata ?? {},
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createApplicationInput(overrides: Partial<CreateApplicationInput> = {}): CreateApplicationInput {
  return {
    listingId: overrides.listingId ?? ids.listing(crypto.randomUUID()),
    applicantId: overrides.applicantId ?? ids.user(crypto.randomUUID()),
    coverMessage: overrides.coverMessage,
    metadata: overrides.metadata,
  };
}
