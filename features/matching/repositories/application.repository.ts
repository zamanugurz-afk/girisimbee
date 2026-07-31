import type { Repository } from '@/lib/domain/repository';
import type { ApplicationId } from '@/lib/domain/ids';
import type {
  MarketplaceApplication,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationFilter,
} from '@/features/matching/types/application.types';

export interface ApplicationRepository
  extends Repository<
    MarketplaceApplication,
    ApplicationId,
    CreateApplicationInput,
    UpdateApplicationInput,
    ApplicationFilter
  > {
  findForListing(listingId: MarketplaceApplication['listingId']): Promise<MarketplaceApplication[]>;
  findForApplicant(
    applicantProfileId: MarketplaceApplication['applicantProfileId'],
  ): Promise<MarketplaceApplication[]>;
  transitionStatus(
    id: ApplicationId,
    status: MarketplaceApplication['status'],
  ): Promise<MarketplaceApplication>;
}
