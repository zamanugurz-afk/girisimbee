/**
 * Supabase user repository — auth profiles table.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { now } from '@/lib/domain/factory';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import type { UserId } from '@/lib/domain/ids';
import type { User, CreateUserInput, UpdateUserInput, UserFilter, UserStatus, DomainUserRole } from '@/features/authentication/types/user.types';
import type { UserRepository } from '@/features/authentication/repositories/user.repository';
import { USER_LIFECYCLE } from '@/features/authentication/types/user.types';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';

const TABLE = 'profiles';

interface ProfileRow {
  id: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  account_status: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

function emptyUserPage(pagination?: PaginationParams): PaginatedResult<User> {
  const { page, limit } = normalizePagination(pagination);
  return paginatedResult([], 0, page, limit);
}

function mapAuthRole(role: string): DomainUserRole {
  if (role === 'super_admin') return 'super_admin';
  if (role === 'admin' || role === 'moderator') return 'admin';
  return 'user';
}

function mapProfileRow(row: ProfileRow): User {
  const status = row.account_status as UserStatus;
  return {
    id: row.id as UserId,
    email: row.email ?? '',
    emailVerified: true,
    phone: null,
    phoneVerified: false,
    passwordHash: '',
    role: mapAuthRole(row.role),
    status,
    lastLoginAt: row.last_active_at,
    locale: 'tr',
    timezone: 'Europe/Istanbul',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: status === 'deleted' ? row.updated_at : null,
  };
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: UserId, filter?: RepositoryFilter): Promise<User | null> {
    let query = this.supabase.from(TABLE).select('*').eq('id', id);
    if (!filter?.includeDeleted) query = query.neq('account_status', 'deleted');
    const { data, error } = await query.maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapProfileRow(data as ProfileRow) : null;
  }

  async findMany(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    const { page, limit } = normalizePagination(pagination);
    const start = offset(page, limit);
    const end = start + limit - 1;
    let query = this.supabase.from(TABLE).select('*', { count: 'exact' });
    if (!filter.includeDeleted) query = query.neq('account_status', 'deleted');
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      query = query.in('account_status', statuses);
    }
    if (filter.role) {
      if (filter.role === 'user') {
        query = query.in('role', ['user', 'member', 'verified', 'company']);
      } else if (filter.role === 'super_admin') {
        query = query.eq('role', 'super_admin');
      } else {
        query = query.in('role', ['admin', 'moderator']);
      }
    }
    if (filter.query) {
      const q = `%${filter.query}%`;
      query = query.or(`email.ilike.${q},display_name.ilike.${q}`);
    }
    if (filter.activeSince) query = query.gte('last_active_at', filter.activeSince);
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, end);
    if (error) {
      if (isMissingRelationError(error)) return emptyUserPage(pagination);
      throw error;
    }
    return paginatedResult((data ?? []).map((r) => mapProfileRow(r as ProfileRow)), count ?? 0, page, limit);
  }

  async paginate(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: UserFilter, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: UserFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: UserId): Promise<boolean> {
    const { count, error } = await this.supabase.from(TABLE).select('*', { count: 'exact', head: true }).eq('id', id);
    if (error) {
      if (isMissingRelationError(error)) return false;
      throw error;
    }
    return (count ?? 0) > 0;
  }

  async create(_input: CreateUserInput): Promise<User> {
    throw new Error('User creation via repository is not supported — use auth signup.');
  }

  async update(id: UserId, input: UpdateUserInput): Promise<User> {
    const row: Record<string, unknown> = { updated_at: now() };
    if (input.email !== undefined) row.email = input.email;
    if (input.status !== undefined) row.account_status = input.status;
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  }

  async softDelete(id: UserId): Promise<void> {
    await this.transitionStatus(id, 'deleted');
  }

  async delete(id: UserId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: UserId): Promise<User> {
    return this.transitionStatus(id, 'active');
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .ilike('email', email)
      .neq('account_status', 'deleted')
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapProfileRow(data as ProfileRow) : null;
  }

  async findByPhone(_phone: string): Promise<User | null> {
    return null;
  }

  async updateLastLogin(id: UserId, at: string): Promise<void> {
    const { error } = await this.supabase.from(TABLE).update({ last_active_at: at, updated_at: now() }).eq('id', id);
    if (error) throw error;
  }

  async transitionStatus(id: UserId, status: UserStatus): Promise<User> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) throw new NotFoundError('User', id);
    if (!canTransition(USER_LIFECYCLE, existing.status, status)) {
      throw new InvalidTransitionError(existing.status, status);
    }
    const row: Record<string, unknown> = { account_status: status, updated_at: now() };
    if (status === 'suspended') row.suspended_at = now();
    if (status === 'active') {
      row.suspended_at = null;
      row.suspension_reason = null;
    }
    const { data, error } = await this.supabase.from(TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  }
}
