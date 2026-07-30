import { GcSkeleton } from '@/components/girisimco/ui/gc-skeleton';
import { cn } from '@/lib/utils';

interface ListingCardSkeletonProps {
  className?: string;
  compact?: boolean;
}

export function ListingCardSkeleton({ className, compact }: ListingCardSkeletonProps) {
  return (
    <div className={cn('gc-card overflow-hidden p-4', compact ? 'rounded-xl' : 'rounded-2xl', className)}>
      <div className="flex items-start gap-3">
        <GcSkeleton variant="circular" className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <GcSkeleton variant="text" className="h-4 w-3/5" />
          <GcSkeleton variant="text" className="h-3 w-2/5" />
          <GcSkeleton variant="text" className="h-3 w-full" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <GcSkeleton variant="text" className="h-5 w-16" />
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
