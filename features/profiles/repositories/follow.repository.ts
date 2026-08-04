import type { UserId } from '@/lib/domain/ids';

export interface FollowRepository {
  follow(followerId: UserId, followingId: UserId): Promise<void>;
  unfollow(followerId: UserId, followingId: UserId): Promise<void>;
  isFollowing(followerId: UserId, followingId: UserId): Promise<boolean>;
  countFollowers(userId: UserId): Promise<number>;
  countFollowing(userId: UserId): Promise<number>;
  /** User IDs that `userId` follows (newest first). */
  listFollowingIds(userId: UserId, limit?: number): Promise<UserId[]>;
  /** User IDs that follow `userId` (newest first). */
  listFollowerIds(userId: UserId, limit?: number): Promise<UserId[]>;
}
