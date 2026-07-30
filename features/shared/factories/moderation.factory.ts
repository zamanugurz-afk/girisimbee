import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { Report, CreateReportInput } from '@/features/shared/types/report.types';
import type { Activity, CreateActivityInput } from '@/features/shared/types/activity.types';
import type { Subscription, CreateSubscriptionInput } from '@/features/shared/types/subscription.types';

export function createReport(overrides: Partial<Report> & Pick<Report, 'reporterId' | 'entityType' | 'entityId' | 'reason'>): Report {
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

export function createActivity(overrides: Partial<Activity> & Pick<Activity, 'verb' | 'entityType' | 'entityId' | 'summary'>): Activity {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.activity(crypto.randomUUID()),
    actorId: overrides.actorId ?? null,
    verb: overrides.verb,
    entityType: overrides.entityType,
    entityId: overrides.entityId,
    summary: overrides.summary,
    metadata: overrides.metadata ?? {},
    isPublic: overrides.isPublic ?? true,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createSubscription(overrides: Partial<Subscription> & Pick<Subscription, 'userId' | 'plan'>): Subscription {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.subscription(crypto.randomUUID()),
    userId: overrides.userId,
    plan: overrides.plan,
    status: overrides.status ?? 'active',
    stripeCustomerId: overrides.stripeCustomerId ?? null,
    stripeSubscriptionId: overrides.stripeSubscriptionId ?? null,
    currentPeriodStart: overrides.currentPeriodStart ?? null,
    currentPeriodEnd: overrides.currentPeriodEnd ?? null,
    canceledAt: overrides.canceledAt ?? null,
    trialEnd: overrides.trialEnd ?? null,
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createReportInput(overrides: Partial<CreateReportInput> = {}): CreateReportInput {
  return {
    reporterId: overrides.reporterId ?? ids.user(crypto.randomUUID()),
    entityType: overrides.entityType ?? 'listing',
    entityId: overrides.entityId ?? ids.listing(crypto.randomUUID()),
    reason: overrides.reason ?? 'spam',
    description: overrides.description,
  };
}

export function createActivityInput(overrides: Partial<CreateActivityInput> = {}): CreateActivityInput {
  return {
    verb: overrides.verb ?? 'listing.published',
    entityType: overrides.entityType ?? 'listing',
    entityId: overrides.entityId ?? ids.listing(crypto.randomUUID()),
    summary: overrides.summary ?? 'Yeni ilan yayınlandı',
    actorId: overrides.actorId,
    metadata: overrides.metadata,
    isPublic: overrides.isPublic,
  };
}

export function createSubscriptionInput(overrides: Partial<CreateSubscriptionInput> = {}): CreateSubscriptionInput {
  return {
    userId: overrides.userId ?? ids.user(crypto.randomUUID()),
    plan: overrides.plan ?? 'free',
    trialEnd: overrides.trialEnd,
  };
}
