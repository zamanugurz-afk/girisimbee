import { fromTimestamps } from '@/lib/persistence/mappers';
import type { PaymentId, UserId, CompanyId } from '@/lib/domain/ids';
import type {
  PaymentStatus,
  PaymentProvider,
  PaymentPurpose,
} from '@/lib/domain/marketplace-enums';
import type { ListingPackageSlug } from '@/features/monetization/types/listing-package.types';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';

export interface PaymentRow {
  id: string;
  user_id: string;
  company_id: string | null;
  package_slug: string | null;
  amount_cents: number;
  currency: string;
  provider: string;
  provider_ref: string | null;
  provider_session_id: string | null;
  status: string;
  purpose: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapPaymentRow(row: PaymentRow): MarketplacePayment {
  return {
    id: row.id as PaymentId,
    userId: row.user_id as UserId,
    companyId: row.company_id as CompanyId | null,
    packageSlug: row.package_slug as ListingPackageSlug | null,
    amountCents: row.amount_cents,
    currency: row.currency,
    provider: row.provider as PaymentProvider,
    providerRef: row.provider_ref,
    providerSessionId: row.provider_session_id,
    status: row.status as PaymentStatus,
    purpose: row.purpose as PaymentPurpose,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    paidAt: row.paid_at,
    refundedAt: row.refunded_at,
    ...fromTimestamps(row),
  };
}

export function toPaymentRow(input: Partial<MarketplacePayment>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.userId !== undefined) row.user_id = input.userId;
  if (input.companyId !== undefined) row.company_id = input.companyId;
  if (input.packageSlug !== undefined) row.package_slug = input.packageSlug;
  if (input.amountCents !== undefined) row.amount_cents = input.amountCents;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.provider !== undefined) row.provider = input.provider;
  if (input.providerRef !== undefined) row.provider_ref = input.providerRef;
  if (input.providerSessionId !== undefined) row.provider_session_id = input.providerSessionId;
  if (input.status !== undefined) row.status = input.status;
  if (input.purpose !== undefined) row.purpose = input.purpose;
  if (input.entityType !== undefined) row.entity_type = input.entityType;
  if (input.entityId !== undefined) row.entity_id = input.entityId;
  if (input.metadata !== undefined) row.metadata = input.metadata;
  if (input.paidAt !== undefined) row.paid_at = input.paidAt;
  if (input.refundedAt !== undefined) row.refunded_at = input.refundedAt;
  return row;
}
