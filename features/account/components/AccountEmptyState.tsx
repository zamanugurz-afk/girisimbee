import type { LucideIcon } from 'lucide-react';
import { GcEmptyState } from '@/components/girisimco/ui/gc-empty-state';
import { cn } from '@/lib/utils';

export function AccountEmptyState({
  icon,
  title,
  description,
  cta,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-border/80 bg-card/50 dark:border-white/10',
        className,
      )}
    >
      <GcEmptyState
        icon={icon}
        title={title}
        description={description}
        cta={cta}
        compact
      />
    </div>
  );
}
