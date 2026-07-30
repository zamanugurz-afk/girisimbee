import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
}

/** Shown on profiles/listings when premium tier is active. Hidden during MVP. */
export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white',
        className,
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      Premium
    </span>
  );
}
