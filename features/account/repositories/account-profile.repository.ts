import type { AccountProfileId, UserId } from '@/lib/domain/ids';
import type {
  AccountProfile,
  CreateAccountProfileInput,
  UpdateAccountProfileInput,
} from '@/features/account/types/account-profile.types';

export interface AccountProfileRepository {
  findById(id: AccountProfileId): Promise<AccountProfile | null>;
  findByUserId(userId: UserId): Promise<AccountProfile | null>;
  findByUsername(username: string): Promise<AccountProfile | null>;
  upsert(input: CreateAccountProfileInput): Promise<AccountProfile>;
  update(userId: UserId, input: UpdateAccountProfileInput): Promise<AccountProfile>;
  touchLastLogin(userId: UserId): Promise<void>;
}
