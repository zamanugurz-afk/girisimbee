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
  FounderApplicationDetail,
  FounderApplicationFilter,
  FounderApplicationStatus,
  FounderApplicationSummary,
  FounderApplicationContactResult,
} from '@/features/founders/types/founder-application.types';
import {
  appendNote,
  appendStatusHistory,
  getFounderMetadata,
  initialStatusHistory,
  mergeFounderMetadata,
  toFounderStatus,
  toMatchStatus,
} from '@/features/founders/lib/founder-application-metadata';
import {
  contactFromFounderProfile,
  contactFromListing,
  contactFromProfile,
  hasExternalContact,
} from '@/features/shared/lib/external-contact';

export class FounderApplicationService {
  constructor(
    private readonly matchRepo: MatchRepository,
    private readonly matchService: MatchService,
    private readonly listingRepo: ListingRepository,
    private readonly moduleProfileRepo: ModuleProfileRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  async submitInterest(
    initiatorProfileId: ProfileId,
    listingId: ListingId,
    coverMessage?: string | null,
    initialNote?: string,
  ): Promise<FounderApplicationSummary> {
    const listing = await this.requireFounderListing(listingId);
    const targetProfileId = await this.resolveListingOwnerProfile(listing);

    const existing = await this.matchRepo.findMany({
      moduleKey: 'founders',
      listingId,
      initiatorProfileId,
    });
    if (existing.data.length > 0) {
      throw new ConflictError('Bu ilana zaten ortaklık talebi gönderilmiş.');
    }

    const metadata = {
      founder: {
        coverMessage: coverMessage ?? null,
        notes: initialNote
          ? [{ id: crypto.randomUUID(), authorProfileId: initiatorProfileId, text: initialNote, createdAt: new Date().toISOString() }]
          : [],
        statusHistory: initialStatusHistory(initiatorProfileId),
      },
    };

    const match = await this.matchRepo.create({
      moduleKey: 'founders',
      listingId,
      initiatorProfileId,
      targetProfileId,
      metadata,
    });

    return this.toSummary(match);
  }

  async listApplicationsForListing(
    listingId: ListingId,
    ownerProfileId: ProfileId,
    filter: Omit<FounderApplicationFilter, 'listingId'> = {},
  ): Promise<FounderApplicationSummary[]> {
    await this.assertListingOwnerByListing(listingId, ownerProfileId);
    const matches = await this.findFiltered({ ...filter, listingId });
    return matches.map((m) => this.toSummary(m));
  }

  async listApplicationsForApplicant(
    applicantProfileId: ProfileId,
    filter: Omit<FounderApplicationFilter, 'applicantProfileId'> = {},
  ): Promise<FounderApplicationSummary[]> {
    const matches = await this.findFiltered({ ...filter, applicantProfileId });
    return matches.map((m) => this.toSummary(m));
  }

  async getApplicationDetail(
    matchId: MatchId,
    viewerProfileId: ProfileId,
  ): Promise<FounderApplicationDetail> {
    const match = await this.requireFounderMatch(matchId);
    await this.assertCanView(match, viewerProfileId);

    const listing = match.listingId ? await this.listingRepo.findById(match.listingId) : null;
    const meta = getFounderMetadata(match);

    return {
      ...this.toSummary(match),
      notes: meta.notes ?? [],
      history: meta.statusHistory ?? [],
      listing,
    };
  }

  async updateApplicationStatus(
    matchId: MatchId,
    targetProfileId: ProfileId,
    founderStatus: FounderApplicationStatus,
    note?: string,
  ): Promise<FounderApplicationSummary> {
    const match = await this.requireFounderMatch(matchId);
    await this.assertMatchTarget(match, targetProfileId);

    const nextMatchStatus = toMatchStatus(founderStatus);
    if (!nextMatchStatus) {
      throw new ValidationError('Geçersiz durum geçişi.', { status: ['Bu duruma geçilemez.'] });
    }

    let updated = await this.matchRepo.transitionStatus(matchId, nextMatchStatus);

    if (founderStatus === 'withdrawn') {
      updated = await this.matchRepo.update(matchId, {
        metadata: mergeFounderMetadata(updated, { withdrawn: true }),
      });
    }

    let metadata = mergeFounderMetadata(updated, {
      statusHistory: appendStatusHistory(updated, founderStatus, targetProfileId),
    });

    if (note) {
      metadata = mergeFounderMetadata(
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
  ): Promise<FounderApplicationContactResult> {
    const match = await this.requireFounderMatch(matchId);
    await this.assertCanView(match, actorProfileId);

    const contact = await this.resolveContactForActor(match, actorProfileId);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', matchId);
    }

    const result = await this.matchService.contact(matchId, actorProfileId);
    const metadata = mergeFounderMetadata(result.match, {
      statusHistory: appendStatusHistory(result.match, 'contacted', actorProfileId),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return { application: this.toSummary(updated), contact };
  }

  async addApplicationNote(
    matchId: MatchId,
    actorProfileId: ProfileId,
    note: string,
  ): Promise<FounderApplicationSummary> {
    const match = await this.requireFounderMatch(matchId);
    await this.assertCanView(match, actorProfileId);

    const metadata = mergeFounderMetadata(match, {
      notes: appendNote(match, actorProfileId, note),
    });
    const updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async withdrawApplication(
    matchId: MatchId,
    initiatorProfileId: ProfileId,
  ): Promise<FounderApplicationSummary> {
    const match = await this.requireFounderMatch(matchId);
    if (match.initiatorProfileId !== initiatorProfileId) {
      throw new ForbiddenError('Ortaklık talebi sahibi değilsiniz.');
    }

    let updated = await this.matchRepo.transitionStatus(matchId, 'declined');
    const metadata = mergeFounderMetadata(updated, {
      withdrawn: true,
      statusHistory: appendStatusHistory(updated, 'withdrawn', initiatorProfileId),
    });
    updated = await this.matchRepo.update(matchId, { metadata });
    return this.toSummary(updated);
  }

  async markReviewing(
    matchId: MatchId,
    targetProfileId: ProfileId,
  ): Promise<FounderApplicationSummary> {
    const match = await this.requireFounderMatch(matchId);
    await this.assertMatchTarget(match, targetProfileId);
    const updated = await this.matchService.accept(matchId, targetProfileId);
    const metadata = mergeFounderMetadata(updated, {
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

  private async findFiltered(filter: FounderApplicationFilter): Promise<Match[]> {
    const { data } = await this.matchRepo.findMany(
      { moduleKey: 'founders', listingId: filter.listingId },
      { page: 1, limit: 500 },
    );

    return data.filter((match) => {
      if (filter.applicantProfileId && match.initiatorProfileId !== filter.applicantProfileId) {
        return false;
      }
      if (filter.founderProfileId) {
        const isFounder =
          match.initiatorProfileId === filter.founderProfileId ||
          match.targetProfileId === filter.founderProfileId;
        if (!isFounder) return false;
      }
      if (filter.submittedAfter && match.createdAt < filter.submittedAfter) return false;
      if (filter.submittedBefore && match.createdAt > filter.submittedBefore) return false;
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(toFounderStatus(match))) return false;
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

    if (match.listingId) {
      const listing = await this.listingRepo.findById(match.listingId);
      if (listing && hasExternalContact(contactFromListing(listing))) {
        return contactFromListing(listing);
      }
    }

    const founderProfile = await this.moduleProfileRepo.findFounderProfile(otherProfileId);
    if (founderProfile && hasExternalContact(contactFromFounderProfile(founderProfile))) {
      return contactFromFounderProfile(founderProfile);
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

  private toSummary(match: Match): FounderApplicationSummary {
    const meta = getFounderMetadata(match);
    return {
      id: match.id,
      listingId: match.listingId,
      initiatorProfileId: match.initiatorProfileId,
      targetProfileId: match.targetProfileId,
      status: toFounderStatus(match),
      coverMessage: meta.coverMessage ?? null,
      submittedAt: match.createdAt,
      contactedAt: match.contactedAt,
      updatedAt: match.updatedAt,
    };
  }

  private async requireFounderMatch(id: MatchId): Promise<Match> {
    const match = await this.matchRepo.findById(id);
    if (!match || match.moduleKey !== 'founders') {
      throw new NotFoundError('Match', id);
    }
    return match;
  }

  private async requireFounderListing(id: ListingId) {
    const listing = await this.listingRepo.findById(id);
    if (!listing || listing.moduleKey !== 'founders') {
      throw new ValidationError('Geçersiz ortak arama ilanı.', { listingId: ['Ortak arama ilanı bulunamadı.'] });
    }
    return listing;
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
      throw new ForbiddenError('Bu ilanın ortaklık taleplerini görüntüleme yetkiniz yok.');
    }
  }

  private async assertMatchTarget(match: Match, profileId: ProfileId): Promise<void> {
    if (match.targetProfileId !== profileId) {
      if (!match.listingId || !(await this.isListingOwner(match.listingId, profileId))) {
        throw new ForbiddenError('Bu ortaklık talebini yönetme yetkiniz yok.');
      }
    }
  }

  private async assertCanView(match: Match, viewerProfileId: ProfileId): Promise<void> {
    if (match.initiatorProfileId === viewerProfileId) return;
    if (match.targetProfileId === viewerProfileId) return;
    if (match.listingId && (await this.isListingOwner(match.listingId, viewerProfileId))) return;
    throw new ForbiddenError('Bu ortaklık talebini görüntüleme yetkiniz yok.');
  }
}
