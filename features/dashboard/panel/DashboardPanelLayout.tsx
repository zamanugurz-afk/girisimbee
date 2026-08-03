import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/features/dashboard/panel/DashboardSidebar';

/** User dashboard shell — separate from /admin AdminLayout. */
export function DashboardPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden w-64 shrink-0 md:block lg:w-72">
          <div className="sticky top-0 h-screen">
            <DashboardSidebar />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border/80 md:hidden dark:border-white/10">
            <div className="max-h-64 overflow-y-auto">
              <DashboardSidebar />
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
