import { ids } from '@/lib/domain/ids';
import type {
  CreateUserSettingsInput,
  ProfileVisibilitySetting,
  UserSettings,
} from '@/features/account/types/user-settings.types';

export interface UserSettingsRow {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  favorite_notifications: boolean;
  system_notifications: boolean;
  profile_visibility: string;
  created_at: string;
  updated_at: string;
}

function mapVisibility(value: string): ProfileVisibilitySetting {
  if (value === 'connections' || value === 'private' || value === 'public') return value;
  return 'public';
}

export function mapUserSettingsRow(row: UserSettingsRow): UserSettings {
  return {
    id: ids.userSettings(row.id),
    userId: ids.user(row.user_id),
    emailNotifications: row.email_notifications,
    smsNotifications: row.sms_notifications,
    favoriteNotifications: row.favorite_notifications,
    systemNotifications: row.system_notifications,
    profileVisibility: mapVisibility(row.profile_visibility),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createUserSettingsEntity(input: CreateUserSettingsInput): UserSettings {
  const now = new Date().toISOString();
  return {
    id: ids.userSettings(crypto.randomUUID()),
    userId: input.userId,
    emailNotifications: input.emailNotifications ?? true,
    smsNotifications: input.smsNotifications ?? false,
    favoriteNotifications: input.favoriteNotifications ?? true,
    systemNotifications: input.systemNotifications ?? true,
    profileVisibility: input.profileVisibility ?? 'public',
    createdAt: now,
    updatedAt: now,
  };
}

export function toUserSettingsUpsert(entity: UserSettings) {
  return {
    id: entity.id,
    user_id: entity.userId,
    email_notifications: entity.emailNotifications,
    sms_notifications: entity.smsNotifications,
    favorite_notifications: entity.favoriteNotifications,
    system_notifications: entity.systemNotifications,
    profile_visibility: entity.profileVisibility,
    created_at: entity.createdAt,
    updated_at: entity.updatedAt,
  };
}
