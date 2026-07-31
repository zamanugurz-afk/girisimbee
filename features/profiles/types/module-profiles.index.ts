export type { ProfileModule, CreateProfileModuleInput, UpdateProfileModuleInput } from './profile-module.types';
export type { EntrepreneurProfile, UpsertEntrepreneurProfileInput } from './entrepreneur-profile.types';
export type { InvestorProfile, UpsertInvestorProfileInput } from './investor-profile.types';
export type { CandidateProfile, UpsertCandidateProfileInput } from './candidate-profile.types';
export type { EmployerProfile, UpsertEmployerProfileInput } from './employer-profile.types';
export type { FounderProfile, UpsertFounderProfileInput } from './founder-profile.types';
export type { FranchiseProfile, UpsertFranchiseProfileInput } from './franchise-profile.types';

import type { EntrepreneurProfile } from './entrepreneur-profile.types';
import type { InvestorProfile } from './investor-profile.types';
import type { CandidateProfile } from './candidate-profile.types';
import type { EmployerProfile } from './employer-profile.types';
import type { FounderProfile } from './founder-profile.types';
import type { FranchiseProfile } from './franchise-profile.types';
import type { ModuleKey } from '@/lib/domain/modules';

export type ModuleProfileMap = {
  entrepreneurs: EntrepreneurProfile;
  investors: InvestorProfile;
  candidates: CandidateProfile;
  employers: EmployerProfile;
  founders: FounderProfile;
  franchise: FranchiseProfile;
};

export type ModuleProfile<K extends ModuleKey = ModuleKey> = ModuleProfileMap[K];
