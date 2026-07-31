import { now } from '@/lib/domain/factory';
import { canTransition } from '@/lib/domain/base';
import { normalizePagination, paginatedResult, offset } from '@/lib/domain/pagination';
import { NotFoundError, InvalidTransitionError } from '@/lib/domain/errors';
import { MATCH_STATUS_TRANSITIONS } from '@/lib/domain/marketplace-enums';
import type { MatchId, ProfileId, ListingId } from '@/lib/domain/ids';
import type { Match, MatchFilter, CreateMatchInput, UpdateMatchInput } from '@/features/matching/types/match.types';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { PaginationParams, PaginatedResult, RepositoryFilter } from '@/lib/domain/pagination';
import { createMatch } from '@/features/matching/factories/match.factory';

export class MockMatchRepository implements MatchRepository {
  private matches = new Map<MatchId, Match>();

  async findById(id: MatchId, _filter?: RepositoryFilter): Promise<Match | null> {
    return this.matches.get(id) ?? null;
  }

  async findMany(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    const { page, limit } = normalizePagination(pagination);
    let results = [...this.matches.values()];
    if (filter.moduleKey) results = results.filter((m) => m.moduleKey === filter.moduleKey);
    if (filter.listingId) results = results.filter((m) => m.listingId === filter.listingId);
    if (filter.initiatorProfileId) results = results.filter((m) => m.initiatorProfileId === filter.initiatorProfileId);
    if (filter.targetProfileId) results = results.filter((m) => m.targetProfileId === filter.targetProfileId);
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter((m) => statuses.includes(m.status));
    }
    const total = results.length;
    const start = offset(page, limit);
    return paginatedResult(results.slice(start, start + limit), total, page, limit);
  }

  async paginate(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    return this.findMany(filter, pagination);
  }

  async search(filter: MatchFilter, pagination?: PaginationParams): Promise<PaginatedResult<Match>> {
    return this.findMany(filter, pagination);
  }

  async count(filter: MatchFilter): Promise<number> {
    const { total } = await this.findMany(filter, { page: 1, limit: 1 });
    return total;
  }

  async exists(id: MatchId): Promise<boolean> {
    return this.matches.has(id);
  }

  async create(input: CreateMatchInput): Promise<Match> {
    const match = createMatch(input);
    this.matches.set(match.id, match);
    return match;
  }

  async update(id: MatchId, input: UpdateMatchInput): Promise<Match> {
    const existing = this.matches.get(id);
    if (!existing) throw new NotFoundError('Match', id);
    const updated = { ...existing, ...input, updatedAt: now() };
    this.matches.set(id, updated);
    return updated;
  }

  async softDelete(id: MatchId): Promise<void> {
    this.matches.delete(id);
  }

  async delete(id: MatchId): Promise<void> {
    return this.softDelete(id);
  }

  async restore(id: MatchId): Promise<Match> {
    const match = this.matches.get(id);
    if (!match) throw new NotFoundError('Match', id);
    return match;
  }

  async findForProfile(profileId: ProfileId): Promise<Match[]> {
    return [...this.matches.values()].filter(
      (m) => m.initiatorProfileId === profileId || m.targetProfileId === profileId,
    );
  }

  async findForListing(listingId: ListingId): Promise<Match[]> {
    return [...this.matches.values()].filter((m) => m.listingId === listingId);
  }

  async transitionStatus(id: MatchId, status: Match['status']): Promise<Match> {
    const match = this.matches.get(id);
    if (!match) throw new NotFoundError('Match', id);
    if (!canTransition(MATCH_STATUS_TRANSITIONS, match.status, status)) {
      throw new InvalidTransitionError(match.status, status);
    }
    const updated = {
      ...match,
      status,
      contactedAt: status === 'contacted' ? now() : match.contactedAt,
      updatedAt: now(),
    };
    this.matches.set(id, updated);
    return updated;
  }
}
