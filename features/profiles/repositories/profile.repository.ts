import type { Repository } from '@/lib/domain/repository';
import type { ProfileId } from '@/lib/domain/ids';
import type { Profile, CreateProfileInput, UpdateProfileInput, ProfileFilter } from '@/features/profiles/types/profile.types';

export interface ProfileRepository
  extends Repository<Profile, ProfileId, CreateProfileInput, UpdateProfileInput, ProfileFilter> {
  findByUserId(userId: Profile['userId']): Promise<Profile | null>;
  findByUserIds(userIds: Profile['userId'][]): Promise<Profile[]>;
  findByUsername(username: string): Promise<Profile | null>;
  isUsernameTaken(username: string, excludeProfileId?: ProfileId): Promise<boolean>;
  updateCompletenessScore(id: ProfileId): Promise<Profile>;
  transitionStatus(id: ProfileId, status: Profile['status']): Promise<Profile>;
}
