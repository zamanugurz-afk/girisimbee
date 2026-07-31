/**
 * Module profile repository — CRUD for ecosystem module-specific profile tables.
 * Covers: entrepreneur_profiles, investor_profiles, candidate_profiles,
 * employer_profiles, founder_profiles, franchise_profiles + onboarding tracker.
 */
import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileId, ProfileModuleId } from '@/lib/domain/ids';
import type {
  ProfileModule,
  CreateProfileModuleInput,
  UpdateProfileModuleInput,
} from '@/features/profiles/types/profile-module.types';
import type {
  EntrepreneurProfile,
  UpsertEntrepreneurProfileInput,
} from '@/features/profiles/types/entrepreneur-profile.types';
import type {
  InvestorProfile,
  UpsertInvestorProfileInput,
} from '@/features/profiles/types/investor-profile.types';
import type {
  CandidateProfile,
  UpsertCandidateProfileInput,
} from '@/features/profiles/types/candidate-profile.types';
import type {
  EmployerProfile,
  UpsertEmployerProfileInput,
} from '@/features/profiles/types/employer-profile.types';
import type {
  FounderProfile,
  UpsertFounderProfileInput,
} from '@/features/profiles/types/founder-profile.types';
import type {
  FranchiseProfile,
  UpsertFranchiseProfileInput,
} from '@/features/profiles/types/franchise-profile.types';

export interface ModuleProfileRepository {
  findProfileModule(
    profileId: ProfileId,
    moduleKey: ModuleKey,
  ): Promise<ProfileModule | null>;
  findProfileModules(profileId: ProfileId): Promise<ProfileModule[]>;
  createProfileModule(input: CreateProfileModuleInput): Promise<ProfileModule>;
  updateProfileModule(
    id: ProfileModuleId,
    input: UpdateProfileModuleInput,
  ): Promise<ProfileModule>;

  findEntrepreneurProfile(profileId: ProfileId): Promise<EntrepreneurProfile | null>;
  upsertEntrepreneurProfile(input: UpsertEntrepreneurProfileInput): Promise<EntrepreneurProfile>;
  deleteEntrepreneurProfile(profileId: ProfileId): Promise<void>;

  findInvestorProfile(profileId: ProfileId): Promise<InvestorProfile | null>;
  upsertInvestorProfile(input: UpsertInvestorProfileInput): Promise<InvestorProfile>;
  deleteInvestorProfile(profileId: ProfileId): Promise<void>;

  findCandidateProfile(profileId: ProfileId): Promise<CandidateProfile | null>;
  upsertCandidateProfile(input: UpsertCandidateProfileInput): Promise<CandidateProfile>;
  deleteCandidateProfile(profileId: ProfileId): Promise<void>;

  findEmployerProfile(profileId: ProfileId): Promise<EmployerProfile | null>;
  upsertEmployerProfile(input: UpsertEmployerProfileInput): Promise<EmployerProfile>;
  deleteEmployerProfile(profileId: ProfileId): Promise<void>;

  findFounderProfile(profileId: ProfileId): Promise<FounderProfile | null>;
  upsertFounderProfile(input: UpsertFounderProfileInput): Promise<FounderProfile>;
  deleteFounderProfile(profileId: ProfileId): Promise<void>;

  findFranchiseProfile(profileId: ProfileId): Promise<FranchiseProfile | null>;
  upsertFranchiseProfile(input: UpsertFranchiseProfileInput): Promise<FranchiseProfile>;
  deleteFranchiseProfile(profileId: ProfileId): Promise<void>;
}

/** P1 alias — ecosystem module profile persistence */
export type EcosystemProfileRepository = ModuleProfileRepository;
