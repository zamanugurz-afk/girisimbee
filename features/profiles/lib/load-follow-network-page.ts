import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import type { FollowNetworkUser } from '@/features/profiles/types/follow.types';

export async function loadFollowNetworkPage(userId: string): Promise<{
  followers: FollowNetworkUser[];
  following: FollowNetworkUser[];
  followersCount: number;
  followingCount: number;
}> {
  const empty = {
    followers: [] as FollowNetworkUser[],
    following: [] as FollowNetworkUser[],
    followersCount: 0,
    followingCount: 0,
  };

  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const uid = ids.user(userId);

    const [followers, following, followersCount, followingCount] = await Promise.all([
      container.profileService.listFollowers(uid, 50),
      container.profileService.listFollowing(uid, 50),
      container.profileService.countFollowers(uid),
      container.profileService.countFollowing(uid),
    ]);

    return { followers, following, followersCount, followingCount };
  } catch {
    return empty;
  }
}
