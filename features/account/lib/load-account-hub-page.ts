import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { loadAccountProfilePage } from '@/features/account/lib/load-account-profile-page';
import type { AccountProfilePageLoadResult } from '@/features/account/types/account-profile-page.types';
import type { AccountHubViewModel } from '@/features/account/types/account-hub.types';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';
import { EMPTY_ACCOUNT_HUB_STATS } from '@/features/account/types/account-panel.constants';
import type { SessionUser } from '@/features/authentication/types/auth.types';

/** Assemble hub overview from Auth session + account + marketplace profile services. */
export async function loadAccountHubPage(sessionUser: SessionUser): Promise<{
  view: AccountHubViewModel;
  stats: AccountHubStats;
}> {
  const userId = ids.user(sessionUser.id);
  const stats: AccountHubStats = { ...EMPTY_ACCOUNT_HUB_STATS };

  let account: AccountProfilePageLoadResult = {
    ok: false,
    error: 'unavailable',
  };
  let marketplace: {
    username: string | null;
    displayName: string;
    phone: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
  } | null = null;

  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);

    const [accountResult, profile, listings, favorites, followers, following] = await Promise.all([
      loadAccountProfilePage(sessionUser.id),
      container.profileService.getByUserId(userId).catch(() => null),
      container.listingRepository.count({ ownerId: userId }).catch(() => 0),
      container.favoriteRepository.count({ userId }).catch(() => 0),
      container.followRepository.countFollowers(userId).catch(() => 0),
      container.followRepository.countFollowing(userId).catch(() => 0),
    ]);

    account = accountResult;

    if (profile) {
      marketplace = {
        username: profile.username,
        displayName: profile.displayName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
      };
    }

    stats.listings = typeof listings === 'number' ? listings : 0;
    stats.favorites = typeof favorites === 'number' ? favorites : 0;
    stats.followers = typeof followers === 'number' ? followers : 0;
    stats.following = typeof following === 'number' ? following : 0;
  } catch {
    // Keep zeros / account-only view when marketplace tables are unavailable.
    account = await loadAccountProfilePage(sessionUser.id).catch(() => account);
  }

  const accountProfile = account.ok ? account.data.profile : null;

  const firstLast = [accountProfile?.firstName, accountProfile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Auth email confirmation is source of truth for the hub badge.
  const emailVerified = Boolean(
    sessionUser.emailVerified || accountProfile?.emailVerified,
  );

  const view: AccountHubViewModel = {
    displayName:
      marketplace?.displayName
      || firstLast
      || sessionUser.displayName
      || sessionUser.email.split('@')[0]
      || 'Kullanıcı',
    username:
      marketplace?.username
      || accountProfile?.username
      || sessionUser.username
      || null,
    email: sessionUser.email || accountProfile?.email || null,
    phone: marketplace?.phone || accountProfile?.phone || null,
    avatarUrl: marketplace?.avatarUrl || sessionUser.avatarUrl || null,
    coverUrl: marketplace?.coverUrl || null,
    emailVerified,
    phoneVerified: accountProfile?.phoneVerified ?? false,
    followersCount: stats.followers,
    followingCount: stats.following,
  };

  return { view, stats };
}
