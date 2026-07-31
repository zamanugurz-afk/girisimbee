import type {
  CreateCheckoutParams,
  CheckoutSessionResult,
  IPaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '@/lib/payments/interfaces/payment-provider';
import { PaymentProviderNotImplementedError } from '@/lib/payments/interfaces/payment-provider';

/** PayTR provider stub — not implemented in v1 */
export class PaytrPaymentProvider implements IPaymentProvider {
  readonly name = 'paytr' as const;

  async createCheckoutSession(_params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    throw new PaymentProviderNotImplementedError('paytr');
  }

  async verifyWebhook(_payload: unknown, _signature?: string): Promise<PaymentVerificationResult | null> {
    throw new PaymentProviderNotImplementedError('paytr');
  }

  async getPaymentStatus(_sessionId: string): Promise<PaymentVerificationResult | null> {
    throw new PaymentProviderNotImplementedError('paytr');
  }

  async refundPayment(_providerRef: string): Promise<RefundResult> {
    throw new PaymentProviderNotImplementedError('paytr');
  }
}
