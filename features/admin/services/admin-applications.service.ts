import { NotFoundError } from '@/lib/domain/errors';
import type { ApplicationId } from '@/lib/domain/ids';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { MarketplaceApplication } from '@/features/matching/types/application.types';
import type { AdminApplicationFilter } from '@/features/admin/types/admin.types';

export class AdminApplicationsService {
  constructor(private applicationRepo: ApplicationRepository) {}

  listApplications(
    filter: AdminApplicationFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplaceApplication>> {
    return this.applicationRepo.search(
      {
        moduleKey: filter.moduleKey,
        status: filter.status,
        includeDeleted: filter.includeDeleted,
      },
      pagination,
    );
  }

  async reviewApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const app = await this.applicationRepo.findById(id);
    if (!app) throw new NotFoundError('Application', id);
    return this.applicationRepo.transitionStatus(id, 'reviewing');
  }

  async archiveApplication(id: ApplicationId): Promise<void> {
    const app = await this.applicationRepo.findById(id, { includeDeleted: true });
    if (!app) throw new NotFoundError('Application', id);
    await this.applicationRepo.softDelete(id);
  }

  async restoreApplication(id: ApplicationId): Promise<MarketplaceApplication> {
    const app = await this.applicationRepo.findById(id, { includeDeleted: true });
    if (!app) throw new NotFoundError('Application', id);
    return this.applicationRepo.restore(id);
  }
}
