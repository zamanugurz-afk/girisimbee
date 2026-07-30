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
