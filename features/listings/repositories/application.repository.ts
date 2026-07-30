import type { Repository } from '@/lib/domain/repository';
import type { ApplicationId } from '@/lib/domain/ids';
import type { Application, CreateApplicationInput, UpdateApplicationInput, ApplicationFilter } from '@/features/listings/types/application.types';

export interface ApplicationRepository
  extends Repository<Application, ApplicationId, CreateApplicationInput, UpdateApplicationInput, ApplicationFilter> {
  findByListingAndApplicant(listingId: Application['listingId'], applicantId: Application['applicantId']): Promise<Application | null>;
  countByListingId(listingId: Application['listingId']): Promise<number>;
  transitionStatus(id: ApplicationId, status: Application['status']): Promise<Application>;
}
