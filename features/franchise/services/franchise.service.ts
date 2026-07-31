import { ValidationError, ForbiddenError } from '@/lib/domain/errors';
import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { FranchiseSubcategorySlug } from '@/lib/domain/modules';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ApplicationService } from '@/features/matching/services/application.service';
import type { UpsertFranchiseProfileInput } from '@/features/profiles/types/franchise-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  ECOSYSTEM_CATEGORY_IDS,
  FRANCHISE_SUBCATEGORY_IDS,
  FRANCHISE_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import { slugify } from '@/lib/domain/factory';

export type FranchiseFlow = 'buy' | 'give';

const FLOW_TO_SUBCATEGORY: Record<FranchiseFlow, FranchiseSubcategorySlug> = {
  buy: 'franchise-buy',
  give: 'franchise-give',
};

export interface PublishFranchiseListingInput {
  ownerId: UserId;
  profileId: ProfileId;
  flow: FranchiseFlow;
  listing: Omit<CreateListingInput, 'ownerId' | 'categoryId' | 'listingTypeId' | 'moduleKey' | 'subcategoryId'>;
}

export class FranchiseService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly applicationService: ApplicationService,
  ) {}

  async activateProfile(profileId: ProfileId, flow: FranchiseFlow) {
    await activateModule(this.moduleProfileRepo, profileId, 'franchise');
    return this.moduleProfileRepo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: FLOW_TO_SUBCATEGORY[flow],
    });
  }

  upsertProfile(input: UpsertFranchiseProfileInput) {
    return this.moduleProfileRepo.upsertFranchiseProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findFranchiseProfile(profileId);
  }

  /** Bayilik Al — browse franchise-give listings */
  browseBuyOpportunities(filter: { city?: string; sector?: string } = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'franchise',
      subcategoryId: FRANCHISE_SUBCATEGORY_IDS['franchise-give'],
      city: filter.city,
      industry: filter.sector,
    });
  }

  /** Bayilik Ver — browse franchise-buy seekers */
  browseGiveSeekers(filter: { city?: string } = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'franchise',
      subcategoryId: FRANCHISE_SUBCATEGORY_IDS['franchise-buy'],
      city: filter.city,
    });
  }

  async publishListing(input: PublishFranchiseListingInput): Promise<Listing> {
    await this.activateProfile(input.profileId, input.flow);
    const subcategorySlug = FLOW_TO_SUBCATEGORY[input.flow];
    const subcategoryId = FRANCHISE_SUBCATEGORY_IDS[subcategorySlug];
    const listingTypeId = input.flow === 'buy' ? FRANCHISE_LISTING_TYPE_IDS.buy : FRANCHISE_LISTING_TYPE_IDS.give;

    await this.moduleProfileRepo.upsertFranchiseProfile({
      profileId: input.profileId,
      subcategorySlug,
      workflowStatus: 'published',
    });

    return this.listingRepo.create({
      ...input.listing,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.franchise,
      listingTypeId,
      subcategoryId,
      moduleKey: 'franchise',
      workflowStatus: 'published',
      status: 'published',
    });
  }

  /** Apply to opposite flow listing (buy→give listing, give→buy listing) */
  async submitApplication(
    applicantProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string,
  ) {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing || listing.moduleKey !== 'franchise') {
      throw new ValidationError('Geçersiz franchise ilanı.', { listingId: ['Franchise ilanı bulunamadı.'] });
    }
    return this.applicationService.submit({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId,
      coverMessage: coverMessage ?? null,
    });
  }

  async contactAfterApplication(
    applicationId: Parameters<ApplicationService['contact']>[0],
    actorProfileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    const result = await this.applicationService.contact(applicationId, actorProfileId);
    return result.contact;
  }

  assertFlowProfile(profileId: ProfileId, expected: FranchiseFlow) {
    return this.getProfile(profileId).then((profile) => {
      if (!profile || profile.subcategorySlug !== FLOW_TO_SUBCATEGORY[expected]) {
        throw new ForbiddenError(`Profil ${expected} akışı için yapılandırılmamış.`);
      }
      return profile;
    });
  }
}
