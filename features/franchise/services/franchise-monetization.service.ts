import { now } from '@/lib/domain/factory';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/domain/errors';
import type { UserId, PaymentId, FranchisePackageId } from '@/lib/domain/ids';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';
import type { FranchisePackageRepository } from '@/features/franchise/repositories/franchise-package.repository';
import type {
  FranchisePackageCatalogItem,
  FranchisePackageSlug,
  FranchiseUserPackage,
  CreateFranchiseCatalogInput,
  FranchisePaymentMetadata,
  FranchiseCoupon,
} from '@/features/franchise/types/franchise-package.types';
import { FRANCHISE_PACKAGE_TIER } from '@/features/franchise/types/franchise-package.types';
import {
  PaymentService as IyzicoGateway,
  type PaymentServiceConfig,
} from '@/lib/payments/services/payment-service';
import type { CheckoutSession } from '@/features/monetization/services/payment.service.interface';

export interface FranchiseCheckoutInput {
  userId: UserId;
  packageSlug: FranchisePackageSlug;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
  action?: FranchisePaymentMetadata['action'];
  fromPackageSlug?: FranchisePackageSlug;
  userPackageId?: FranchisePackageId;
}

export interface CouponApplyResult {
  code: string;
  originalAmountCents: number;
  discountCents: number;
  finalAmountCents: number;
}

export interface IFranchiseMonetizationService {
  listCatalog(): Promise<FranchisePackageCatalogItem[]>;
  getPackage(slug: FranchisePackageSlug): Promise<FranchisePackageCatalogItem>;
  createCatalogItem(input: CreateFranchiseCatalogInput): Promise<FranchisePackageCatalogItem>;
  createCheckout(input: FranchiseCheckoutInput): Promise<{ checkout: CheckoutSession; payment: MarketplacePayment }>;
  getPaymentHistory(userId: UserId): Promise<MarketplacePayment[]>;
  getInvoice(paymentId: PaymentId): Promise<{ payment: MarketplacePayment; invoice: FranchisePaymentMetadata }>;
  applyCoupon(code: string, packageSlug: FranchisePackageSlug): Promise<CouponApplyResult>;
  upgradePackage(userId: UserId, fromSlug: FranchisePackageSlug, toSlug: FranchisePackageSlug, urls: { successUrl: string; cancelUrl: string }): Promise<{ checkout: CheckoutSession; payment: MarketplacePayment }>;
  downgradePackage(userId: UserId, fromSlug: FranchisePackageSlug, toSlug: FranchisePackageSlug, urls: { successUrl: string; cancelUrl: string }): Promise<{ checkout: CheckoutSession; payment: MarketplacePayment }>;
  renewPackage(userId: UserId, userPackageId: FranchisePackageId, urls: { successUrl: string; cancelUrl: string }): Promise<{ checkout: CheckoutSession; payment: MarketplacePayment }>;
  getRemainingDays(userPackageId: FranchisePackageId): Promise<number>;
  isActiveEntitlement(userPackageId: FranchisePackageId): Promise<boolean>;
  checkExpiration(userPackageId: FranchisePackageId): Promise<FranchiseUserPackage>;
  activatePackage(userId: UserId, packageSlug: FranchisePackageSlug): Promise<FranchiseUserPackage>;
  suspendPackage(userPackageId: FranchisePackageId): Promise<FranchiseUserPackage>;
  cancelPackage(userPackageId: FranchisePackageId): Promise<FranchiseUserPackage>;
  extendDuration(userPackageId: FranchisePackageId, extraDays: number): Promise<FranchiseUserPackage>;
  listPaymentHistory(filter?: { userId?: UserId }): Promise<MarketplacePayment[]>;
  updatePayment(paymentId: PaymentId, input: { metadata?: FranchisePaymentMetadata; status?: MarketplacePayment['status'] }): Promise<MarketplacePayment>;
  fulfillPayment(paymentId: PaymentId): Promise<FranchiseUserPackage | null>;
}

function computeDiscount(priceCents: number, coupon: FranchiseCoupon): number {
  if (coupon.discountCents != null) return Math.min(coupon.discountCents, priceCents);
  if (coupon.discountPercent != null) return Math.floor((priceCents * coupon.discountPercent) / 100);
  return 0;
}

export class FranchiseMonetizationService implements IFranchiseMonetizationService {
  private readonly gateway: IyzicoGateway;

  constructor(
    private readonly packageRepo: FranchisePackageRepository,
    private readonly paymentRepo: PaymentRepository,
    gatewayConfig?: PaymentServiceConfig,
    gateway?: IyzicoGateway,
  ) {
    this.gateway = gateway ?? new IyzicoGateway({ defaultProvider: 'iyzico', ...gatewayConfig });
  }

  listCatalog() {
    return this.packageRepo.listCatalog();
  }

  async getPackage(slug: FranchisePackageSlug) {
    const pkg = await this.packageRepo.getBySlug(slug);
    if (!pkg) throw new NotFoundError('FranchisePackage', slug);
    return pkg;
  }

  createCatalogItem(input: CreateFranchiseCatalogInput) {
    return this.packageRepo.createCatalogItem(input);
  }

  async applyCoupon(code: string, packageSlug: FranchisePackageSlug): Promise<CouponApplyResult> {
    const catalog = await this.getPackage(packageSlug);
    const coupon = await this.packageRepo.findCoupon(code);
    if (!coupon) {
      throw new ValidationError('Geçersiz kupon kodu.', { couponCode: ['Kupon bulunamadı veya süresi dolmuş.'] });
    }
    if (coupon.validPackageSlugs && !coupon.validPackageSlugs.includes(packageSlug)) {
      throw new ValidationError('Kupon bu paket için geçerli değil.', { couponCode: ['Paket uyumsuz.'] });
    }
    const discountCents = computeDiscount(catalog.packagePrice, coupon);
    return {
      code: coupon.code,
      originalAmountCents: catalog.packagePrice,
      discountCents,
      finalAmountCents: Math.max(0, catalog.packagePrice - discountCents),
    };
  }

  private async resolveCheckoutAmount(
    packageSlug: FranchisePackageSlug,
    couponCode?: string,
    overrideCents?: number,
  ): Promise<{ amountCents: number; metadata: FranchisePaymentMetadata }> {
    const catalog = await this.getPackage(packageSlug);
    const originalAmountCents = overrideCents ?? catalog.packagePrice;
    let discountCents = 0;
    let code: string | undefined;

    if (couponCode) {
      const applied = await this.applyCoupon(couponCode, packageSlug);
      discountCents = applied.discountCents;
      code = applied.code;
    }

    const amountCents = Math.max(0, originalAmountCents - discountCents);
    return {
      amountCents,
      metadata: {
        franchisePackageSlug: packageSlug,
        couponCode: code,
        discountCents: discountCents || undefined,
        originalAmountCents,
      },
    };
  }

  async createCheckout(input: FranchiseCheckoutInput) {
    const { amountCents, metadata } = await this.resolveCheckoutAmount(
      input.packageSlug,
      input.couponCode,
    );

    const record = await this.paymentRepo.create({
      userId: input.userId,
      amountCents,
      purpose: 'franchise_package',
      entityType: 'franchise_package',
      entityId: input.packageSlug,
      metadata: {
        ...metadata,
        action: input.action ?? 'purchase',
        fromPackageSlug: input.fromPackageSlug,
        userPackageId: input.userPackageId,
      },
      provider: 'iyzico',
    });

    const session = await this.gateway.createCheckoutSession({
      userId: input.userId,
      amountCents,
      purpose: 'franchise_package',
      entityType: 'payment',
      entityId: record.id,
      packageSlug: input.packageSlug as never,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: { paymentId: record.id },
    });

    const updated = await this.paymentRepo.update(record.id, {
      providerSessionId: session.sessionId,
      status: 'processing',
    });

    return {
      checkout: { id: session.sessionId, url: session.checkoutUrl, status: 'pending' as const },
      payment: updated,
    };
  }

  async upgradePackage(
    userId: UserId,
    fromSlug: FranchisePackageSlug,
    toSlug: FranchisePackageSlug,
    urls: { successUrl: string; cancelUrl: string },
  ) {
    if (FRANCHISE_PACKAGE_TIER[toSlug] <= FRANCHISE_PACKAGE_TIER[fromSlug]) {
      throw new ValidationError('Yükseltme için daha üst paket seçilmeli.', { toSlug: ['Geçersiz yükseltme.'] });
    }
    const active = await this.packageRepo.findActiveByUser({ userId, packageSlug: fromSlug });
    const current = active[0];
    if (!current) throw new NotFoundError('FranchiseUserPackage', fromSlug);

    const fromPkg = await this.getPackage(fromSlug);
    const toPkg = await this.getPackage(toSlug);
    const priceDiff = Math.max(0, toPkg.packagePrice - fromPkg.packagePrice);

    const { amountCents, metadata } = await this.resolveCheckoutAmount(toSlug, undefined, priceDiff);

    const record = await this.paymentRepo.create({
      userId,
      amountCents,
      purpose: 'franchise_package',
      entityType: 'franchise_package',
      entityId: toSlug,
      metadata: {
        ...metadata,
        action: 'upgrade',
        fromPackageSlug: fromSlug,
        toPackageSlug: toSlug,
        userPackageId: current.id,
      },
      provider: 'iyzico',
    });

    const session = await this.gateway.createCheckoutSession({
      userId,
      amountCents,
      purpose: 'franchise_package',
      entityType: 'payment',
      entityId: record.id,
      packageSlug: toSlug as never,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      metadata: { paymentId: record.id },
    });

    const updated = await this.paymentRepo.update(record.id, {
      providerSessionId: session.sessionId,
      status: 'processing',
    });

    return {
      checkout: { id: session.sessionId, url: session.checkoutUrl, status: 'pending' as const },
      payment: updated,
    };
  }

  async downgradePackage(
    userId: UserId,
    fromSlug: FranchisePackageSlug,
    toSlug: FranchisePackageSlug,
    urls: { successUrl: string; cancelUrl: string },
  ) {
    if (FRANCHISE_PACKAGE_TIER[toSlug] >= FRANCHISE_PACKAGE_TIER[fromSlug]) {
      throw new ValidationError('Düşürme için daha alt paket seçilmeli.', { toSlug: ['Geçersiz düşürme.'] });
    }
    const active = await this.packageRepo.findActiveByUser({ userId, packageSlug: fromSlug });
    const current = active[0];
    if (!current) throw new NotFoundError('FranchiseUserPackage', fromSlug);

    return this.createCheckout({
      userId,
      packageSlug: toSlug,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      action: 'downgrade',
      fromPackageSlug: fromSlug,
      userPackageId: current.id,
    });
  }

  async renewPackage(
    userId: UserId,
    userPackageId: FranchisePackageId,
    urls: { successUrl: string; cancelUrl: string },
  ) {
    const existing = await this.packageRepo.findById(userPackageId);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('FranchiseUserPackage', userPackageId);
    }

    return this.createCheckout({
      userId,
      packageSlug: existing.packageSlug,
      successUrl: urls.successUrl,
      cancelUrl: urls.cancelUrl,
      action: 'renewal',
      userPackageId,
    });
  }

  async getPaymentHistory(userId: UserId) {
    const { data } = await this.paymentRepo.findMany({ userId, purpose: 'franchise_package' });
    return data;
  }

  async listPaymentHistory(filter: { userId?: UserId } = {}) {
    const { data } = await this.paymentRepo.findMany({
      userId: filter.userId,
      purpose: 'franchise_package',
    });
    return data;
  }

  async getInvoice(paymentId: PaymentId) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment', paymentId);
    if (payment.purpose !== 'franchise_package') {
      throw new ForbiddenError('Bu ödeme franchise paketi ile ilişkili değil.');
    }
    return {
      payment,
      invoice: payment.metadata as FranchisePaymentMetadata,
    };
  }

  async getRemainingDays(userPackageId: FranchisePackageId): Promise<number> {
    const pkg = await this.packageRepo.findById(userPackageId);
    if (!pkg) throw new NotFoundError('FranchiseUserPackage', userPackageId);
    if (!pkg.expiresAt) return 0;
    const diff = new Date(pkg.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  async isActiveEntitlement(userPackageId: FranchisePackageId): Promise<boolean> {
    const pkg = await this.checkExpiration(userPackageId);
    return pkg.status === 'active';
  }

  async checkExpiration(userPackageId: FranchisePackageId): Promise<FranchiseUserPackage> {
    const pkg = await this.packageRepo.findById(userPackageId);
    if (!pkg) throw new NotFoundError('FranchiseUserPackage', userPackageId);

    if (pkg.status === 'active' && pkg.expiresAt && new Date(pkg.expiresAt) < new Date()) {
      return this.packageRepo.updateStatus(userPackageId, 'expired');
    }
    return pkg;
  }

  activatePackage(userId: UserId, packageSlug: FranchisePackageSlug) {
    return this.packageRepo.grant({ userId, packageSlug, grantedBy: 'admin' });
  }

  suspendPackage(userPackageId: FranchisePackageId) {
    return this.packageRepo.updateStatus(userPackageId, 'suspended');
  }

  cancelPackage(userPackageId: FranchisePackageId) {
    return this.packageRepo.updateStatus(userPackageId, 'cancelled');
  }

  extendDuration(userPackageId: FranchisePackageId, extraDays: number) {
    if (extraDays <= 0) {
      throw new ValidationError('Süre uzatması pozitif olmalı.', { extraDays: ['Geçersiz gün sayısı.'] });
    }
    return this.packageRepo.extendDuration(userPackageId, extraDays);
  }

  async updatePayment(
    paymentId: PaymentId,
    input: { metadata?: FranchisePaymentMetadata; status?: MarketplacePayment['status'] },
  ) {
    const existing = await this.paymentRepo.findById(paymentId);
    if (!existing) throw new NotFoundError('Payment', paymentId);

    const metadata = input.metadata
      ? { ...existing.metadata, ...input.metadata }
      : undefined;

    return this.paymentRepo.update(paymentId, {
      ...(input.status ? { status: input.status } : {}),
      ...(metadata ? { metadata } : {}),
      ...(input.status === 'succeeded' ? { paidAt: now() } : {}),
    });
  }

  async fulfillPayment(paymentId: PaymentId): Promise<FranchiseUserPackage | null> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment || payment.purpose !== 'franchise_package') return null;

    const meta = payment.metadata as FranchisePaymentMetadata;
    const slug = meta.toPackageSlug ?? meta.franchisePackageSlug;
    if (!slug) return null;

    if (meta.action === 'renewal' && meta.userPackageId) {
      const catalog = await this.getPackage(slug);
      return this.packageRepo.extendDuration(meta.userPackageId as FranchisePackageId, catalog.packageDuration);
    }

    if (meta.action === 'upgrade' && meta.userPackageId) {
      await this.packageRepo.updateStatus(meta.userPackageId as FranchisePackageId, 'cancelled');
    }

    if (meta.action === 'downgrade' && meta.userPackageId) {
      await this.packageRepo.updateStatus(meta.userPackageId as FranchisePackageId, 'cancelled');
    }

    return this.packageRepo.grant({
      userId: payment.userId,
      packageSlug: slug,
      grantedBy: 'payment',
    });
  }
}
