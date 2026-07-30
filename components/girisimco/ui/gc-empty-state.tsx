import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { gcIconSize, type GcIconSize } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface GcEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  compact?: boolean;
  className?: string;
}

export function GcEmptyState({
  icon: Icon,
  title,
  description,
  cta,
  compact,
  className,
}: GcEmptyStateProps) {
  return (
    <div
      className={cn(
        'gc-empty',
        compact ? 'px-5 py-10' : 'px-6 py-16',
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-xl border border-border/80 bg-card shadow-soft',
          compact ? 'h-11 w-11' : 'h-12 w-12',
        )}
        aria-hidden
      >
        <Icon className={cn(gcIconSize.md, 'text-primary/70')} />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      {cta && (
        <Button asChild size="sm" className="mt-5">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}

export function GcIcon({
  icon: Icon,
  size = 'sm',
  className,
  label,
}: {
  icon: LucideIcon;
  size?: GcIconSize;
  className?: string;
  label?: string;
}) {
  return (
    <Icon
      className={cn(gcIconSize[size], 'shrink-0', className)}
      aria-hidden={!label}
      aria-label={label}
    />
  );
}
