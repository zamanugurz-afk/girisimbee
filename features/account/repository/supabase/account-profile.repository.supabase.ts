import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountProfileId, UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { AccountProfileRepository } from '@/features/account/repositories/account-profile.repository';
import type {
  AccountProfile,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';
import {
  createAccountProfileEntity,
  mapAccountProfileRow,
  toAccountProfileUpsert,
  type AccountProfileRow,
} from '@/features/account/repository/supabase/account-profile.mapper';

const TABLE = 'profiles';

export class SupabaseAccountProfileRepository implements AccountProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async selectOne(column: 'id' | 'user_id' | 'username', value: string) {
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('PROFILE QUERY ID', value, { column });

    const { data: profile, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq(column, value)
      .single();

    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('PROFILE RESULT', profile);
    // eslint-disable-next-line no-console -- role/RLS debug
    console.log('PROFILE ERROR', error);

    if (profile) {
      const row = profile as Record<string, unknown>;
      // eslint-disable-next-line no-console -- role/RLS debug
      console.log('SESSION↔PROFILE ID CHECK (account repo)', {
        queryColumn: column,
        queryValue: value,
        profilesId: row.id,
        profilesUserId: row.user_id ?? null,
        role: row.role ?? null,
      });
      return mapAccountProfileRow(normalizeLegacyRow(row));
    }

    if (error) {
      if (isMissingRelationError(error)) return null;
      if (error.code === '42703' || /column/i.test(error.message)) return null;
      if (error.code === 'PGRST116' || /row-level security|permission denied|42501/i.test(error.message)) {
        // eslint-disable-next-line no-console -- role/RLS debug
        console.log(
          'PROFILE RLS OR ID MISMATCH (account repo): no visible profiles row',
          { column, value, code: error.code, message: error.message },
        );
        return null;
      }
      throw error;
    }
    return null;
  }

  findById(id: AccountProfileId) {
    return this.selectOne('id', id);
  }

  async findByUserId(userId: UserId): Promise<AccountProfile | null> {
    return (await this.selectOne('user_id', userId)) ?? this.selectOne('id', userId);
  }

  findByUsername(username: string) {
    return this.selectOne('username', username.toLowerCase());
  }

  async upsert(input: CreateAccountProfileInput): Promise<AccountProfile> {
    // Never upsert-overwrite role: a blind upsert with role:'user' would
    // downgrade admin / super_admin on every bootstrap conflict.
    const existing = await this.findByUserId(input.userId);
    if (existing) {
      return this.update(input.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email,
        phone: input.phone,
        emailVerified: input.emailVerified,
        phoneVerified: input.phoneVerified,
        status: input.status,
      });
    }

    const row = toAccountProfileUpsert(input);
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(row)
      .select('*')
      .single();
    if (error) {
      if (isMissingRelationError(error) || error.code === '42703') {
        return createAccountProfileEntity(input);
      }
      // Concurrent insert (trigger + bootstrap): load existing, do not overwrite role.
      if (error.code === '23505') {
        const raced = await this.findByUserId(input.userId);
        if (raced) return raced;
      }
      throw error;
    }
    return mapAccountProfileRow(normalizeLegacyRow(data as Record<string, unknown>));
  }

  async update(userId: UserId, input: UpdateAccountProfileInput): Promise<AccountProfile> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.firstName !== undefined) patch.first_name = input.firstName;
    if (input.lastName !== undefined) patch.last_name = input.lastName;
    if (input.username !== undefined) patch.username = input.username;
    if (input.email !== undefined) patch.email = input.email;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.role !== undefined) patch.role = input.role;
    if (input.status !== undefined) {
      patch.status = input.status;
      patch.account_status = input.status;
    }
    if (input.emailVerified !== undefined) {
      patch.email_verified = input.emailVerified;
      patch.is_email_verified = input.emailVerified;
    }
    if (input.phoneVerified !== undefined) {
      patch.phone_verified = input.phoneVerified;
      patch.is_phone_verified = input.phoneVerified;
    }
    if (input.lastLoginAt !== undefined) patch.last_login_at = input.lastLoginAt;

    let { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if ((!data && !error) || (error && error.code === 'PGRST116')) {
      ({ data, error } = await this.supabase
        .from(TABLE)
        .update(patch)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle());
    }

    if (error) {
      if (isMissingRelationError(error) || error.code === '42703') {
        throw new Error('Profil tablosu henüz hazır değil. Migration uygulanmalı.');
      }
      throw error;
    }
    if (!data) {
      throw new Error('Profil kaydı bulunamadı.');
    }
    return mapAccountProfileRow(normalizeLegacyRow(data as Record<string, unknown>));
  }

  async touchLastLogin(userId: UserId): Promise<void> {
    const now = new Date().toISOString();
    await this.supabase.from(TABLE).update({ last_login_at: now, updated_at: now }).eq('id', userId);
  }
}

function normalizeLegacyRow(data: Record<string, unknown>): AccountProfileRow {
  return {
    id: String(data.id),
    user_id: (data.user_id as string | null) ?? String(data.id),
    first_name: (data.first_name as string | null) ?? null,
    last_name: (data.last_name as string | null) ?? null,
    username: (data.username as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    role: String(data.role ?? 'user'),
    status: (data.status as string | null) ?? null,
    account_status: (data.account_status as string | null) ?? null,
    email_verified: Boolean(data.email_verified ?? data.is_email_verified),
    phone_verified: Boolean(data.phone_verified ?? data.is_phone_verified),
    is_email_verified: Boolean(data.is_email_verified ?? data.email_verified),
    is_phone_verified: Boolean(data.is_phone_verified ?? data.phone_verified),
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
    last_login_at: (data.last_login_at as string | null) ?? null,
  };
}
