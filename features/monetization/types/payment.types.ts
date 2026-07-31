import type { Timestamps } from '@/lib/domain/base';
import type {
  PaymentStatus,
  PaymentProvider,
  PaymentPurpose,
} from '@/lib/domain/marketplace-enums';
import type { PaymentId, UserId, CompanyId } from '@/lib/domain/ids';
import type { ListingPackageSlug } from '@/features/monetization/types/listing-package.types';

export interface MarketplacePayment extends Timestamps {
  id: PaymentId;
  userId: UserId;
  companyId: CompanyId | null;
  packageSlug: ListingPackageSlug | null;
  amountCents: number;
  currency: string;
  provider: PaymentProvider;
  providerRef: string | null;
  providerSessionId: string | null;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  paidAt: string | null;
  refundedAt: string | null;
}

export type CreatePaymentInput = Pick<
  MarketplacePayment,
  'userId' | 'amountCents' | 'purpose' | 'entityType' | 'entityId'
> & {
  companyId?: CompanyId | null;
  packageSlug?: ListingPackageSlug | null;
  currency?: string;
  provider?: PaymentProvider;
  metadata?: Record<string, unknown>;
};

export interface PaymentFilter {
  userId?: UserId;
  companyId?: CompanyId;
  status?: PaymentStatus | PaymentStatus[];
  purpose?: PaymentPurpose;
  entityType?: string;
  entityId?: string;
}
