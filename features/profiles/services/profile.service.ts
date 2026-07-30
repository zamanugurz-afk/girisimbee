import type { ProfileId, UserId } from '@/lib/domain/ids';
import type { Profile, CreateProfileInput, UpdateProfileInput, ProfileFilter } from '@/features/profiles/types/profile.types';
import type { PublicProfileView } from '@/features/profiles/types/profile-public.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { IProfileService } from '@/features/profiles/services/profile.service.interface';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { FollowRepository } from '@/features/profiles/repositories/follow.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import { ValidationError } from '@/lib/domain/errors';
import { suggestUsername } from '@/features/profiles/validation/profile-editor.schema';

export class ProfileService implements IProfileService {
  constructor(
    private repo: ProfileRepository,
    private followRepo?: FollowRepository,
    private listingRepo?: ListingRepository,
  ) {}

  create(input: CreateProfileInput): Promise<Profile> {
    return this.repo.create(input);
  }

  getById(id: ProfileId): Promise<Profile | null> {
    return this.repo.findById(id);
  }

  getByUserId(userId: UserId): Promise<Profile | null> {
    return this.repo.findByUserId(userId);
  }

  getByUsername(username: string): Promise<Profile | null> {
    return this.repo.findByUsername(username);
  }

  async isUsernameAvailable(username: string, excludeProfileId?: ProfileId): Promise<boolean> {
    const taken = await this.repo.isUsernameTaken(username, excludeProfileId);
    return !taken;
  }

  async ensureProfile(userId: UserId, displayName: string, email?: string): Promise<Profile> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) return existing;

    let username = suggestUsername(displayName);
    if (!username || username.length < 3) {
      username = `user-${userId.slice(0, 8)}`;
    }

    let candidate = username;
    let suffix = 1;
    while (await this.repo.isUsernameTaken(candidate)) {
      candidate = `${username.slice(0, 24)}-${suffix}`;
      suffix += 1;
    }

    return this.repo.create({
      userId,
      displayName,
      username: candidate,
      email: email ?? null,
    });
  }

  async update(id: ProfileId, input: UpdateProfileInput): Promise<Profile> {
    if (input.username) {
      const normalized = input.username.trim().toLowerCase();
      const taken = await this.repo.isUsernameTaken(normalized, id);
      if (taken) {
        throw new ValidationError('Kullanıcı adı kullanımda', {
          username: ['Bu kullanıcı adı zaten alınmış.'],
        });
      }
      input = { ...input, username: normalized };
    }

    await this.repo.update(id, input);
    return this.repo.updateCompletenessScore(id);
  }

  publish(id: ProfileId): Promise<Profile> {
    return this.repo.transitionStatus(id, 'published');
  }

  hide(id: ProfileId): Promise<Profile> {
    return this.repo.transitionStatus(id, 'hidden');
  }

  search(filter: ProfileFilter, pagination?: PaginationParams): Promise<PaginatedResult<Profile>> {
    return this.repo.search(filter, pagination);
  }

  delete(id: ProfileId): Promise<void> {
    return this.repo.delete(id);
  }

  async getPublicProfile(username: string, viewerId?: UserId): Promise<PublicProfileView | null> {
    const profile = await this.repo.findByUsername(username);
    if (!profile || profile.deletedAt) return null;

    const isOwner = Boolean(viewerId && viewerId === profile.userId);
    if (!isOwner && (profile.status !== 'published' || profile.visibility !== 'public')) {
      return null;
    }

    const [followersCount, followingCount, listingsResult] = await Promise.all([
      this.followRepo?.countFollowers(profile.userId) ?? Promise.resolve(0),
      this.followRepo?.countFollowing(profile.userId) ?? Promise.resolve(0),
      this.listingRepo?.search(
        { ownerId: profile.userId, status: 'published' },
        { page: 1, limit: 12 },
      ) ?? Promise.resolve({ data: [], total: 0, page: 1, limit: 12, hasMore: false }),
    ]);

    return {
      profile,
      stats: {
        listingsCount: listingsResult.total,
        followersCount,
        followingCount,
      },
      listings: listingsResult.data,
      isOwner,
    };
  }
}
