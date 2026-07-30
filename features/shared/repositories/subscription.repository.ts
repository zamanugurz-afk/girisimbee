import type { Repository } from '@/lib/domain/repository';
import type { SubscriptionId } from '@/lib/domain/ids';
import type { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionFilter } from '@/features/shared/types/subscription.types';

export interface SubscriptionRepository
  extends Repository<Subscription, SubscriptionId, CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionFilter> {
  findByUserId(userId: Subscription['userId']): Promise<Subscription | null>;
  findByStripeSubscriptionId(stripeId: string): Promise<Subscription | null>;
  transitionStatus(id: SubscriptionId, status: Subscription['status']): Promise<Subscription>;
}
