import { now } from '@/lib/domain/factory';
import { NotFoundError } from '@/lib/domain/errors';
import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileId, ProfileModuleId } from '@/lib/domain/ids';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
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
import {
  createProfileModule,
  createEntrepreneurProfile,
  createInvestorProfile,
  createCandidateProfile,
  createEmployerProfile,
  createFounderProfile,
  createFranchiseProfile,
} from '@/features/profiles/factories/module-profile.factory';

export class MockModuleProfileRepository implements ModuleProfileRepository {
  private profileModules = new Map<ProfileModuleId, ProfileModule>();
  private entrepreneurs = new Map<ProfileId, EntrepreneurProfile>();
  private investors = new Map<ProfileId, InvestorProfile>();
  private candidates = new Map<ProfileId, CandidateProfile>();
  private employers = new Map<ProfileId, EmployerProfile>();
  private founders = new Map<ProfileId, FounderProfile>();
  private franchises = new Map<ProfileId, FranchiseProfile>();

  async findProfileModule(profileId: ProfileId, moduleKey: ModuleKey): Promise<ProfileModule | null> {
    return [...this.profileModules.values()].find(
      (m) => m.profileId === profileId && m.moduleKey === moduleKey,
    ) ?? null;
  }

  async findProfileModules(profileId: ProfileId): Promise<ProfileModule[]> {
    return [...this.profileModules.values()].filter((m) => m.profileId === profileId);
  }

  async createProfileModule(input: CreateProfileModuleInput): Promise<ProfileModule> {
    const entity = createProfileModule(input);
    this.profileModules.set(entity.id, entity);
    return entity;
  }

  async updateProfileModule(id: ProfileModuleId, input: UpdateProfileModuleInput): Promise<ProfileModule> {
    const existing = this.profileModules.get(id);
    if (!existing) throw new NotFoundError('ProfileModule', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.profileModules.set(id, updated);
    return updated;
  }

  async findEntrepreneurProfile(profileId: ProfileId): Promise<EntrepreneurProfile | null> {
    return this.entrepreneurs.get(profileId) ?? null;
  }

  async upsertEntrepreneurProfile(input: UpsertEntrepreneurProfileInput): Promise<EntrepreneurProfile> {
    const existing = this.entrepreneurs.get(input.profileId);
    const entity = createEntrepreneurProfile({ ...existing, ...input, updatedAt: now() });
    this.entrepreneurs.set(input.profileId, entity);
    return entity;
  }

  async deleteEntrepreneurProfile(profileId: ProfileId): Promise<void> {
    this.entrepreneurs.delete(profileId);
  }

  async findInvestorProfile(profileId: ProfileId): Promise<InvestorProfile | null> {
    return this.investors.get(profileId) ?? null;
  }

  async upsertInvestorProfile(input: UpsertInvestorProfileInput): Promise<InvestorProfile> {
    const existing = this.investors.get(input.profileId);
    const entity = createInvestorProfile({ ...existing, ...input, updatedAt: now() });
    this.investors.set(input.profileId, entity);
    return entity;
  }

  async deleteInvestorProfile(profileId: ProfileId): Promise<void> {
    this.investors.delete(profileId);
  }

  async findCandidateProfile(profileId: ProfileId): Promise<CandidateProfile | null> {
    return this.candidates.get(profileId) ?? null;
  }

  async upsertCandidateProfile(input: UpsertCandidateProfileInput): Promise<CandidateProfile> {
    const existing = this.candidates.get(input.profileId);
    const entity = createCandidateProfile({ ...existing, ...input, updatedAt: now() });
    this.candidates.set(input.profileId, entity);
    return entity;
  }

  async deleteCandidateProfile(profileId: ProfileId): Promise<void> {
    this.candidates.delete(profileId);
  }

  async findEmployerProfile(profileId: ProfileId): Promise<EmployerProfile | null> {
    return this.employers.get(profileId) ?? null;
  }

  async upsertEmployerProfile(input: UpsertEmployerProfileInput): Promise<EmployerProfile> {
    const existing = this.employers.get(input.profileId);
    const entity = createEmployerProfile({ ...existing, ...input, updatedAt: now() });
    this.employers.set(input.profileId, entity);
    return entity;
  }

  async deleteEmployerProfile(profileId: ProfileId): Promise<void> {
    this.employers.delete(profileId);
  }

  async findFounderProfile(profileId: ProfileId): Promise<FounderProfile | null> {
    return this.founders.get(profileId) ?? null;
  }

  async upsertFounderProfile(input: UpsertFounderProfileInput): Promise<FounderProfile> {
    const existing = this.founders.get(input.profileId);
    const entity = createFounderProfile({ ...existing, ...input, updatedAt: now() });
    this.founders.set(input.profileId, entity);
    return entity;
  }

  async deleteFounderProfile(profileId: ProfileId): Promise<void> {
    this.founders.delete(profileId);
  }

  async findFranchiseProfile(profileId: ProfileId): Promise<FranchiseProfile | null> {
    return this.franchises.get(profileId) ?? null;
  }

  async upsertFranchiseProfile(input: UpsertFranchiseProfileInput): Promise<FranchiseProfile> {
    const existing = this.franchises.get(input.profileId);
    const entity = createFranchiseProfile({ ...existing, ...input, updatedAt: now() });
    this.franchises.set(input.profileId, entity);
    return entity;
  }

  async deleteFranchiseProfile(profileId: ProfileId): Promise<void> {
    this.franchises.delete(profileId);
  }
}
