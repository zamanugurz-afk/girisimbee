import type { Metadata } from 'next';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { BRAND_NAME } from '@/features/shared/constants/brand';

export const metadata: Metadata = {
  title: `Çok Yakında — ${BRAND_NAME}`,
  description:
    'Girişimbee şu anda geliştirme aşamasında. Çok yakında yeniden buradayız.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,92,246,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(108,99,255,0.10),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="gc-dot-grid pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <div className="mb-10 inline-flex animate-[gc-maint-fade_0.7s_ease-out_both] items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/[0.04]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] via-[#5B5CF6] to-[#6C63FF] shadow-sm">
              <span className="font-display text-sm font-bold leading-none text-white">G</span>
            </span>
          </span>
          <BrandWordmark className="font-display text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl" />
        </div>

        <p className="mb-4 inline-flex animate-[gc-maint-fade_0.8s_ease-out_0.08s_both] items-center rounded-full bg-[#5B5CF6]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B5CF6]">
          Yapım Aşamasında
        </p>

        <h1 className="animate-[gc-maint-fade_0.85s_ease-out_0.12s_both] font-display text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
          Çok Yakında Buradayız
        </h1>

        <p className="mt-5 max-w-xl animate-[gc-maint-fade_0.9s_ease-out_0.18s_both] text-base leading-relaxed text-[#334155] sm:text-lg">
          Girişimbee&apos;yi daha iyi bir deneyim için geliştiriyoruz. Girişimcileri, yatırımcıları,
          iş fırsatlarını ve doğru bağlantıları tek platformda buluşturmak için hazırlıklarımız
          devam ediyor.
        </p>

        <div className="mt-10 h-px w-24 animate-[gc-maint-fade_1s_ease-out_0.25s_both] bg-gradient-to-r from-transparent via-[#5B5CF6]/50 to-transparent" />

        <p className="mt-8 animate-[gc-maint-fade_1s_ease-out_0.3s_both] text-sm text-[#64748B]">
          Bizi takip edin — yakında duyuracağız.
        </p>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} {BRAND_NAME}
      </footer>
    </main>
  );
}
