/**
 * Stub SimulatedPaymentProvider — Phase 2 scaffolding only.
 * Does not call real POS APIs. Full checkout wiring comes in a later phase.
 * Server-safe (no 'use client') — used by PaymentService on the server.
 */
import { ids } from '@/lib/domain/ids';
import type {
  CheckoutSessionResult,
  IPaymentProvider,
  CreateCheckoutParams,
  PaymentVerificationResult,
  RefundResult,
} from '@/lib/payments/interfaces/payment-provider';

export class SimulatedPaymentProvider implements IPaymentProvider {
  readonly name = 'simulated' as const;

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const sessionId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      sessionId,
      checkoutUrl: params.successUrl,
      provider: 'simulated',
      status: 'pending',
    };
  }

  async verifyWebhook(): Promise<PaymentVerificationResult | null> {
    return null;
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentVerificationResult | null> {
    return {
      provider: 'simulated',
      providerRef: sessionId,
      sessionId,
      status: 'succeeded',
      amountCents: 0,
      currency: 'TRY',
      userId: ids.user('00000000-0000-4000-8000-000000000000'),
      entityType: 'listing_placement',
      entityId: null,
      metadata: { simulated: true },
    };
  }

  async refundPayment(providerRef: string): Promise<RefundResult> {
    return { providerRef, status: 'refunded' };
  }
}
