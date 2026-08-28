import type { Metadata } from 'next';
import { GirisimbeeLogo } from '@/components/girisimco/logo';
import { BRAND_NAME } from '@/features/shared/constants/brand';
import { MaintenanceUnlockForm } from '@/components/girisimco/maintenance-unlock-form';

export const metadata: Metadata = {
  title: `Çok Yakında — ${BRAND_NAME}`,
  description:
    'Girisimbee yenileniyor: yeni logo ve yeni yapıyla çok yakında yayında.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(91,92,246,0.12),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="gc-dot-grid pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <div className="mb-10 inline-flex animate-[gc-maint-fade_0.7s_ease-out_both] items-center gap-0 scale-125 sm:scale-150">
          <GirisimbeeLogo />
        </div>

        <h1 className="animate-[gc-maint-fade_0.85s_ease-out_0.12s_both] font-display text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
          Çok Yakında Buradayız
        </h1>

        <div className="mt-8 h-px w-24 animate-[gc-maint-fade_1s_ease-out_0.25s_both] bg-gradient-to-r from-transparent via-[#F59E0B]/60 to-transparent" />

        <MaintenanceUnlockForm />
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} {BRAND_NAME}
      </footer>
    </main>
  );
}
