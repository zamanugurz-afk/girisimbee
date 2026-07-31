import type { UserId } from '@/lib/domain/ids';
import type {
  PaymentProvider,
  PaymentPurpose,
  PaymentStatus,
} from '@/lib/domain/marketplace-enums';
import type { ListingPackageSlug } from '@/features/monetization/types/listing-package.types';

export interface CreateCheckoutParams {
  userId: UserId;
  amountCents: number;
  currency?: string;
  purpose: PaymentPurpose;
  entityType: string;
  entityId: string;
  packageSlug?: ListingPackageSlug | null;
  successUrl: string;
  cancelUrl: string;
  buyerEmail?: string;
  buyerName?: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: PaymentProvider;
  status: 'pending';
}

export interface PaymentVerificationResult {
  provider: PaymentProvider;
  providerRef: string;
  sessionId: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  userId: UserId | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
}

export interface RefundResult {
  providerRef: string;
  status: 'refunded' | 'failed';
}

/** Provider-agnostic payment gateway contract */
export interface IPaymentProvider {
  readonly name: PaymentProvider;

  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult>;

  verifyWebhook(payload: unknown, signature?: string): Promise<PaymentVerificationResult | null>;

  getPaymentStatus(sessionId: string): Promise<PaymentVerificationResult | null>;

  refundPayment(providerRef: string, amountCents?: number): Promise<RefundResult>;
}

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: PaymentProvider,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PaymentProviderError';
  }
}

export class PaymentProviderNotImplementedError extends PaymentProviderError {
  constructor(provider: PaymentProvider) {
    super(`${provider} ödeme sağlayıcısı henüz aktif değil.`, provider);
    this.name = 'PaymentProviderNotImplementedError';
  }
}
