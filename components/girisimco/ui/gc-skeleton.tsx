import { cn } from '@/lib/utils';

interface GcSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function GcSkeleton({ className, variant = 'rectangular', ...props }: GcSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Yükleniyor"
      className={cn(
        'gc-shimmer bg-muted/80',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded-md',
        variant === 'rectangular' && 'rounded-lg',
        className,
      )}
      {...props}
    />
  );
}

export function GcSkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <GcSkeleton
          key={i}
          variant="text"
          className={cn('h-3.5', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}
