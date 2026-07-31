import type { UserId, PaymentId, ApplicationId } from '@/lib/domain/ids';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import type { CreatePaymentInput, MarketplacePayment } from '@/features/monetization/types/payment.types';
import type {
  IPaymentService,
  CreateCheckoutInput,
  CheckoutSession,
  PaymentWebhookPayload,
} from '@/features/monetization/services/payment.service.interface';
import { NotFoundError } from '@/lib/domain/errors';
import {
  PaymentService as IyzicoGateway,
  type PaymentServiceConfig,
} from '@/lib/payments/services/payment-service';

/**
 * Marketplace payment orchestration — iyzico gateway + persistence.
 */
export class MarketplacePaymentService implements IPaymentService {
  private readonly gateway: IyzicoGateway;

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly applicationRepo: ApplicationRepository,
    private readonly packageRepo: ListingPackageRepository,
    gatewayConfig?: PaymentServiceConfig,
    gateway?: IyzicoGateway,
  ) {
    this.gateway = gateway ?? new IyzicoGateway({ defaultProvider: 'iyzico', ...gatewayConfig });
  }

  async createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const catalog = await this.packageRepo.listCatalog();
    const pkg = catalog.find((p) => p.slug === input.packageSlug);
    if (!pkg) throw new NotFoundError('Package', input.packageSlug);

    const record = await this.paymentRepo.create({
      userId: input.userId,
      amountCents: pkg.priceCents,
      purpose: 'package_purchase',
      entityType: 'package',
      entityId: input.packageSlug,
      packageSlug: input.packageSlug,
      provider: 'iyzico',
    });

    const session = await this.gateway.createCheckoutSession({
      userId: input.userId,
      amountCents: pkg.priceCents,
      purpose: 'package_purchase',
      entityType: 'payment',
      entityId: record.id,
      packageSlug: input.packageSlug,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: { paymentId: record.id },
    });

    await this.paymentRepo.update(record.id, {
      providerSessionId: session.sessionId,
      status: 'processing',
    });

    return {
      id: session.sessionId,
      url: session.checkoutUrl,
      status: 'pending',
    };
  }

  async createUnlockCheckout(input: {
    userId: UserId;
    applicationId: string;
    amountCents: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkout: CheckoutSession; payment: MarketplacePayment }> {
    const payment = await this.paymentRepo.create({
      userId: input.userId,
      amountCents: input.amountCents,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: input.applicationId,
      provider: 'iyzico',
    });

    const session = await this.gateway.createCheckoutSession({
      userId: input.userId,
      amountCents: input.amountCents,
      purpose: 'unlock_candidate',
      entityType: 'application',
      entityId: input.applicationId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: { paymentId: payment.id },
    });

    const updated = await this.paymentRepo.update(payment.id, {
      providerSessionId: session.sessionId,
      status: 'processing',
    });

    return {
      checkout: { id: session.sessionId, url: session.checkoutUrl, status: 'pending' },
      payment: updated,
    };
  }

  async verifyWebhook(payload: unknown): Promise<PaymentWebhookPayload | null> {
    const result = await this.gateway.verifyWebhook(payload, undefined, 'iyzico');
    if (!result) return null;

    const payment = result.entityId
      ? await this.paymentRepo.findById(result.entityId as PaymentId)
      : null;

    if (payment) {
      await this.paymentRepo.transitionStatus(payment.id, result.status);
      if (result.status === 'succeeded' && payment.purpose === 'unlock_candidate') {
        await this.applicationRepo.update(payment.entityId as ApplicationId, {
          status: 'unlocked',
          unlockedAt: new Date().toISOString(),
          paymentId: payment.id,
        });
      }
    }

    return {
      provider: 'iyzico',
      externalId: result.providerRef,
      userId: result.userId ?? payment?.userId ?? ('' as UserId),
      packageSlug: payment?.packageSlug ?? ('unlock-candidate' as never),
      amountCents: result.amountCents,
      status: result.status === 'succeeded' ? 'succeeded' : 'failed',
    };
  }

  async getPaymentStatus(sessionId: string): Promise<CheckoutSession | null> {
    const result = await this.gateway.getPaymentStatus(sessionId, 'iyzico');
    if (!result) return null;
    return {
      id: sessionId,
      url: '',
      status: result.status === 'succeeded' ? 'completed' : 'pending',
    };
  }

  async refundPayment(externalId: string): Promise<void> {
    await this.gateway.refundPayment(externalId, undefined, 'iyzico');
  }

  recordPayment(input: CreatePaymentInput): Promise<MarketplacePayment> {
    return this.paymentRepo.create({ ...input, provider: input.provider ?? 'iyzico' });
  }

  getPaymentById(id: PaymentId): Promise<MarketplacePayment | null> {
    return this.paymentRepo.findById(id);
  }
}

/** @deprecated Use MarketplacePaymentService — alias for P2 naming */
export { MarketplacePaymentService as PaymentService };
