// Feature: profiles — domain layer
export type {
  Profile,
  ProfileVisibility,
  ProfileStatus,
  ProfileIntent,
  CreateProfileInput,
  UpdateProfileInput,
  ProfileFilter,
} from '@/features/profiles/types/profile.types';
export { PROFILE_INDEXES, PROFILE_LIFECYCLE, PROFILE_VALIDATION } from '@/features/profiles/types/profile.types';

export type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
export type { IProfileService } from '@/features/profiles/services/profile.service.interface';
export { ProfileService } from '@/features/profiles/services/profile.service';
export { getProfileService } from '@/lib/persistence/container';
export * from '@/features/profiles/repository';

export {
  profileSchema,
  createProfileSchema,
  updateProfileSchema,
} from '@/features/profiles/validation/profile.schema';

export { createProfile, createProfileInput } from '@/features/profiles/factories/profile.factory';
export { generateMockProfile, generateMockProfiles } from '@/features/profiles/mock/profile.generator';
export { ProfileSettingsForm } from '@/features/profiles/components/profile-settings-form';
