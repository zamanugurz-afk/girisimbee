import { cn } from '@/lib/utils';

export function AccountLoadingSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)} aria-busy aria-label="Yükleniyor">
      <div className="h-40 animate-pulse rounded-2xl bg-muted/70" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/70" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} className="h-36 animate-pulse rounded-2xl bg-muted/70" />
      ))}
    </div>
  );
}
