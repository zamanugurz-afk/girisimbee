/**
 * Backward-compatible facade — delegates to EmployerService + EmployerApplicationService.
 * @deprecated Prefer ctx.container.ecosystem.employerService / employerApplicationService
 */
import type { ProfileId, UserId, ListingId, PaymentId, ApplicationId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { UpsertEmployerProfileInput } from '@/features/profiles/types/employer-profile.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { AnonymousApplicationView, UnlockedApplicationView } from '@/features/matching/services/anonymization.service';
import type { EmployerService, PublishJobListingInput } from '@/features/employers/services/employer.service';
import type { EmployerApplicationService } from '@/features/employers/services/employer-application.service';

export type PublishJobInput = PublishJobListingInput;

export class EmployerJobService {
  constructor(
    private readonly employerService: EmployerService,
    private readonly employerApplicationService: EmployerApplicationService,
  ) {}

  activateProfile(profileId: ProfileId) {
    return this.employerService.activateProfile(profileId);
  }

  upsertProfile(input: UpsertEmployerProfileInput) {
    return this.employerService.upsertProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.employerService.getProfile(profileId);
  }

  publishJob(input: PublishJobListingInput): Promise<Listing> {
    return this.employerService.publishJobListing(input);
  }

  listAnonymousApplications(
    listingId: ListingId,
    managerProfileId: ProfileId,
  ): Promise<AnonymousApplicationView[]> {
    return this.employerApplicationService.listAnonymousApplications(listingId, managerProfileId);
  }

  reviewApplication(applicationId: ApplicationId, managerProfileId: ProfileId): Promise<AnonymousApplicationView> {
    return this.employerApplicationService.reviewApplication(applicationId, managerProfileId);
  }

  purchaseUnlock(input: {
    userId: UserId;
    applicationId: ApplicationId;
    managerProfileId: ProfileId;
    /** Deprecated client hint — server uses CANDIDATE_UNLOCK_PRICE_CENTS. */
    amountCents?: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.employerApplicationService.purchaseUnlock(input);
  }

  unlockApplication(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    paymentId: PaymentId,
  ): Promise<UnlockedApplicationView> {
    return this.employerApplicationService.unlockApplication(applicationId, managerProfileId, paymentId);
  }

  contactCandidate(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    return this.employerApplicationService.contactCandidate(applicationId, managerProfileId).then((r) => r.contact);
  }
}
