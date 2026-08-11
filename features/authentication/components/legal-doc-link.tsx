import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Opens legal docs in a new tab so wizard/forms keep state. */
export function LegalDocLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'font-medium text-primary underline-offset-4 hover:underline',
        className,
      )}
      onClick={(event) => {
        // Prevent parent label/checkbox from toggling when the link is clicked.
        event.stopPropagation();
      }}
    >
      {children}
    </Link>
  );
}
