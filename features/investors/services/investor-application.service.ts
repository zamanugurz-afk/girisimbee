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
  InvestorApplicationDetail,
  InvestorApplicationFilter,
  InvestorApplicationStatus,
  InvestorApplicationSummary,
  InvestorApplicationContactResult,
} from '@/features/investors/types/investor-application.types';
import {
  appendNote,
  appendStatusHistory,
  getInvestorMetadata,
  initialStatusHistory,
  mergeInvestorMetadata,
  toInvestorStatus,
  toMatchStatus,
} from '@/features/investors/lib/investor-application-metadata';
import {
  contactFromEntrepreneurProfile,
  contactFromInvestorProfile,
  contactFromListing,
  contactFromProfile,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';

export class InvestorApplicationService {
  constructor(
    private readonly matchRepo: MatchRepository,
    private readonly matchService: MatchService,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  /** Initiate match: investor → entrepreneur startup OR entrepreneur → investor thesis */
  async submitInterest(
    initiatorProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string | null,
    initialNote?: string,
  ): Promise<InvestorApplicationSummary> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) {
      throw new ValidationError('Geçersiz ilan.', { listingId: ['İlan bulunamadı.'] });
    }

    const targetProfileId = await this.resolveListingOwnerProfile(listing);
    let listingIdField: ListingId | null = null;
    let targetListingIdField: ListingId | null = null;

    if (listing.moduleKey === 'entrepreneurs') {
      targetListingIdField = listingId;
    } else if (listing.moduleKey === 'investors') {
      listingIdField = listingId;
    } else {
      throw new ValidationError('Geçersiz ilan.', { listingId: ['Desteklenmeyen ilan türü.'] });
    }

    const { data: existingMatches } = await this.matchRepo.findMany({
      moduleKey: 'investors',
      initiatorProfileId,
    });
    const duplicate = existingMatches.find((m) => {
      if (targetListingIdField) return m.targetListingId === targetListingIdField;
      if (listingIdField) return m.listingId === listingIdField;
      return false;
    });
    if (duplicate) {
      throw new ConflictError('Bu ilana zaten eşleşme talebi gönderilmiş.');
    }

    const metadata = {
      investor: {
        coverMessage: coverMessage ?? null,
        notes: initialNote
          ? [{ id: crypto.randomUUID(), authorProfileId: initiatorProfileId, text: initialNote, createdAt: new Date().toISOString() }]
          : [],
        statusHistory: initialStatusHistory(initiatorProfileId),
      },
    };

    const match = await this.matchRepo.create({
      moduleKey: 'investors',
      listingId: listingIdField,
      targetListingId: targetListingIdField,
      initiatorProfileId,
      targetProfileId,
      metadata,
    });

    return this.toSummary(match);
  }

  async listApplicationsForListing(
    listingId: ListingId,
    ownerProfileId: ProfileId,
    filter: Omit<InvestorApplicationFilter, 'listingId'> = {},
  ): Promise<InvestorApplicationSummary[]> {
    await this.assertListingOwnerByListing(listingId, ownerProfileId);
    const matches = await this.findFiltered({ ...filter, listingId });
    return matches.map((m) => this.toSummary(m));
  }

  async listApplicationsForInvestor(
    investorProfileId: ProfileId,
    filter: Omit<InvestorApplicationFilter, 'investorProfileId'> = {},
  ): Promise<InvestorApplicationSummary[]> {
    const matches = await this.findFiltered({ ...filter, investorProfileId });
    return matches.map((m) => this.toSummary(m));
  }

  async listApplicationsForEntrepreneur(
    entrepreneurProfileId: ProfileId,
    filter: Omit<InvestorApplicationFilter, 'entrepreneurProfileId'> = {},
  ): Promise<InvestorApplicationSummary[]> {
    const matches = await this.findFiltered({ ...filter, entrepreneurProfileId });
    return matches.map((m) => this.toSummary(m));
  }

  async getApplicationDetail(
    matchId: MatchId,
    viewerProfileId: ProfileId,
  ): Promise<InvestorApplicationDetail> {
    const match = await this.requireInvestorMatch(matchId);
    await this.assertCanView(match, viewerProfileId);

    const listing = match.listingId ? await this.listingRepo.findById(match.listingId) : null;
    const targetListing = match.targetListingId
      ? await this.listingRepo.findById(match.targetListingId)
      : null;
    const meta = getInvestorMetadata(match);

    return {
      ...this.toSummary(match),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      listing,
      targetListing,
    };
  }

  async updateApplicationStatus(
    matchId: MatchId,
    targetProfileId: ProfileId,
    investorStatus: InvestorApplicationStatus,
    note?: string,
  ): Promise<InvestorApplicationSummary> {
    const match = await this.requireInvestorMatch(matchId);
    await this.assertMatchTarget(match, targetProfileId);

    const nextMatchStatus = toMatchStatus(investorStatus);
    if (!nextMatchStatus) {
      throw new ValidationError('Geçersiz durum geçişi.', { status: ['Bu duruma geçilemez.'] });
    }

    let updated = await this.matchRepo.transitionStatus(matchId, nextMatchStatus);

    if (investorStatus === 'withdrawn') {
      updated = await this.matchRepo.update(matchId, {
        metadata: mergeInvestorMetadata(updated, { withdrawn: true }),
      });
    }

    let metadata = mergeInvestorMetadata(updated, {
      statusHistory: appendStatusHistory(updated, investorStatus, targetProfileId),
    });

    if (note) {
      metadata = mergeInvestorMetadata(
        { ...updated, metadata },
        { notes: appendNote({ ...updated, metadata }, targetProfileId, note) },
      );
    }

    updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async contactParticipant(
    matchId: MatchId,
    actorProfileId: ProfileId,
  ): Promise<InvestorApplicationContactResult> {
    const match = await this.requireInvestorMatch(matchId);
    await this.assertCanView(match, actorProfileId);

    const contact = await this.resolveContactForActor(match, actorProfileId);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', matchId);
    }

    const result = await this.matchService.contact(matchId, actorProfileId);
    const metadata = mergeInvestorMetadata(result.match, {
      statusHistory: appendStatusHistory(result.match, 'contacted', actorProfileId),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    matchId: MatchId,
    actorProfileId: ProfileId,
    note: string,
  ): Promise<InvestorApplicationSummary> {
    const match = await this.requireInvestorMatch(matchId);
    await this.assertCanView(match, actorProfileId);

    const metadata = mergeInvestorMetadata(match, {
      notes: appendNote(match, actorProfileId, note),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async withdrawApplication(
    matchId: MatchId,
    initiatorProfileId: ProfileId,
  ): Promise<InvestorApplicationSummary> {
    const match = await this.requireInvestorMatch(matchId);
    if (match.initiatorProfileId !== initiatorProfileId) {
      throw new ForbiddenError('Eşleşme talebi sahibi değilsiniz.');
    }

    let updated = await this.matchRepo.transitionStatus(matchId, 'declined');
    const metadata = mergeInvestorMetadata(updated, {
      withdrawn: true,
      statusHistory: appendStatusHistory(updated, 'withdrawn', initiatorProfileId),
    });
    updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async markReviewing(
    matchId: MatchId,
    targetProfileId: ProfileId,
  ): Promise<InvestorApplicationSummary> {
    const match = await this.requireInvestorMatch(matchId);
    await this.assertMatchTarget(match, targetProfileId);
    const updated = await this.matchService.accept(matchId, targetProfileId);
    const metadata = mergeInvestorMetadata(updated, {
      statusHistory: appendStatusHistory(updated, 'reviewing', targetProfileId),
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

  private async findFiltered(filter: InvestorApplicationFilter): Promise<Match[]> {
    const { data } = await this.matchRepo.findMany(
      { moduleKey: 'investors' },
      { page: 1, limit: 500 },
    );

    return data.filter((match) => {
      if (filter.listingId && match.listingId !== filter.listingId) return false;
      if (filter.investorProfileId) {
        const isInvestor =
          match.initiatorProfileId === filter.investorProfileId ||
          match.targetProfileId === filter.investorProfileId;
        if (!isInvestor) return false;
      }
      if (filter.entrepreneurProfileId) {
        const isEntrepreneur =
          match.initiatorProfileId === filter.entrepreneurProfileId ||
          match.targetProfileId === filter.entrepreneurProfileId;
        if (!isEntrepreneur) return false;
      }
      if (filter.submittedAfter && match.createdAt < filter.submittedAfter) return false;
      if (filter.submittedBefore && match.createdAt > filter.submittedBefore) return false;
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(toInvestorStatus(match))) return false;
      }
      return true;
    });
  }

  private async resolveContactForActor(
    match: Match,
    actorProfileId: ProfileId,
  ): Promise<ExternalContactInfo> {
    const isInitiator = match.initiatorProfileId === actorProfileId;
    const otherProfileId = isInitiator ? match.targetProfileId : match.initiatorProfileId;

    if (match.targetListingId) {
      const startup = await this.listingRepo.findById(match.targetListingId);
      if (startup && hasExternalContact(contactFromListing(startup))) {
        return contactFromListing(startup);
      }
      const entrepreneurProfile = await this.moduleProfileRepo.findEntrepreneurProfile(otherProfileId);
      if (entrepreneurProfile && hasExternalContact(contactFromEntrepreneurProfile(entrepreneurProfile))) {
        return contactFromEntrepreneurProfile(entrepreneurProfile);
      }
    }

    if (match.listingId) {
      const thesis = await this.listingRepo.findById(match.listingId);
      if (thesis && hasExternalContact(contactFromListing(thesis))) {
        return contactFromListing(thesis);
      }
      const investorProfile = await this.moduleProfileRepo.findInvestorProfile(otherProfileId);
      if (investorProfile && hasExternalContact(contactFromInvestorProfile(investorProfile))) {
        return contactFromInvestorProfile(investorProfile);
      }
    }

    const profile = await this.profileRepo.findById(otherProfileId);
    if (profile) return contactFromProfile(profile);
    return { phone: null, whatsapp: null, email: null, website: null };
  }

  private async resolveListingOwnerProfile(listing: { ownerId: UserId }): Promise<ProfileId> {
    const profile = await this.profileRepo.findByUserId(listing.ownerId);
    if (!profile) throw new NotFoundError('Profile', listing.ownerId);
    return profile.id;
  }

  private toSummary(match: Match): InvestorApplicationSummary {
    const meta = getInvestorMetadata(match);
    return {
      id: match.id,
      listingId: match.listingId,
      targetListingId: match.targetListingId,
      initiatorProfileId: match.initiatorProfileId,
      targetProfileId: match.targetProfileId,
      status: toInvestorStatus(match),
      coverMessage: meta.coverMessage ?? null,
      submittedAt: match.createdAt,
      contactedAt: match.contactedAt,
      updatedAt: match.updatedAt,
    };
  }

  private async requireInvestorMatch(id: MatchId): Promise<Match> {
    const match = await this.matchRepo.findById(id);
    if (!match || match.moduleKey !== 'investors') {
      throw new NotFoundError('Match', id);
    }
    return match;
  }

  private async isListingOwner(listingId: ListingId, profileId: ProfileId): Promise<boolean> {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) return false;
    const ownerProfile = await this.profileRepo.findById(profileId);
    return Boolean(ownerProfile && listing.ownerId === ownerProfile.userId);
  }

  private async assertListingOwnerByListing(
    listingId: ListingId,
    profileId: ProfileId,
  ): Promise<void> {
    if (!(await this.isListingOwner(listingId, profileId))) {
      throw new ForbiddenError('Bu ilanın eşleşmelerini görüntüleme yetkiniz yok.');
    }
  }

  private async assertMatchTarget(match: Match, profileId: ProfileId): Promise<void> {
    if (match.targetProfileId !== profileId) {
      const ownedListingId = match.listingId ?? match.targetListingId;
      if (!ownedListingId || !(await this.isListingOwner(ownedListingId, profileId))) {
        throw new ForbiddenError('Bu eşleşmeyi yönetme yetkiniz yok.');
      }
    }
  }

  private async assertCanView(match: Match, viewerProfileId: ProfileId): Promise<void> {
    if (match.initiatorProfileId === viewerProfileId) return;
    if (match.targetProfileId === viewerProfileId) return;
    if (match.listingId && (await this.isListingOwner(match.listingId, viewerProfileId))) return;
    if (match.targetListingId && (await this.isListingOwner(match.targetListingId, viewerProfileId))) {
      return;
    }
    throw new ForbiddenError('Bu eşleşmeyi görüntüleme yetkiniz yok.');
  }
}
