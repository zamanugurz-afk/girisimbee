import { cn } from '@/lib/utils';

export function AdminDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-6 px-5 py-6 lg:px-8', className)}
      role="status"
      aria-live="polite"
      aria-label="Yönetim merkezi yükleniyor"
    >
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/80" />
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted/70" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-muted/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`card-${index}`}
            className="h-28 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`chart-${index}`}
            className="h-64 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5" />
        <div className="h-80 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`bottom-${index}`}
            className="h-72 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5"
          />
        ))}
      </div>

      <span className="sr-only">Yönetim merkezi yükleniyor</span>
    </div>
  );
}
