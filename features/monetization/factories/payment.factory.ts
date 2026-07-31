import { ids } from '@/lib/domain/ids';
import { timestamps } from '@/lib/domain/factory';
import type {
  MarketplacePayment,
  CreatePaymentInput,
} from '@/features/monetization/types/payment.types';

export function createPayment(
  overrides: Partial<MarketplacePayment> & CreatePaymentInput,
): MarketplacePayment {
  return {
    id: overrides.id ?? ids.payment(crypto.randomUUID()),
    userId: overrides.userId,
    companyId: overrides.companyId ?? null,
    packageSlug: overrides.packageSlug ?? null,
    amountCents: overrides.amountCents,
    currency: overrides.currency ?? 'TRY',
    provider: overrides.provider ?? 'iyzico',
    providerRef: overrides.providerRef ?? null,
    providerSessionId: overrides.providerSessionId ?? null,
    status: overrides.status ?? 'pending',
    purpose: overrides.purpose,
    entityType: overrides.entityType,
    entityId: overrides.entityId,
    metadata: overrides.metadata ?? {},
    paidAt: overrides.paidAt ?? null,
    refundedAt: overrides.refundedAt ?? null,
    ...timestamps(overrides.createdAt),
  };
}
