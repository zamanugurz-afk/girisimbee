import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserId } from '@/lib/domain/ids';
import type { FollowRepository } from '@/features/profiles/repositories/follow.repository';

const TABLE = 'marketplace_follows';

export class SupabaseFollowRepository implements FollowRepository {
  constructor(private supabase: SupabaseClient) {}

  async follow(followerId: UserId, followingId: UserId): Promise<void> {
    const { error } = await this.supabase.from(TABLE).insert({
      follower_id: followerId,
      following_id: followingId,
    });
    if (error && error.code !== '23505') throw error;
  }

  async unfollow(followerId: UserId, followingId: UserId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE)
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  }

  async isFollowing(followerId: UserId, followingId: UserId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async countFollowers(userId: UserId): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    if (error) throw error;
    return count ?? 0;
  }

  async countFollowing(userId: UserId): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    if (error) throw error;
    return count ?? 0;
  }
}
