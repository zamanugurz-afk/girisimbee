import type { SupabaseClient } from '@supabase/supabase-js';
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
import {
  mapPaymentRow,
  toPaymentRow,
  type PaymentRow,
} from '@/features/monetization/repository/supabase/payment.mapper';
import { ids } from '@/lib/domain/ids';

const TABLE = 'marketplace_payments';

export class SupabasePaymentRepository implements PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: PaymentId, _filter?: RepositoryFilter): Promise<MarketplacePayment | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapPaymentRow(data as PaymentRow) : null;
  }

  private applyFilter(query: ReturnType<SupabaseClient['from']>, filter: PaymentFilter) {
    let q = query.select('*', { count: 'exact' });
    if (filter.userId) q = q.eq('user_id', filter.userId);
    if (filter.companyId) q = q.eq('company_id', filter.companyId);
    if (filter.purpose) q = q.eq('purpose', filter.purpose);
    if (filter.entityType) q = q.eq('entity_type', filter.entityType);
    if (filter.entityId) q = q.eq('entity_id', filter.entityId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    return q;
  }

  async findMany(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    const { data, error, count } = await this.applyFilter(this.supabase.from(TABLE), filter)
      .order('created_at', { ascending: false })
      .range(start, end);
    if (error) throw error;
    return paginatedResult(
      (data ?? []).map((r) => mapPaymentRow(r as PaymentRow)),
      count ?? 0,
      page,
      limit,
    );
  }

  async paginate(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: PaymentFilter, pagination?: PaginationParams): Promise<PaginatedResult<MarketplacePayment>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: PaymentFilter): Promise<number> {
    const { count, error } = await this.applyFilter(this.supabase.from(TABLE), filter);
    if (error) throw error;
    return count ?? 0;
  }

  async exists(id: PaymentId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreatePaymentInput): Promise<MarketplacePayment> {
    const entity = createPayment({ ...input, id: ids.payment(crypto.randomUUID()) });
    const row = { id: entity.id, ...toPaymentRow(entity) };
    const { data, error } = await this.supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return mapPaymentRow(data as PaymentRow);
  }

  async update(id: PaymentId, input: UpdatePaymentInput): Promise<MarketplacePayment> {
    const row = { ...toPaymentRow(input), updated_at: now() };
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('Payment', id);
    return mapPaymentRow(data as PaymentRow);
  }

  async findByProviderRef(providerRef: string): Promise<MarketplacePayment | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('provider_ref', providerRef)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPaymentRow(data as PaymentRow) : null;
  }

  async transitionStatus(id: PaymentId, status: PaymentStatus): Promise<MarketplacePayment> {
    const payment = await this.findById(id);
    if (!payment) throw new NotFoundError('Payment', id);
    return this.update(id, {
      status,
      paidAt: status === 'succeeded' ? now() : payment.paidAt,
      refundedAt: status === 'refunded' ? now() : payment.refundedAt,
    });
  }
}
