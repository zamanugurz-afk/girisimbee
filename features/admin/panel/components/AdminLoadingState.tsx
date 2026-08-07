import { cn } from '@/lib/utils';

export function AdminLoadingState({
  className,
  rows = 4,
  label = 'Yükleniyor…',
}: {
  className?: string;
  rows?: number;
  label?: string;
}) {
  return (
    <div
      className={cn('space-y-4 px-5 py-6 lg:px-8', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/80" />
      <div className="h-8 w-64 animate-pulse rounded-lg bg-muted/70" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl border border-border/50 bg-muted/50 dark:border-white/5"
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
