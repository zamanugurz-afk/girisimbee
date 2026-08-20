import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Shared Hesap Merkezi card — mirrors site `.gc-card` language. */
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
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900/90 text-foreground',
        className,
      )}
    >
      {children}
    </Comp>
  );
}
