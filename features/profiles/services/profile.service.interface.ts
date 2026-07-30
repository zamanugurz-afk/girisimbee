import type { ProfileId, UserId } from '@/lib/domain/ids';
import type { Profile, CreateProfileInput, UpdateProfileInput, ProfileFilter } from '@/features/profiles/types/profile.types';
import type { PublicProfileView } from '@/features/profiles/types/profile-public.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface IProfileService {
  create(input: CreateProfileInput): Promise<Profile>;
  getById(id: ProfileId): Promise<Profile | null>;
  getByUserId(userId: UserId): Promise<Profile | null>;
  getByUsername(username: string): Promise<Profile | null>;
  isUsernameAvailable(username: string, excludeProfileId?: ProfileId): Promise<boolean>;
  ensureProfile(userId: UserId, displayName: string, email?: string): Promise<Profile>;
  update(id: ProfileId, input: UpdateProfileInput): Promise<Profile>;
  publish(id: ProfileId): Promise<Profile>;
  hide(id: ProfileId): Promise<Profile>;
  search(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>>;
  delete(id: ProfileId): Promise<void>;
  getPublicProfile(username: string, viewerId?: UserId): Promise<PublicProfileView | null>;
}
