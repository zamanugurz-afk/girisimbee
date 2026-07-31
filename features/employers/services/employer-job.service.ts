import type { ProfileId, UserId, ListingId, PaymentId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import type { UpsertEmployerProfileInput } from '@/features/profiles/types/employer-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import type { ApplicationId } from '@/lib/domain/ids';
import type { AnonymousApplicationView, UnlockedApplicationView } from '@/features/matching/services/anonymization.service';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import { createListing } from '@/features/listings/factories/listing.factory';
import { slugify } from '@/lib/domain/factory';

export interface PublishJobInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: Omit<CreateListingInput, 'ownerId' | 'categoryId' | 'listingTypeId' | 'moduleKey'>;
}

export class EmployerJobService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly applicationService: ApplicationService,
    private readonly paymentService: MarketplacePaymentService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'employers');
  }

  upsertProfile(input: UpsertEmployerProfileInput) {
    return this.moduleProfileRepo.upsertEmployerProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findEmployerProfile(profileId);
  }

  async publishJob(input: PublishJobInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    await this.moduleProfileRepo.upsertEmployerProfile({
      profileId: input.profileId,
      workflowStatus: 'published',
    });

    const slug = slugify(input.listing.title);
    const entity = createListing({
      ...input.listing,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.employers,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.employers,
      moduleKey: 'employers',
      anonymousMode: true,
      slug,
      workflowStatus: 'published',
      status: 'published',
    });

    return this.listingRepo.create({
      ownerId: entity.ownerId,
      categoryId: entity.categoryId,
      listingTypeId: entity.listingTypeId,
      moduleKey: entity.moduleKey,
      title: entity.title,
      shortDescription: entity.shortDescription,
      longDescription: entity.longDescription,
      city: entity.city,
      district: entity.district,
      industry: entity.industry,
      anonymousMode: true,
      contactPhone: entity.contactPhone,
      contactWhatsapp: entity.contactWhatsapp,
      contactEmail: entity.contactEmail,
      contactWebsite: entity.contactWebsite,
      workflowStatus: 'published',
      status: 'published',
    });
  }

  async listAnonymousApplications(
    listingId: ListingId,
    managerProfileId: ProfileId,
  ): Promise<AnonymousApplicationView[]> {
    const apps = await this.applicationService.listForListing(listingId);
    return Promise.all(
      apps.map((a) => this.applicationService.getAnonymousView(a.id, managerProfileId)),
    );
  }

  reviewApplication(applicationId: ApplicationId, managerProfileId: ProfileId): Promise<AnonymousApplicationView> {
    return this.applicationService.getAnonymousView(applicationId, managerProfileId);
  }

  async purchaseUnlock(input: {
    userId: UserId;
    applicationId: ApplicationId;
    managerProfileId: ProfileId;
    amountCents: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.paymentService.createUnlockCheckout({
      userId: input.userId,
      applicationId: input.applicationId,
      amountCents: input.amountCents,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
  }

  async unlockApplication(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
    paymentId: PaymentId,
  ): Promise<UnlockedApplicationView> {
    await this.applicationService.unlock(applicationId, managerProfileId, paymentId);
    return this.applicationService.getUnlockedView(applicationId, managerProfileId);
  }

  async contactCandidate(
    applicationId: ApplicationId,
    managerProfileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    const result = await this.applicationService.contact(applicationId, managerProfileId);
    return result.contact;
  }
}
