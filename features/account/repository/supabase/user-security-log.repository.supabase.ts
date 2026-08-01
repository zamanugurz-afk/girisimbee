import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserId, UserSecurityLogId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { UserSecurityLogRepository } from '@/features/account/repositories/user-security-log.repository';
import type {
  CreateUserSecurityLogInput,
  UserSecurityLog,
} from '@/features/account/types/user-security-log.types';
import {
  createUserSecurityLogEntity,
  mapUserSecurityLogRow,
  toUserSecurityLogInsert,
  type UserSecurityLogRow,
} from '@/features/account/repository/supabase/user-security-log.mapper';

const TABLE = 'user_security_logs';

export class SupabaseUserSecurityLogRepository implements UserSecurityLogRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: CreateUserSecurityLogInput): Promise<UserSecurityLog> {
    const entity = createUserSecurityLogEntity(input);
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(toUserSecurityLogInsert(entity))
      .select('*')
      .single();
    if (error) {
      if (isMissingRelationError(error)) return entity;
      throw error;
    }
    return mapUserSecurityLogRow(data as UserSecurityLogRow);
  }

  async findById(id: UserSecurityLogId): Promise<UserSecurityLog | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapUserSecurityLogRow(data as UserSecurityLogRow) : null;
  }

  async listByUserId(userId: UserId, limit = 50): Promise<UserSecurityLog[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => mapUserSecurityLogRow(row as UserSecurityLogRow));
  }
}
