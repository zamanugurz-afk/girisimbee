import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/domain/errors';
import type { MatchId, ProfileId, ListingId } from '@/lib/domain/ids';
import type { ExternalContactInfo, MatchStatus } from '@/lib/domain/marketplace-enums';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { Match, CreateMatchInput } from '@/features/matching/types/match.types';
import { contactFromListing, hasExternalContact } from '@/features/shared/lib/external-contact';

export interface MatchContactResult {
  match: Match;
  contact: ExternalContactInfo;
}

export class MatchService {
  constructor(
    private readonly matchRepo: MatchRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  create(input: CreateMatchInput): Promise<Match> {
    return this.matchRepo.create(input);
  }

  getById(id: MatchId): Promise<Match | null> {
    return this.matchRepo.findById(id);
  }

  async requireById(id: MatchId): Promise<Match> {
    const match = await this.matchRepo.findById(id);
    if (!match) throw new NotFoundError('Match', id);
    return match;
  }

  findForProfile(profileId: ProfileId): Promise<Match[]> {
    return this.matchRepo.findForProfile(profileId);
  }

  findForListing(listingId: ListingId): Promise<Match[]> {
    return this.matchRepo.findForListing(listingId);
  }

  accept(id: MatchId, actorProfileId: ProfileId): Promise<Match> {
    return this.transitionAsParticipant(id, actorProfileId, 'accepted');
  }

  decline(id: MatchId, actorProfileId: ProfileId): Promise<Match> {
    return this.transitionAsParticipant(id, actorProfileId, 'declined');
  }

  /** v1: external contact only — no internal messaging */
  async contact(id: MatchId, actorProfileId: ProfileId): Promise<MatchContactResult> {
    const match = await this.requireById(id);
    this.assertParticipant(match, actorProfileId);

    const updated = await this.matchRepo.transitionStatus(id, 'contacted');
    const contact = await this.resolveContact(match);
    if (!hasExternalContact(contact)) {
      throw new NotFoundError('ContactInfo', id);
    }
    return { match: updated, contact };
  }

  closeWon(id: MatchId, actorProfileId: ProfileId): Promise<Match> {
    return this.transitionAsParticipant(id, actorProfileId, 'closed_won');
  }

  closeLost(id: MatchId, actorProfileId: ProfileId): Promise<Match> {
    return this.transitionAsParticipant(id, actorProfileId, 'closed_lost');
  }

  private async transitionAsParticipant(
    id: MatchId,
    actorProfileId: ProfileId,
    status: MatchStatus,
  ): Promise<Match> {
    const match = await this.requireById(id);
    this.assertParticipant(match, actorProfileId);
    return this.matchRepo.transitionStatus(id, status);
  }

  private assertParticipant(match: Match, profileId: ProfileId): void {
    if (match.initiatorProfileId !== profileId && match.targetProfileId !== profileId) {
      throw new ForbiddenError('Bu eşleşmenin katılımcısı değilsiniz.');
    }
  }

  private async resolveContact(match: Match): Promise<ExternalContactInfo> {
    const listingId = match.listingId ?? match.targetListingId;
    if (listingId) {
      const listing = await this.listingRepo.findById(listingId);
      if (listing) return contactFromListing(listing);
    }
    return { phone: null, whatsapp: null, email: null, website: null };
  }
}
