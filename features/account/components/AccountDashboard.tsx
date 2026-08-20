import { AccountHubProfileHero } from '@/features/account/components/AccountHubProfileHero';
import { AccountHubStatsGrid } from '@/features/account/components/AccountHubStatsGrid';
import { AccountHubProfileInfo } from '@/features/account/components/AccountHubProfileInfo';
import { AccountHubVerification } from '@/features/account/components/AccountHubVerification';
import { AccountFollowersCard } from '@/features/account/components/AccountFollowersCard';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';
import type { AccountHubViewModel } from '@/features/account/types/account-hub.types';
import type { FollowNetworkUser } from '@/features/profiles/types/follow.types';

export function AccountDashboard({
  view,
  stats,
  followers = [],
  following = [],
  followersCount = 0,
  followingCount = 0,
}: {
  view: AccountHubViewModel;
  stats: AccountHubStats;
  followers?: FollowNetworkUser[];
  following?: FollowNetworkUser[];
  followersCount?: number;
  followingCount?: number;
}) {
  return (
    <div className="space-y-6">
      <AccountHubProfileHero
        displayName={view.displayName}
        username={view.username}
        coverUrl={view.coverUrl}
        emailVerified={view.emailVerified}
      />

      <AccountHubStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <AccountFollowersCard
          followers={followers}
          following={following}
          followersCount={followersCount}
          followingCount={followingCount}
        />
        <AccountHubVerification
          emailVerified={view.emailVerified}
          phoneVerified={view.phoneVerified}
        />
      </div>

      <AccountHubProfileInfo
        fullName={view.displayName}
        username={view.username}
        email={view.email}
        phone={view.phone}
      />
    </div>
  );
}
