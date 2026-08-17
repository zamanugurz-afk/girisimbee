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
        'relative flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90',
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-slate-200 dark:bg-zinc-800" aria-hidden />
      <GcSkeleton variant="text" className="mb-3 h-4 w-24" />
      <GcSkeleton variant="text" className="h-4 w-4/5" />
      <div className="mt-2 space-y-1.5">
        <GcSkeleton variant="text" className="h-3 w-full" />
        <GcSkeleton variant="text" className="h-3 w-11/12" />
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 dark:border-zinc-800 pt-2.5">
        <GcSkeleton variant="text" className="h-3 w-16" />
        <GcSkeleton variant="text" className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ListingFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-8 sm:divide-x divide-slate-200 dark:divide-zinc-800"
      aria-busy="true"
      aria-label="İlanlar yükleniyor"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'relative h-full',
            i % 4 === 0
              ? 'sm:pr-4 lg:pr-3 sm:pl-0'
              : i % 4 === 3
              ? 'sm:pl-4 lg:pl-3 sm:pr-0'
              : 'sm:px-4 lg:px-3'
          )}
        >
          <ListingCardSkeleton />
        </div>
      ))}
    </div>
  );
}
