import type { UserId } from '@/lib/domain/ids';
import type {
  CreateUserSettingsInput,
  UpdateUserSettingsInput,
  UserSettings,
} from '@/features/account/types/user-settings.types';

export interface UserSettingsRepository {
  findByUserId(userId: UserId): Promise<UserSettings | null>;
  upsert(input: CreateUserSettingsInput): Promise<UserSettings>;
  update(userId: UserId, input: UpdateUserSettingsInput): Promise<UserSettings>;
}
