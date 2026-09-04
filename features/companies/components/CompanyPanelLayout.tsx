import type { ReactNode } from 'react';

interface CompanyPanelLayoutProps {
  slug?: string;
  children: ReactNode;
}

/**
 * Company Dashboard Layout — clean, full-width single-page corporate layout.
 */
export function CompanyPanelLayout({ children }: CompanyPanelLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background gc-header-offset flex flex-col justify-center">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.05] via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16 my-auto">
        {children}
      </div>
    </div>
  );
}
