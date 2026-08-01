import type { PaymentProvider } from '@/lib/domain/marketplace-enums';
import type {
  CreateCheckoutParams,
  CheckoutSessionResult,
  IPaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '@/lib/payments/interfaces/payment-provider';
import { IyzicoPaymentProvider } from '@/lib/payments/providers/iyzico';
import { StripePaymentProvider } from '@/lib/payments/providers/stripe';
import { PaytrPaymentProvider } from '@/lib/payments/providers/paytr';
import { SimulatedPaymentProvider } from '@/lib/payments/providers/simulated';
import { PaymentProviderNotImplementedError } from '@/lib/payments/interfaces/payment-provider';

export interface PaymentServiceConfig {
  defaultProvider?: PaymentProvider;
}

/**
 * Orchestrates payment provider selection.
 * v1 default: iyzico
 */
export class PaymentService {
  private readonly providers: Map<PaymentProvider, IPaymentProvider>;
  private readonly defaultProvider: PaymentProvider;

  constructor(config: PaymentServiceConfig = {}) {
    this.providers = new Map<PaymentProvider, IPaymentProvider>([
      ['iyzico', new IyzicoPaymentProvider()],
      ['stripe', new StripePaymentProvider()],
      ['paytr', new PaytrPaymentProvider()],
      ['simulated', new SimulatedPaymentProvider()],
    ]);
    this.defaultProvider = config.defaultProvider ?? 'iyzico';
  }

  resolveProvider(name?: PaymentProvider): IPaymentProvider {
    const providerName = name ?? this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new PaymentProviderNotImplementedError(providerName);
    }
    return provider;
  }

  async createCheckoutSession(
    params: CreateCheckoutParams,
    providerName?: PaymentProvider,
  ): Promise<CheckoutSessionResult> {
    return this.resolveProvider(providerName).createCheckoutSession(params);
  }

  async verifyWebhook(
    payload: unknown,
    signature?: string,
    providerName?: PaymentProvider,
  ): Promise<PaymentVerificationResult | null> {
    return this.resolveProvider(providerName).verifyWebhook(payload, signature);
  }

  async getPaymentStatus(
    sessionId: string,
    providerName?: PaymentProvider,
  ): Promise<PaymentVerificationResult | null> {
    return this.resolveProvider(providerName).getPaymentStatus(sessionId);
  }

  async refundPayment(
    providerRef: string,
    amountCents?: number,
    providerName?: PaymentProvider,
  ): Promise<RefundResult> {
    return this.resolveProvider(providerName).refundPayment(providerRef, amountCents);
  }
}

/** Singleton for server-side use */
let paymentServiceInstance: PaymentService | null = null;

export function getPaymentService(config?: PaymentServiceConfig): PaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService(config);
  }
  return paymentServiceInstance;
}

export function resetPaymentServiceForTests(): void {
  paymentServiceInstance = null;
}
