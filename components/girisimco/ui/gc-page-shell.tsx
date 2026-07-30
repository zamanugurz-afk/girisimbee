import type { ReactNode } from 'react';
import { gcClasses, gcPageMaxWidth, gcPagePadding } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface GcPageShellProps {
  children: ReactNode;
  className?: string;
  /** Skip default header offset when page manages its own padding */
  noHeaderOffset?: boolean;
  narrow?: boolean;
}

/** Standard marketplace page container — consistent bg, width, padding. */
export function GcPageShell({
  children,
  className,
  noHeaderOffset,
  narrow,
}: GcPageShellProps) {
  return (
    <div
      className={cn(
        gcClasses.pageShell,
        !noHeaderOffset && gcClasses.headerOffset,
        className,
      )}
    >
      <div className={cn(narrow ? 'mx-auto max-w-3xl' : gcPageMaxWidth, gcPagePadding)}>
        {children}
      </div>
    </div>
  );
}
