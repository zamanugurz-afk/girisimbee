import type { ProfileId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { MatchService } from '@/features/matching/services/match.service';
import type { UpsertInvestorProfileInput } from '@/features/profiles/types/investor-profile.types';
import type { CreateMatchInput } from '@/features/matching/types/match.types';
import { activateModule } from '@/features/shared/lib/module-activation';

export class InvestorListingService {
  constructor(
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly listingRepo: ListingRepository,
    private readonly matchService: MatchService,
  ) {}

  async activateProfile(profileId: ProfileId) {
    return activateModule(this.moduleProfileRepo, profileId, 'investors');
  }

  upsertProfile(input: UpsertInvestorProfileInput) {
    return this.moduleProfileRepo.upsertInvestorProfile(input);
  }

  getProfile(profileId: ProfileId) {
    return this.moduleProfileRepo.findInvestorProfile(profileId);
  }

  browseStartups(filter: { industry?: string; city?: string } = {}) {
    return this.listingRepo.findPublished({
      moduleKey: 'entrepreneurs',
      industry: filter.industry,
      city: filter.city,
    });
  }

  requestMeeting(input: CreateMatchInput & { targetListingId?: ListingId }) {
    return this.matchService.create({
      moduleKey: 'investors',
      initiatorProfileId: input.initiatorProfileId,
      targetProfileId: input.targetProfileId,
      listingId: input.listingId,
      targetListingId: input.targetListingId,
    });
  }

  async contactStartup(matchId: Parameters<MatchService['contact']>[0], profileId: ProfileId): Promise<ExternalContactInfo> {
    const result = await this.matchService.contact(matchId, profileId);
    return result.contact;
  }
}
