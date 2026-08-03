import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { ids } from '@/lib/domain/ids';
import { loadAccountProfilePage } from '@/features/account/lib/load-account-profile-page';
import type { AccountHubViewModel } from '@/features/account/types/account-hub.types';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';
import { EMPTY_ACCOUNT_HUB_STATS } from '@/features/account/types/account-panel.constants';
import type { SessionUser } from '@/features/authentication/types/auth.types';

/** Assemble hub overview from existing account + marketplace profile services. */
export async function loadAccountHubPage(sessionUser: SessionUser): Promise<{
  view: AccountHubViewModel;
  stats: AccountHubStats;
}> {
  const account = await loadAccountProfilePage(sessionUser.id);
  const accountProfile = account.ok ? account.data.profile : null;

  let marketplace: {
    username: string | null;
    displayName: string;
    phone: string | null;
    linkedInUrl: string | null;
    website: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    isVerified: boolean;
    investorVerified: boolean;
    emailVisible: boolean;
    phoneVisible: boolean;
    websiteVisible: boolean;
  } | null = null;

  const stats: AccountHubStats = { ...EMPTY_ACCOUNT_HUB_STATS };

  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const userId = ids.user(sessionUser.id);
    const profile = await container.profileService.findByUserId(userId);
    if (profile) {
      marketplace = {
        username: profile.username,
        displayName: profile.displayName,
        phone: profile.phone,
        linkedInUrl: profile.linkedInUrl,
        website: profile.website,
        avatarUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
        isVerified: profile.isVerified,
        investorVerified: profile.investorVerified,
        emailVisible: profile.emailVisible,
        phoneVisible: profile.phoneVisible,
        websiteVisible: profile.websiteVisible,
      };

      const [listings, favorites, followers] = await Promise.all([
        container.listingRepository.count({ ownerId: userId }).catch(() => 0),
        container.favoriteRepository.count({ userId }).catch(() => 0),
        container.followRepository.countFollowers(userId).catch(() => 0),
      ]);

      stats.listings = typeof listings === 'number' ? listings : 0;
      stats.favorites = typeof favorites === 'number' ? favorites : 0;
      stats.followers = typeof followers === 'number' ? followers : 0;
    }
  } catch {
    // Keep zeros / account-only view when marketplace tables are unavailable.
  }

  const firstLast = [accountProfile?.firstName, accountProfile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

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
    phone: marketplace?.phone || accountProfile?.phone || null,
    linkedInUrl: marketplace?.linkedInUrl || null,
    website: marketplace?.website || null,
    avatarUrl: marketplace?.avatarUrl || sessionUser.avatarUrl || null,
    coverUrl: marketplace?.coverUrl || null,
    emailVerified: accountProfile?.emailVerified ?? sessionUser.emailVerified,
    phoneVerified: accountProfile?.phoneVerified ?? false,
    userVerified: marketplace?.isVerified ?? false,
    investorVerified: marketplace?.investorVerified ?? false,
    emailVisible: marketplace?.emailVisible ?? false,
    phoneVisible: marketplace?.phoneVisible ?? false,
    linkedInVisible: marketplace?.websiteVisible ?? false,
    websiteVisible: marketplace?.websiteVisible ?? true,
  };

  return { view, stats };
}
