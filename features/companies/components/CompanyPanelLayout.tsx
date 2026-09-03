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
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/[0.05] via-transparent to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 gc-dot-grid opacity-20" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1680px] px-3 sm:px-6 py-3 sm:py-4">
        {children}
      </div>
    </div>
  );
}
