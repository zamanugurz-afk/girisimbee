'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  ADMIN_BREADCRUMB_LABELS,
  ADMIN_PANEL_BASE,
} from '@/features/admin/panel/constants/admin-nav.constants';
import { cn } from '@/lib/utils';

export function AdminBreadcrumb({
  className,
  currentLabel,
}: {
  className?: string;
  /** Optional override for the last crumb. */
  currentLabel?: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: { href: string; label: string }[] = [];
  let href = '';
  for (const segment of segments) {
    href += `/${segment}`;
    const label =
      ADMIN_BREADCRUMB_LABELS[href] ??
      segment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    crumbs.push({ href, label });
  }

  if (crumbs.length === 0) {
    crumbs.push({ href: ADMIN_PANEL_BASE, label: 'Genel Bakış' });
  }

  if (currentLabel && crumbs.length > 0) {
    crumbs[crumbs.length - 1] = {
      ...crumbs[crumbs.length - 1],
      label: currentLabel,
    };
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm text-muted-foreground', className)}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="inline-flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden /> : null}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
