import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserId } from '@/lib/domain/ids';
import { isMissingRelationError } from '@/lib/persistence/supabase-payload';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type {
  CreateUserSettingsInput,
  UpdateUserSettingsInput,
  UserSettings,
} from '@/features/account/types/user-settings.types';
import {
  createUserSettingsEntity,
  mapUserSettingsRow,
  toUserSettingsUpsert,
  type UserSettingsRow,
} from '@/features/account/repository/supabase/user-settings.mapper';

const TABLE = 'user_settings';

export class SupabaseUserSettingsRepository implements UserSettingsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserId(userId: UserId): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      if (isMissingRelationError(error)) return null;
      throw error;
    }
    return data ? mapUserSettingsRow(data as UserSettingsRow) : null;
  }

  async upsert(input: CreateUserSettingsInput): Promise<UserSettings> {
    const existing = await this.findByUserId(input.userId);
    const entity = existing
      ? {
          ...existing,
          emailNotifications: input.emailNotifications ?? existing.emailNotifications,
          smsNotifications: input.smsNotifications ?? existing.smsNotifications,
          favoriteNotifications: input.favoriteNotifications ?? existing.favoriteNotifications,
          systemNotifications: input.systemNotifications ?? existing.systemNotifications,
          profileVisibility: input.profileVisibility ?? existing.profileVisibility,
          updatedAt: new Date().toISOString(),
        }
      : createUserSettingsEntity(input);

    const { data, error } = await this.supabase
      .from(TABLE)
      .upsert(toUserSettingsUpsert(entity), { onConflict: 'user_id' })
      .select('*')
      .single();
    if (error) {
      if (isMissingRelationError(error)) return entity;
      throw error;
    }
    return mapUserSettingsRow(data as UserSettingsRow);
  }

  async update(userId: UserId, input: UpdateUserSettingsInput): Promise<UserSettings> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.emailNotifications !== undefined) patch.email_notifications = input.emailNotifications;
    if (input.smsNotifications !== undefined) patch.sms_notifications = input.smsNotifications;
    if (input.favoriteNotifications !== undefined) {
      patch.favorite_notifications = input.favoriteNotifications;
    }
    if (input.systemNotifications !== undefined) patch.system_notifications = input.systemNotifications;
    if (input.profileVisibility !== undefined) patch.profile_visibility = input.profileVisibility;

    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return mapUserSettingsRow(data as UserSettingsRow);
  }
}
