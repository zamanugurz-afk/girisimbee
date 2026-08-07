import type { UserId } from '@/lib/domain/ids';
import type { Follow } from '@/features/profiles/types/follow.types';
import type { FollowRepository } from '@/features/profiles/repositories/follow.repository';

export class MockFollowRepository implements FollowRepository {
  private follows = new Map<string, Follow>();

  private key(followerId: UserId, followingId: UserId): string {
    return `${followerId}:${followingId}`;
  }

  async follow(followerId: UserId, followingId: UserId): Promise<void> {
    if (followerId === followingId) return;
    const id = this.key(followerId, followingId);
    if (this.follows.has(id)) return;
    this.follows.set(id, {
      id: crypto.randomUUID(),
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
  }

  async unfollow(followerId: UserId, followingId: UserId): Promise<void> {
    this.follows.delete(this.key(followerId, followingId));
  }

  async isFollowing(followerId: UserId, followingId: UserId): Promise<boolean> {
    return this.follows.has(this.key(followerId, followingId));
  }

  async countFollowers(userId: UserId): Promise<number> {
    return [...this.follows.values()].filter((f) => f.followingId === userId).length;
  }

  async countFollowing(userId: UserId): Promise<number> {
    return [...this.follows.values()].filter((f) => f.followerId === userId).length;
  }

  async listFollowingIds(userId: UserId, limit = 50): Promise<UserId[]> {
    return [...this.follows.values()]
      .filter((f) => f.followerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((f) => f.followingId);
  }

  async listFollowerIds(userId: UserId, limit = 50): Promise<UserId[]> {
    return [...this.follows.values()]
      .filter((f) => f.followingId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((f) => f.followerId);
  }
}
