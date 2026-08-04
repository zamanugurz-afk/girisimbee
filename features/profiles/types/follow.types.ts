import type { UserId } from '@/lib/domain/ids';

export interface Follow {
  id: string;
  followerId: UserId;
  followingId: UserId;
  createdAt: string;
}

export interface FollowFilter {
  followerId?: UserId;
  followingId?: UserId;
}

/** Compact profile row for follower / following lists. */
export interface FollowNetworkUser {
  userId: UserId;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  headline: string | null;
  listingsCount: number;
  href: string | null;
}
