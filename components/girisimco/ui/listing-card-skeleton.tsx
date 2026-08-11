import { GcSkeleton } from '@/components/girisimco/ui/gc-skeleton';
import { cn } from '@/lib/utils';

interface ListingCardSkeletonProps {
  className?: string;
  compact?: boolean;
}

export function ListingCardSkeleton({ className }: ListingCardSkeletonProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border border-[#E6E8EE] bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-border dark:bg-card',
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-[#E6E8EE]" aria-hidden />
      <GcSkeleton variant="text" className="mb-3 h-4 w-24" />
      <GcSkeleton variant="text" className="h-4 w-4/5" />
      <div className="mt-2 space-y-1.5">
        <GcSkeleton variant="text" className="h-3 w-full" />
        <GcSkeleton variant="text" className="h-3 w-11/12" />
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-[#EEF0F4] pt-2.5">
        <GcSkeleton variant="text" className="h-3 w-16" />
        <GcSkeleton variant="text" className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ListingFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2"
      aria-busy="true"
      aria-label="İlanlar yükleniyor"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
