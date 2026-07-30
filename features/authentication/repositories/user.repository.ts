import type { Repository } from '@/lib/domain/repository';
import type { UserId } from '@/lib/domain/ids';
import type { User, CreateUserInput, UpdateUserInput, UserFilter } from '@/features/authentication/types/user.types';

export interface UserRepository
  extends Repository<User, UserId, CreateUserInput, UpdateUserInput, UserFilter> {
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  updateLastLogin(id: UserId, at: string): Promise<void>;
  transitionStatus(id: UserId, status: User['status']): Promise<User>;
}
