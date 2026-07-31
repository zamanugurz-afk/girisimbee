import type {
  CreateCheckoutParams,
  CheckoutSessionResult,
  IPaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '@/lib/payments/interfaces/payment-provider';
import { PaymentProviderNotImplementedError } from '@/lib/payments/interfaces/payment-provider';

/** Stripe provider stub — not implemented in v1 */
export class StripePaymentProvider implements IPaymentProvider {
  readonly name = 'stripe' as const;

  async createCheckoutSession(_params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    throw new PaymentProviderNotImplementedError('stripe');
  }

  async verifyWebhook(_payload: unknown, _signature?: string): Promise<PaymentVerificationResult | null> {
    throw new PaymentProviderNotImplementedError('stripe');
  }

  async getPaymentStatus(_sessionId: string): Promise<PaymentVerificationResult | null> {
    throw new PaymentProviderNotImplementedError('stripe');
  }

  async refundPayment(_providerRef: string): Promise<RefundResult> {
    throw new PaymentProviderNotImplementedError('stripe');
  }
}
