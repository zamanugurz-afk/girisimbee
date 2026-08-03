import { AccountLoadingSkeleton } from '@/features/account/components/AccountLoadingSkeleton';

export default function HesabimLoading() {
  return (
    <div className="px-5 py-8 sm:px-8">
      <AccountLoadingSkeleton />
    </div>
  );
}
