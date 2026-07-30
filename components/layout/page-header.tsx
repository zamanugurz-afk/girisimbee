'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumbs, type Crumb } from '@/components/layout/breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  crumbs,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        {Icon ? (
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/20">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          {crumbs && crumbs.length > 0 && (
            <Breadcrumbs items={crumbs} className="mb-2" />
          )}
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground text-balance">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
