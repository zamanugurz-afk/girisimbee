import { ids } from '@/lib/domain/ids';
import { timestamps, softDeletable } from '@/lib/domain/factory';
import type { User, CreateUserInput } from '@/features/authentication/types/user.types';

export function createUser(overrides: Partial<User> & Pick<User, 'email' | 'passwordHash'>): User {
  const ts = timestamps(overrides.createdAt);
  return {
    id: overrides.id ?? ids.user(crypto.randomUUID()),
    email: overrides.email,
    emailVerified: overrides.emailVerified ?? false,
    phone: overrides.phone ?? null,
    phoneVerified: overrides.phoneVerified ?? false,
    passwordHash: overrides.passwordHash,
    role: overrides.role ?? 'user',
    status: overrides.status ?? 'pending',
    lastLoginAt: overrides.lastLoginAt ?? null,
    locale: overrides.locale ?? 'tr',
    timezone: overrides.timezone ?? 'Europe/Istanbul',
    ...ts,
    ...softDeletable(overrides.deletedAt ?? null),
  };
}

export function createUserInput(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
  return {
    email: overrides.email ?? `user-${Date.now()}@girisimbee.test`,
    passwordHash: overrides.passwordHash ?? '$2b$12$placeholder_hash_for_testing_purposes_only',
    phone: overrides.phone,
    locale: overrides.locale ?? 'tr',
    timezone: overrides.timezone ?? 'Europe/Istanbul',
  };
}
