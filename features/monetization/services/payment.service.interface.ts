import type { UserId, ListingPackageId } from '@/lib/domain/ids';
import type { ListingPackageSlug } from '@/features/monetization/types/listing-package.types';

export interface CreateCheckoutInput {
  userId: UserId;
  packageSlug: ListingPackageSlug;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
}

export interface PaymentWebhookPayload {
  provider: 'iyzico' | 'stripe';
  externalId: string;
  userId: UserId;
  packageSlug: ListingPackageSlug;
  amountCents: number;
  status: 'succeeded' | 'failed' | 'refunded';
}

export interface IPaymentService {
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;
  verifyWebhook(payload: unknown): Promise<PaymentWebhookPayload | null>;
  getPaymentStatus(sessionId: string): Promise<CheckoutSession | null>;
  refundPayment(externalId: string): Promise<void>;
}

/** Stub until iyzico/Stripe integration — all methods throw NotImplemented. */
export class UnimplementedPaymentService implements IPaymentService {
  async createCheckoutSession(): Promise<CheckoutSession> {
    throw new Error('Ödeme entegrasyonu henüz aktif değil.');
  }

  async verifyWebhook(): Promise<PaymentWebhookPayload | null> {
    throw new Error('Ödeme entegrasyonu henüz aktif değil.');
  }

  async getPaymentStatus(): Promise<CheckoutSession | null> {
    throw new Error('Ödeme entegrasyonu henüz aktif değil.');
  }

  async refundPayment(): Promise<void> {
    throw new Error('Ödeme entegrasyonu henüz aktif değil.');
  }
}
