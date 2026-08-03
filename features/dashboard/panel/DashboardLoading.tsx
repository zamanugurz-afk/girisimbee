import { AccountLoadingSkeleton } from '@/features/account/components/AccountLoadingSkeleton';

export function DashboardLoading() {
  return (
    <div className="px-5 py-8 sm:px-8">
      <AccountLoadingSkeleton />
    </div>
  );
}
