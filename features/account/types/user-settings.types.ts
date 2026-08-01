import type { UserSettingsId, UserId } from '@/lib/domain/ids';

export type ProfileVisibilitySetting = 'public' | 'connections' | 'private';

export interface UserSettings {
  id: UserSettingsId;
  userId: UserId;
  emailNotifications: boolean;
  smsNotifications: boolean;
  favoriteNotifications: boolean;
  systemNotifications: boolean;
  profileVisibility: ProfileVisibilitySetting;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserSettingsInput = {
  userId: UserId;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  favoriteNotifications?: boolean;
  systemNotifications?: boolean;
  profileVisibility?: ProfileVisibilitySetting;
};

export type UpdateUserSettingsInput = Partial<
  Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;
