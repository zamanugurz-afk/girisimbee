import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter } from '@/lib/domain/mock-utils';
import { createUser } from '@/features/authentication/factories/user.factory';
import { createVerification } from '@/features/authentication/factories/verification.factory';
import type { User } from '@/features/authentication/types/user.types';
import type { Verification } from '@/features/authentication/types/verification.types';

export function generateMockUser(index = 1, overrides: Partial<User> = {}): User {
  const id = ids.user(mockUuid('a0000001'));
  return createUser({
    id,
    email: `user${index}@girisimbee.test`,
    passwordHash: '$2b$12$mock_hash_for_testing_only_xxxxxxxxxxxxxxxxxxxx',
    emailVerified: index % 3 !== 0,
    phone: index % 2 === 0 ? `+905551234${String(index).padStart(3, '0')}` : null,
    phoneVerified: index % 4 === 0,
    role: index === 1 ? 'admin' : 'user',
    status: index % 5 === 0 ? 'suspended' : 'active',
    lastLoginAt: new Date(Date.now() - index * 86400000).toISOString(),
    ...overrides,
  });
}

export function generateMockUsers(count: number): User[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockUser(i + 1));
}

export function generateMockVerification(index = 1, userId?: User['id']): Verification {
  const types = ['email', 'phone', 'identity', 'company', 'investor_accreditation'] as const;
  return createVerification({
    id: ids.verification(mockUuid('a0000002')),
    userId: userId ?? ids.user(mockUuid('a0000001')),
    type: types[index % types.length],
    status: index % 3 === 0 ? 'approved' : 'pending',
  });
}

export function generateMockVerifications(count: number, userId?: User['id']): Verification[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockVerification(i + 1, userId));
}
