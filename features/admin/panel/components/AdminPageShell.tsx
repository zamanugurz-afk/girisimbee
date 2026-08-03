import type { ReactNode } from 'react';
import { AdminBreadcrumb } from '@/features/admin/panel/components/AdminBreadcrumb';

export function AdminPageShell({
  title,
  description,
  children,
  toolbar,
  breadcrumbLabel,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  breadcrumbLabel?: string;
}) {
  return (
    <div>
      <div className="border-b border-border/80 px-5 py-5 dark:border-white/10 lg:px-8">
        <AdminBreadcrumb currentLabel={breadcrumbLabel ?? title} />
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-6 px-5 py-6 lg:px-8">
        {toolbar}
        {children}
      </div>
    </div>
  );
}
