import type { ModuleKey } from '@/lib/domain/modules';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { AdminProfileFilter, AdminProfileView } from '@/features/admin/types/admin.types';

export class AdminProfilesService {
  constructor(
    private profileRepo: ProfileRepository,
    private moduleProfileRepo: ModuleProfileRepository,
  ) {}

  async searchProfiles(
    filter: AdminProfileFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<AdminProfileView>> {
    const profileFilter = {
      query: filter.query,
      status: filter.status,
    };
    const result = await this.profileRepo.search(profileFilter, pagination);
    const data: AdminProfileView[] = [];

    for (const profile of result.data) {
      const modules = await this.moduleProfileRepo.findProfileModules(profile.id);
      if (filter.moduleKey && !modules.some((m) => m.moduleKey === filter.moduleKey)) {
        continue;
      }
      data.push({ profile, modules });
    }

    return {
      ...result,
      data,
      total: filter.moduleKey ? data.length : result.total,
    };
  }

  async getProfileByModule(moduleKey: ModuleKey, pagination?: PaginationParams) {
    return this.searchProfiles({ moduleKey }, pagination);
  }
}
