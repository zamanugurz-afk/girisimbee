import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserConsentId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { UserConsentRepository } from '@/features/account/repositories/user-consent.repository';
import type {
  CreateUserConsentInput,
  UserConsent,
} from '@/features/account/types/user-consent.types';
import {
  createUserConsentEntity,
  mapUserConsentRow,
  toUserConsentInsert,
  type UserConsentRow,
} from '@/features/account/repository/supabase/user-consent.mapper';

const TABLE = 'user_consents';

export class SupabaseUserConsentRepository implements UserConsentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: CreateUserConsentInput): Promise<UserConsent> {
    const entity = createUserConsentEntity(input);
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(toUserConsentInsert(entity))
      .select('*')
      .single();
    if (error) {
      if (isMissingRelationError(error)) return entity;
      throw error;
    }
    return mapUserConsentRow(data as UserConsentRow);
  }

  async findById(id: UserConsentId): Promise<UserConsent | null> {
    const { data, error } = await this.supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapUserConsentRow(data as UserConsentRow) : null;
  }

  async findLatestByUserId(userId: UserId): Promise<UserConsent | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapUserConsentRow(data as UserConsentRow) : null;
  }

  async listByUserId(userId: UserId): Promise<UserConsent[]> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (isMissingRelationError(error)) return [];
      throw error;
    }
    return (data ?? []).map((row) => mapUserConsentRow(row as UserConsentRow));
  }
}
