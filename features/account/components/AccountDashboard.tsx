import { AccountHubProfileHero } from '@/features/account/components/AccountHubProfileHero';
import { AccountHubStatsGrid } from '@/features/account/components/AccountHubStatsGrid';
import { AccountCockpitShortcuts } from '@/features/account/components/AccountCockpitShortcuts';
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
        coverUrl={view.coverUrl}
        emailVerified={view.emailVerified}
      />

      <AccountHubStatsGrid stats={stats} />

      <AccountCockpitShortcuts />
    </div>
  );
}
