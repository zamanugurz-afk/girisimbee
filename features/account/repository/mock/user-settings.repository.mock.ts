import type { UserId } from '@/lib/domain/ids';
import type { UserSettingsRepository } from '@/features/account/repositories/user-settings.repository';
import type {
  CreateUserSettingsInput,
  UpdateUserSettingsInput,
  UserSettings,
} from '@/features/account/types/user-settings.types';
import { createUserSettingsEntity } from '@/features/account/repository/supabase/user-settings.mapper';

export class MockUserSettingsRepository implements UserSettingsRepository {
  private rows = new Map<string, UserSettings>();

  async findByUserId(userId: UserId) {
    return this.rows.get(userId) ?? null;
  }

  async upsert(input: CreateUserSettingsInput) {
    const existing = await this.findByUserId(input.userId);
    const next = existing
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
    this.rows.set(input.userId, next);
    return next;
  }

  async update(userId: UserId, input: UpdateUserSettingsInput) {
    const existing = await this.findByUserId(userId);
    if (!existing) throw new Error('User settings not found');
    const next = { ...existing, ...input, updatedAt: new Date().toISOString() };
    this.rows.set(userId, next);
    return next;
  }
}
