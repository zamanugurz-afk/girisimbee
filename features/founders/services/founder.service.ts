import type { ProfileId, UserId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MatchService } from '@/features/matching/services/match.service';
import type { UpsertFounderProfileInput } from '@/features/profiles/types/founder-profile.types';
import type { CreateListingInput, Listing } from '@/features/listings/types/listing.entity.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import { activateModule } from '@/features/shared/lib/module-activation';
import {
  ECOSYSTEM_CATEGORY_IDS,
  DEFAULT_LISTING_TYPE_IDS,
} from '@/features/shared/constants/ecosystem';
import { createListing } from '@/features/listings/factories/listing.factory';
import { slugify } from '@/lib/domain/factory';

export interface PublishFounderSearchInput {
  ownerId: UserId;
  profileId: ProfileId;
  listing: Omit<CreateListingInput, 'ownerId' | 'categoryId' | 'listingTypeId' | 'moduleKey'>;
}

export class FounderService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly matchService: MatchService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'founders');
  }

  upsertProfile(input: UpsertFounderProfileInput) {
    return this.moduleProfileRepo.upsertFounderProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findFounderProfile(profileId);
  }

  async publishSearch(input: PublishFounderSearchInput): Promise<Listing> {
    await this.activateProfile(input.profileId);
    await this.moduleProfileRepo.upsertFounderProfile({
      profileId: input.profileId,
      workflowStatus: 'published',
    });

    const slug = slugify(input.listing.title);
    return this.listingRepo.create({
      ...input.listing,
      ownerId: input.ownerId,
      categoryId: ECOSYSTEM_CATEGORY_IDS.founders,
      listingTypeId: DEFAULT_LISTING_TYPE_IDS.founders,
      moduleKey: 'founders',
      workflowStatus: 'published',
      status: 'published',
    });
  }

  findCoFounder(input: CreateMatchInput) {
    return this.matchService.create({
      moduleKey: 'founders',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
    });
  }

  async contactMatch(matchId: Parameters<MatchService['contact']>[0], profileId: ProfileId): Promise<ExternalContactInfo> {
    const result = await this.matchService.contact(matchId, profileId);
    return result.contact;
  }
}
