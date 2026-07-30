import { ShimmerBar } from '@/components/feedback/motion';
import { cn } from '@/lib/utils';

export function LoadingOverlay({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {label}
    </div>
  );
}

export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 px-3">
        {Array.from({ length: columns }).map((_, c) => (
          <ShimmerBar key={c} className={cn('h-4', c === 0 ? 'flex-1' : 'w-24')} />
        ))}
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-3 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <ShimmerBar key={c} className={cn('h-4', c === 0 ? 'flex-1' : 'w-24')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <ShimmerBar className="h-32 w-full rounded-lg" />
          <ShimmerBar className="h-4 w-2/3" />
          <ShimmerBar className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <ShimmerBar className="h-6 w-16 rounded-full" />
            <ShimmerBar className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <ShimmerBar className="h-3 w-20" />
      <ShimmerBar className="h-8 w-28" />
      <ShimmerBar className="h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <ShimmerBar className="h-4 w-32" />
        <ShimmerBar className="h-7 w-24 rounded-md" />
      </div>
      <ShimmerBar className="h-56 w-full rounded-lg" />
      <div className="flex justify-between">
        <ShimmerBar className="h-3 w-12" />
        <ShimmerBar className="h-3 w-12" />
        <ShimmerBar className="h-3 w-12" />
        <ShimmerBar className="h-3 w-12" />
      </div>
    </div>
  );
}
