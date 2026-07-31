import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '@/lib/domain/errors';
import type {
  MatchId,
  ProfileId,
  ListingId,
  UserId,
} from '@/lib/domain/ids';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import type { MatchService } from '@/features/matching/services/match.service';
import type { Match } from '@/features/matching/types/match.types';
import type {
  EntrepreneurApplicationDetail,
  EntrepreneurApplicationFilter,
  EntrepreneurApplicationStatus,
  EntrepreneurApplicationSummary,
  EntrepreneurApplicationContactResult,
} from '@/features/entrepreneurs/types/entrepreneur-application.types';
import {
  appendNote,
  appendStatusHistory,
  getEntrepreneurMetadata,
  initialStatusHistory,
  mergeEntrepreneurMetadata,
  toEntrepreneurStatus,
  toMatchStatus,
} from '@/features/entrepreneurs/lib/entrepreneur-application-metadata';
import {
  contactFromEntrepreneurProfile,
  contactFromListing,
  contactFromProfile,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';

export class EntrepreneurApplicationService {
  constructor(
    private readonly matchRepo: MatchRepository,
    private readonly matchService: MatchService,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  /** Investor expresses investment interest in a startup listing */
  async submitInterest(
    investorProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string | null,
    initialNote?: string,
  ): Promise<EntrepreneurApplicationSummary> {
    const listing = await this.requireEntrepreneurListing(listingId);
    const entrepreneurProfileId = await this.resolveListingOwnerProfile(listing);

    const existing = await this.matchRepo.findMany({
      moduleKey: 'entrepreneurs',
      listingId,
      initiatorProfileId: investorProfileId,
    });
    if (existing.data.length > 0) {
      throw new ConflictError('Bu ilana zaten yatırım ilgisi gönderilmiş.');
    }

    const metadata = {
      entrepreneur: {
        coverMessage: coverMessage ?? null,
        notes: initialNote
          ? [{ id: crypto.randomUUID(), authorProfileId: investorProfileId, text: initialNote, createdAt: new Date().toISOString() }]
          : [],
        statusHistory: initialStatusHistory(investorProfileId),
      },
    };

    const match = await this.matchRepo.create({
      moduleKey: 'entrepreneurs',
      listingId,
      initiatorProfileId: investorProfileId,
      targetProfileId: entrepreneurProfileId,
      metadata,
    });

    return this.toSummary(match);
  }

  /** Entrepreneur lists investment interests for own startup listing */
  async listApplicationsForListing(
    listingId: ListingId,
    entrepreneurProfileId: ProfileId,
    filter: Omit<EntrepreneurApplicationFilter, 'listingId'> = {},
  ): Promise<EntrepreneurApplicationSummary[]> {
    await this.assertListingOwnerByListing(listingId, entrepreneurProfileId);
    const matches = await this.findFiltered({ ...filter, listingId });
    return matches.map((m) => this.toSummary(m));
  }

  /** Investor tracks own investment interests */
  async listApplicationsForInvestor(
    investorProfileId: ProfileId,
    filter: Omit<EntrepreneurApplicationFilter, 'investorProfileId'> = {},
  ): Promise<EntrepreneurApplicationSummary[]> {
    const matches = await this.findFiltered({ ...filter, investorProfileId });
    return matches.map((m) => this.toSummary(m));
  }

  async getApplicationDetail(
    matchId: MatchId,
    viewerProfileId: ProfileId,
  ): Promise<EntrepreneurApplicationDetail> {
    const match = await this.requireEntrepreneurMatch(matchId);
    await this.assertCanView(match, viewerProfileId);

    const isEntrepreneur = await this.isListingOwner(match, viewerProfileId);
    const listing = await this.listingRepo.findById(match.listingId!);
    const meta = getEntrepreneurMetadata(match);

    return {
      ...this.toSummary(match),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      listing: isEntrepreneur ? listing : listing,
    };
  }

  async updateApplicationStatus(
    matchId: MatchId,
    entrepreneurProfileId: ProfileId,
    entrepreneurStatus: EntrepreneurApplicationStatus,
    note?: string,
  ): Promise<EntrepreneurApplicationSummary> {
    const match = await this.requireEntrepreneurMatch(matchId);
    await this.assertListingOwner(match, entrepreneurProfileId);

    const nextMatchStatus = toMatchStatus(entrepreneurStatus);
    if (!nextMatchStatus) {
      throw new ValidationError('Geçersiz durum geçişi.', { status: ['Bu duruma geçilemez.'] });
    }

    let updated = await this.matchRepo.transitionStatus(matchId, nextMatchStatus);

    if (entrepreneurStatus === 'withdrawn') {
      updated = await this.matchRepo.update(matchId, {
        metadata: mergeEntrepreneurMetadata(updated, { withdrawn: true }),
      });
    }

    let metadata = mergeEntrepreneurMetadata(updated, {
      statusHistory: appendStatusHistory(updated, entrepreneurStatus, entrepreneurProfileId),
    });

    if (note) {
      metadata = mergeEntrepreneurMetadata(
        { ...updated, metadata },
        { notes: appendNote({ ...updated, metadata }, entrepreneurProfileId, note) },
      );
    }

    updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async contactParticipant(
    matchId: MatchId,
    actorProfileId: ProfileId,
  ): Promise<EntrepreneurApplicationContactResult> {
    const match = await this.requireEntrepreneurMatch(matchId);
    const isInvestor = match.initiatorProfileId === actorProfileId;

    if (isInvestor) {
      const listing = match.listingId
        ? await this.requireEntrepreneurListing(match.listingId)
        : null;
      const entrepreneurProfile = await this.moduleProfileRepo.findEntrepreneurProfile(
        match.targetProfileId,
      );
      const contact =
        listing && hasExternalContact(contactFromListing(listing))
          ? contactFromListing(listing)
          : entrepreneurProfile
            ? contactFromEntrepreneurProfile(entrepreneurProfile)
            : { phone: null, whatsapp: null, email: null, website: null };

      if (!hasExternalContact(contact)) {
        throw new NotFoundError('ContactInfo', matchId);
      }

      const result = await this.matchService.contact(matchId, actorProfileId);
      const metadata = mergeEntrepreneurMetadata(result.match, {
        statusHistory: appendStatusHistory(result.match, 'contacted', actorProfileId),
      });
      const updated = await this.matchRepo.update(matchId, { metadata });
      return { application: this.toSummary(updated), contact };
    }

    await this.assertListingOwner(match, actorProfileId);
    const contact = await this.resolveInvestorContact(match.initiatorProfileId);
    const result = await this.matchService.contact(matchId, actorProfileId);
    const metadata = mergeEntrepreneurMetadata(result.match, {
      statusHistory: appendStatusHistory(result.match, 'contacted', actorProfileId),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    matchId: MatchId,
    entrepreneurProfileId: ProfileId,
    note: string,
  ): Promise<EntrepreneurApplicationSummary> {
    const match = await this.requireEntrepreneurMatch(matchId);
    await this.assertListingOwner(match, entrepreneurProfileId);

    const metadata = mergeEntrepreneurMetadata(match, {
      notes: appendNote(match, entrepreneurProfileId, note),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async withdrawApplication(
    matchId: MatchId,
    investorProfileId: ProfileId,
  ): Promise<EntrepreneurApplicationSummary> {
    const match = await this.requireEntrepreneurMatch(matchId);
    if (match.initiatorProfileId !== investorProfileId) {
      throw new ForbiddenError('Yatırım ilgisi sahibi değilsiniz.');
    }

    let updated = await this.matchRepo.transitionStatus(matchId, 'declined');
    const metadata = mergeEntrepreneurMetadata(updated, {
      withdrawn: true,
      statusHistory: appendStatusHistory(updated, 'withdrawn', investorProfileId),
    });
    updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async markReviewing(
    matchId: MatchId,
    entrepreneurProfileId: ProfileId,
  ): Promise<EntrepreneurApplicationSummary> {
    const match = await this.requireEntrepreneurMatch(matchId);
    await this.assertListingOwner(match, entrepreneurProfileId);
    const updated = await this.matchService.accept(matchId, entrepreneurProfileId);
    const metadata = mergeEntrepreneurMetadata(updated, {
      statusHistory: appendStatusHistory(updated, 'reviewing', entrepreneurProfileId),
    });
    const saved = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(saved);
  }

  favoriteListing(userId: UserId, listingId: ListingId) {
    return this.favoriteRepo.create({ userId, listingId });
  }

  async unfavoriteListing(userId: UserId, listingId: ListingId): Promise<void> {
    const favorite = await this.favoriteRepo.findByUserAndListing(userId, listingId);
    if (!favorite) throw new NotFoundError('Favorite', `${userId}:${listingId}`);
    await this.favoriteRepo.delete(favorite.id);
  }

  private async findFiltered(filter: EntrepreneurApplicationFilter): Promise<Match[]> {
    const matchFilter = {
      moduleKey: 'entrepreneurs' as const,
      listingId: filter.listingId,
      initiatorProfileId: filter.investorProfileId,
      targetProfileId: filter.entrepreneurProfileId,
    };
    const { data } = await this.matchRepo.findMany(matchFilter, { page: 1, limit: 500 });

    return data.filter((match) => {
      if (filter.submittedAfter && match.createdAt < filter.submittedAfter) return false;
      if (filter.submittedBefore && match.createdAt > filter.submittedBefore) return false;
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(toEntrepreneurStatus(match))) return false;
      }
      return true;
    });
  }

  private async resolveInvestorContact(investorProfileId: ProfileId): Promise<ExternalContactInfo> {
    const profile = await this.profileRepo.findById(investorProfileId);
    if (!profile) throw new NotFoundError('Profile', investorProfileId);
    const contact = contactFromProfile(profile);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', investorProfileId);
    }
    return contact;
  }

  private async resolveListingOwnerProfile(listing: { ownerId: UserId }): Promise<ProfileId> {
    const profile = await this.profileRepo.findByUserId(listing.ownerId);
    if (!profile) throw new NotFoundError('Profile', listing.ownerId);
    return profile.id;
  }

  private toSummary(match: Match): EntrepreneurApplicationSummary {
    const meta = getEntrepreneurMetadata(match);
    return {
      id: match.id,
      listingId: match.listingId,
      initiatorProfileId: match.initiatorProfileId,
      targetProfileId: match.targetProfileId,
      status: toEntrepreneurStatus(match),
      coverMessage: meta.coverMessage ?? null,
      submittedAt: match.createdAt,
      contactedAt: match.contactedAt,
      updatedAt: match.updatedAt,
    };
  }

  private async requireEntrepreneurMatch(id: MatchId): Promise<Match> {
    const match = await this.matchRepo.findById(id);
    if (!match || match.moduleKey !== 'entrepreneurs') {
      throw new NotFoundError('Match', id);
    }
    return match;
  }

  private async requireEntrepreneurListing(id: ListingId) {
    const listing = await this.listingRepo.findById(id);
    if (!listing || listing.moduleKey !== 'entrepreneurs') {
      throw new ValidationError('Geçersiz startup ilanı.', { listingId: ['Startup ilanı bulunamadı.'] });
    }
    return listing;
  }

  private async isListingOwner(match: Match, profileId: ProfileId): Promise<boolean> {
    if (match.targetProfileId === profileId) return true;
    if (!match.listingId) return false;
    const listing = await this.listingRepo.findById(match.listingId);
    if (!listing) return false;
    const ownerProfile = await this.profileRepo.findById(profileId);
    return Boolean(ownerProfile && listing.ownerId === ownerProfile.userId);
  }

  private async assertListingOwner(match: Match, profileId: ProfileId): Promise<void> {
    if (!(await this.isListingOwner(match, profileId))) {
      throw new ForbiddenError('Bu yatırım ilgisini yönetme yetkiniz yok.');
    }
  }

  private async assertListingOwnerByListing(
    listingId: ListingId,
    profileId: ProfileId,
  ): Promise<void> {
    const listing = await this.requireEntrepreneurListing(listingId);
    const ownerProfile = await this.profileRepo.findById(profileId);
    if (!ownerProfile || listing.ownerId !== ownerProfile.userId) {
      throw new ForbiddenError('Bu ilanın yatırım ilgilerini görüntüleme yetkiniz yok.');
    }
  }

  private async assertCanView(match: Match, viewerProfileId: ProfileId): Promise<void> {
    if (match.initiatorProfileId === viewerProfileId) return;
    await this.assertListingOwner(match, viewerProfileId);
  }
}
