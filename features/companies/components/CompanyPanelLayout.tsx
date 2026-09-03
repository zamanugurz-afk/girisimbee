import type { ReactNode } from 'react';
import { CompanySidebar } from '@/features/companies/components/CompanySidebar';

interface CompanyPanelLayoutProps {
  slug: string;
  children: ReactNode;
}

/**
 * Company Dashboard Layout — matches the exact architecture of User Dashboard (/dashboard)
 * with sticky corporate sidebar, background grid, and responsive container.
 */
export function CompanyPanelLayout({ slug, children }: CompanyPanelLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.05] via-transparent to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1780px] px-4 sm:px-6 lg:px-8">
        {/* Desktop Sticky Sidebar */}
        <div className="hidden w-64 shrink-0 md:block lg:w-72">
          <div className="sticky top-0 h-screen">
            <CompanySidebar slug={slug} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Accordion Header */}
          <div className="border-b border-border/80 md:hidden dark:border-white/10">
            <div className="max-h-64 overflow-y-auto">
              <CompanySidebar slug={slug} />
            </div>
          </div>

          <div className="flex-1 py-8 sm:py-10 px-0 sm:px-4 lg:px-8 max-w-6xl w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
