import type { Repository } from '@/lib/domain/repository';
import type { PaymentId } from '@/lib/domain/ids';
import type {
  MarketplacePayment,
  CreatePaymentInput,
  PaymentFilter,
} from '@/features/monetization/types/payment.types';
import type { PaymentStatus } from '@/lib/domain/marketplace-enums';

export type UpdatePaymentInput = Partial<
  Pick<
    MarketplacePayment,
    | 'status'
    | 'providerRef'
    | 'providerSessionId'
    | 'metadata'
    | 'paidAt'
    | 'refundedAt'
  >
>;

export interface PaymentRepository
  extends Omit<
    Repository<
      MarketplacePayment,
      PaymentId,
      CreatePaymentInput,
      UpdatePaymentInput,
      PaymentFilter
    >,
    'softDelete' | 'delete' | 'restore'
  > {
  findByProviderRef(providerRef: string): Promise<MarketplacePayment | null>;
  transitionStatus(id: PaymentId, status: PaymentStatus): Promise<MarketplacePayment>;
}
