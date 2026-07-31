import { now } from '@/lib/domain/factory';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError } from '@/lib/domain/errors';
import type { PaymentId } from '@/lib/domain/ids';
import type { PaymentStatus } from '@/lib/domain/marketplace-enums';
import type {
  MarketplacePayment,
  PaymentFilter,
  CreatePaymentInput,
} from '@/features/monetization/types/payment.types';
import type {
  PaymentRepository,
  UpdatePaymentInput,
} from '@/features/monetization/repositories/payment.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createPayment } from '@/features/monetization/factories/payment.factory';

export class MockPaymentRepository implements PaymentRepository {
  private payments = new Map<PaymentId, MarketplacePayment>();

  async findById(id: PaymentId, _filter?: RepositoryFilter): Promise<MarketplacePayment | null> {
    return this.payments.get(id) ?? null;
  }

  async findMany(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.payments.values()];
    if (filter.userId) results = results.filter((p) => p.userId === filter.userId);
    if (filter.companyId) results = results.filter((p) => p.companyId === filter.companyId);
    if (filter.purpose) results = results.filter((p) => p.purpose === filter.purpose);
    if (filter.entityType) results = results.filter((p) => p.entityType === filter.entityType);
    if (filter.entityId) results = results.filter((p) => p.entityId === filter.entityId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((p) => statuses.includes(p.status));
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: PaymentFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: PaymentId): Promise<boolean> {
    return this.payments.has(id);
  }

  async create(input: CreatePaymentInput): Promise<MarketplacePayment> {
    const payment = createPayment(input);
    this.payments.set(payment.id, payment);
    return payment;
  }

  async update(id: PaymentId, input: UpdatePaymentInput): Promise<MarketplacePayment> {
    const existing = this.payments.get(id);
    if (!existing) throw new NotFoundError('Payment', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.payments.set(id, updated);
    return updated;
  }

  async findByProviderRef(providerRef: string): Promise<MarketplacePayment | null> {
    return [...this.payments.values()].find((p) => p.providerRef === providerRef) ?? null;
  }

  async transitionStatus(id: PaymentId, status: PaymentStatus): Promise<MarketplacePayment> {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundError('Payment', id);
    const updated = {
      ...payment,
      status,
      paidAt: status === 'succeeded' ? now() : payment.paidAt,
      refundedAt: status === 'refunded' ? now() : payment.refundedAt,
      updatedAt: now(),
    };
    this.payments.set(id, updated);
    return updated;
  }
}
