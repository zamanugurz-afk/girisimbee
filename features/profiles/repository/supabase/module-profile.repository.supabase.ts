import type { SupabaseClient } from '@supabase/supabase-js';
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
  mapProfileModuleRow,
  toProfileModuleRow,
  mapEntrepreneurProfileRow,
  toEntrepreneurProfileRow,
  mapInvestorProfileRow,
  toInvestorProfileRow,
  mapCandidateProfileRow,
  toCandidateProfileRow,
  mapEmployerProfileRow,
  toEmployerProfileRow,
  mapFounderProfileRow,
  toFounderProfileRow,
  mapFranchiseProfileRow,
  toFranchiseProfileRow,
  type ProfileModuleRow,
  type EntrepreneurProfileRow,
  type InvestorProfileRow,
  type CandidateProfileRow,
  type EmployerProfileRow,
  type FounderProfileRow,
  type FranchiseProfileRow,
} from '@/features/profiles/repository/supabase/module-profile.mapper';
import { createProfileModule } from '@/features/profiles/factories/module-profile.factory';
import { ids } from '@/lib/domain/ids';

const MODULE_TABLE = 'marketplace_profile_modules';

export class SupabaseModuleProfileRepository implements ModuleProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findProfileModule(profileId: ProfileId, moduleKey: ModuleKey): Promise<ProfileModule | null> {
    const { data, error } = await this.supabase
      .from(MODULE_TABLE)
      .select('*')
      .eq('profile_id', profileId)
      .eq('module_key', moduleKey)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfileModuleRow(data as ProfileModuleRow) : null;
  }

  async findProfileModules(profileId: ProfileId): Promise<ProfileModule[]> {
    const { data, error } = await this.supabase
      .from(MODULE_TABLE)
      .select('*')
      .eq('profile_id', profileId);
    if (error) throw error;
    return (data ?? []).map((row) => mapProfileModuleRow(row as ProfileModuleRow));
  }

  async createProfileModule(input: CreateProfileModuleInput): Promise<ProfileModule> {
    const entity = createProfileModule({ ...input, id: ids.profileModule(crypto.randomUUID()) });
    const row = { id: entity.id, ...toProfileModuleRow(entity) };
    const { data, error } = await this.supabase.from(MODULE_TABLE).insert(row).select('*').single();
    if (error) throw error;
    return mapProfileModuleRow(data as ProfileModuleRow);
  }

  async updateProfileModule(id: ProfileModuleId, input: UpdateProfileModuleInput): Promise<ProfileModule> {
    const row = { ...toProfileModuleRow(input), updated_at: now() };
    const { data, error } = await this.supabase.from(MODULE_TABLE).update(row).eq('id', id).select('*').single();
    if (error) throw error;
    if (!data) throw new NotFoundError('ProfileModule', id);
    return mapProfileModuleRow(data as ProfileModuleRow);
  }

  private async upsertProfile<T extends { profileId: ProfileId }>(
    table: string,
    input: Partial<T> & { profileId: ProfileId },
    toRow: (input: Partial<T>) => Record<string, unknown>,
    mapRow: (row: Record<string, unknown>) => T,
  ): Promise<T> {
    const row = { ...toRow(input), updated_at: now() };
    const { data, error } = await this.supabase
      .from(table)
      .upsert(row, { onConflict: 'profile_id' })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  async findEntrepreneurProfile(profileId: ProfileId): Promise<EntrepreneurProfile | null> {
    const { data, error } = await this.supabase
      .from('entrepreneur_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEntrepreneurProfileRow(data as EntrepreneurProfileRow) : null;
  }

  async upsertEntrepreneurProfile(input: UpsertEntrepreneurProfileInput): Promise<EntrepreneurProfile> {
    return this.upsertProfile(
      'entrepreneur_profiles',
      input,
      toEntrepreneurProfileRow,
      (row) => mapEntrepreneurProfileRow(row as unknown as EntrepreneurProfileRow),
    );
  }

  async deleteEntrepreneurProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('entrepreneur_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }

  async findInvestorProfile(profileId: ProfileId): Promise<InvestorProfile | null> {
    const { data, error } = await this.supabase
      .from('investor_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapInvestorProfileRow(data as InvestorProfileRow) : null;
  }

  async upsertInvestorProfile(input: UpsertInvestorProfileInput): Promise<InvestorProfile> {
    return this.upsertProfile(
      'investor_profiles',
      input,
      toInvestorProfileRow,
      (row) => mapInvestorProfileRow(row as unknown as InvestorProfileRow),
    );
  }

  async deleteInvestorProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('investor_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }

  async findCandidateProfile(profileId: ProfileId): Promise<CandidateProfile | null> {
    const { data, error } = await this.supabase
      .from('candidate_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCandidateProfileRow(data as CandidateProfileRow) : null;
  }

  async upsertCandidateProfile(input: UpsertCandidateProfileInput): Promise<CandidateProfile> {
    return this.upsertProfile(
      'candidate_profiles',
      input,
      toCandidateProfileRow,
      (row) => mapCandidateProfileRow(row as unknown as CandidateProfileRow),
    );
  }

  async deleteCandidateProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('candidate_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }

  async findEmployerProfile(profileId: ProfileId): Promise<EmployerProfile | null> {
    const { data, error } = await this.supabase
      .from('employer_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEmployerProfileRow(data as EmployerProfileRow) : null;
  }

  async upsertEmployerProfile(input: UpsertEmployerProfileInput): Promise<EmployerProfile> {
    return this.upsertProfile(
      'employer_profiles',
      input,
      toEmployerProfileRow,
      (row) => mapEmployerProfileRow(row as unknown as EmployerProfileRow),
    );
  }

  async deleteEmployerProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('employer_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }

  async findFounderProfile(profileId: ProfileId): Promise<FounderProfile | null> {
    const { data, error } = await this.supabase
      .from('founder_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapFounderProfileRow(data as FounderProfileRow) : null;
  }

  async upsertFounderProfile(input: UpsertFounderProfileInput): Promise<FounderProfile> {
    return this.upsertProfile(
      'founder_profiles',
      input,
      toFounderProfileRow,
      (row) => mapFounderProfileRow(row as unknown as FounderProfileRow),
    );
  }

  async deleteFounderProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('founder_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }

  async findFranchiseProfile(profileId: ProfileId): Promise<FranchiseProfile | null> {
    const { data, error } = await this.supabase
      .from('franchise_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapFranchiseProfileRow(data as FranchiseProfileRow) : null;
  }

  async upsertFranchiseProfile(input: UpsertFranchiseProfileInput): Promise<FranchiseProfile> {
    return this.upsertProfile(
      'franchise_profiles',
      input,
      toFranchiseProfileRow,
      (row) => mapFranchiseProfileRow(row as unknown as FranchiseProfileRow),
    );
  }

  async deleteFranchiseProfile(profileId: ProfileId): Promise<void> {
    const { error } = await this.supabase.from('franchise_profiles').delete().eq('profile_id', profileId);
    if (error) throw error;
  }
}
