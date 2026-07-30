/**
 * Subscription — premium tier billing (FUTURE — disabled during MVP).
 *
 * Purpose: Monetization via tiered plans; gated by ENABLE_PREMIUM flag.
 * Relations: belongs to User.
 * Lifecycle: trialing → active ↔ past_due → canceled → expired
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { SubscriptionId, UserId } from '@/lib/domain/ids';

export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'deleted';

export interface Subscription extends Timestamps, SoftDeletable {
  id: SubscriptionId;
  userId: UserId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  trialEnd: string | null;
}

export type CreateSubscriptionInput = Pick<Subscription, 'userId' | 'plan'> & {
  trialEnd?: string | null;
};

export type UpdateSubscriptionInput = Partial<
  Pick<
    Subscription,
    'plan' | 'status' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'currentPeriodStart' | 'currentPeriodEnd' | 'canceledAt'
  >
>;

export interface SubscriptionFilter {
  userId?: UserId;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus | SubscriptionStatus[];
  includeDeleted?: boolean;
}

export const SUBSCRIPTION_INDEXES: IndexDefinition[] = [
  { name: 'subscriptions_user_id_unique', columns: ['user_id'], unique: true, where: 'deleted_at IS NULL' },
  { name: 'subscriptions_status_idx', columns: ['status'] },
  { name: 'subscriptions_stripe_subscription_id_idx', columns: ['stripe_subscription_id'], where: 'stripe_subscription_id IS NOT NULL' },
];

export const SUBSCRIPTION_LIFECYCLE: Record<SubscriptionStatus, readonly SubscriptionStatus[]> = {
  trialing: ['active', 'canceled', 'expired', 'deleted'],
  active: ['past_due', 'canceled', 'deleted'],
  past_due: ['active', 'canceled', 'expired', 'deleted'],
  canceled: ['expired', 'deleted'],
  expired: ['deleted'],
  deleted: [],
};

export const SUBSCRIPTION_VALIDATION: ValidationRule[] = [
  { field: 'plan', rule: 'required|in:free,pro,business', message: 'Geçerli plan gerekli.' },
];
