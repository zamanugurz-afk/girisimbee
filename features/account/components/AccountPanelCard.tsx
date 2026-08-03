import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Shared Hesap Merkezi card — 16px radius, equal height friendly, hover lift. */
export function AccountPanelCard({
  children,
  className,
  as: Comp = 'section',
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
  id?: string;
}) {
  return (
    <Comp
      id={id}
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
        'dark:border-white/10 dark:bg-card/80 dark:hover:border-primary/30',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
