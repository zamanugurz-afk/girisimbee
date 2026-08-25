import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type {
  MarketplaceApplication,
  CreateApplicationInput,
} from '@/features/matching/types/application.types';

export function createApplication(
  overrides: CreateApplicationInput & Partial<Omit<MarketplaceApplication, keyof CreateApplicationInput>>,
): MarketplaceApplication {
  const defaultSnapshot: MarketplaceApplication['anonymousSnapshot'] = {
    city: null,
    district: null,
    industry: null,
    experienceYears: null,
    educationLevel: null,
    skills: [],
    profileScore: 0,
  };
  return {
    id: overrides.id ?? ids.application(crypto.randomUUID()),
    moduleKey: overrides.moduleKey,
    listingId: overrides.listingId,
    applicantProfileId: overrides.applicantProfileId,
    status: overrides.status ?? 'submitted',
    coverMessage: overrides.coverMessage ?? null,
    anonymousSnapshot: {
      ...defaultSnapshot,
      ...overrides.anonymousSnapshot,
    },
    profileSnapshot: overrides.profileSnapshot ?? null,
    conversationId: overrides.conversationId ?? null,
    unlockedAt: overrides.unlockedAt ?? null,
    paymentId: overrides.paymentId ?? null,
    contactedAt: overrides.contactedAt ?? null,
    reviewedAt: overrides.reviewedAt ?? null,
    metadata: overrides.metadata ?? {},
    ...timestamps(overrides.createdAt),
    ...softDeletable(overrides.deletedAt ?? null),
  };
}
