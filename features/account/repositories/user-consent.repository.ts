import type { UserConsentId, UserId } from '@/lib/domain/ids';
import type {
  CreateUserConsentInput,
  UserConsent,
} from '@/features/account/types/user-consent.types';

export interface UserConsentRepository {
  create(input: CreateUserConsentInput): Promise<UserConsent>;
  findById(id: UserConsentId): Promise<UserConsent | null>;
  findLatestByUserId(userId: UserId): Promise<UserConsent | null>;
  listByUserId(userId: UserId): Promise<UserConsent[]>;
}
