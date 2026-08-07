import { GcSkeleton } from '@/components/girisimco/ui/gc-skeleton';
import { cn } from '@/lib/utils';

interface ListingCardSkeletonProps {
  className?: string;
  compact?: boolean;
}

export function ListingCardSkeleton({ className, compact }: ListingCardSkeletonProps) {
  return (
    <div className={cn('gc-card flex min-h-[15.5rem] flex-col overflow-hidden p-4', compact ? 'rounded-xl' : 'rounded-2xl', className)}>
      <GcSkeleton variant="text" className="mb-3 h-5 w-32" />
      <GcSkeleton variant="text" className="h-4 w-4/5" />
      <div className="mt-2 space-y-1.5">
        <GcSkeleton variant="text" className="h-3 w-full" />
        <GcSkeleton variant="text" className="h-3 w-11/12" />
      </div>
      <div className="mt-2 space-y-1.5">
        <GcSkeleton variant="text" className="h-3 w-2/5" />
        <GcSkeleton variant="text" className="h-3 w-1/3" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-3">
        <GcSkeleton variant="text" className="h-3 w-16" />
        <GcSkeleton variant="text" className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ListingFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2" aria-busy="true" aria-label="İlanlar yükleniyor">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
