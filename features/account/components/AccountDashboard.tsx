import { AccountHubProfileHero } from '@/features/account/components/AccountHubProfileHero';
import { AccountHubStatsGrid } from '@/features/account/components/AccountHubStatsGrid';
import { AccountHubProfileInfo } from '@/features/account/components/AccountHubProfileInfo';
import { AccountHubVerification } from '@/features/account/components/AccountHubVerification';
import { AccountHubPrivacy } from '@/features/account/components/AccountHubPrivacy';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';
import type { AccountHubViewModel } from '@/features/account/types/account-hub.types';

export function AccountDashboard({
  view,
  stats,
}: {
  view: AccountHubViewModel;
  stats: AccountHubStats;
}) {
  return (
    <div className="space-y-6">
      <AccountHubProfileHero
        displayName={view.displayName}
        username={view.username}
        avatarUrl={view.avatarUrl}
        coverUrl={view.coverUrl}
      />

      <AccountHubStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <AccountHubProfileInfo
          fullName={view.displayName}
          username={view.username}
          phone={view.phone}
          linkedIn={view.linkedInUrl}
          website={view.website}
        />
        <AccountHubVerification
          emailVerified={view.emailVerified}
          phoneVerified={view.phoneVerified}
          userVerified={view.userVerified}
          investorVerified={view.investorVerified}
        />
      </div>

      <AccountHubPrivacy
        emailVisible={view.emailVisible}
        phoneVisible={view.phoneVisible}
        linkedInVisible={view.linkedInVisible}
        websiteVisible={view.websiteVisible}
      />
    </div>
  );
}
