import { AccountHubProfileHero } from '@/features/account/components/AccountHubProfileHero';
import { AccountHubStatsGrid } from '@/features/account/components/AccountHubStatsGrid';
import { AccountHubProfileInfo } from '@/features/account/components/AccountHubProfileInfo';
import { AccountHubVerification } from '@/features/account/components/AccountHubVerification';
import { CareerProfileOverviewCard } from '@/features/career-profile/components/career-profile-overview-card';
import { AccountDashboardMatchingHighlights } from '@/features/account/components/AccountDashboardMatchingHighlights';
import type { AccountHubStats } from '@/features/account/types/account-panel.types';
import type { AccountHubViewModel } from '@/features/account/types/account-hub.types';
import type { CareerProfilePageData } from '@/features/career-profile/types';
import type { CareerMatchesResult } from '@/features/matching-engine/types';

export function AccountDashboard({
  view,
  stats,
  careerProfile,
  careerMatches,
}: {
  view: AccountHubViewModel;
  stats: AccountHubStats;
  careerProfile?: CareerProfilePageData;
  careerMatches?: CareerMatchesResult | null;
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

      <AccountDashboardMatchingHighlights careerMatches={careerMatches} />

      {careerProfile ? <CareerProfileOverviewCard data={careerProfile} /> : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <AccountHubProfileInfo
          fullName={view.displayName}
          username={view.username}
          email={view.email}
          phone={view.phone}
        />
        <AccountHubVerification
          emailVerified={view.emailVerified}
          phoneVerified={view.phoneVerified}
        />
      </div>
    </div>
  );
}
