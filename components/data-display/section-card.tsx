'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
  noPadding,
}: SectionCardProps) {
  return (
    <section className={cn('ib-card overflow-hidden', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(!noPadding && 'p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
