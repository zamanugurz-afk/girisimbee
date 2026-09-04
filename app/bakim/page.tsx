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
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.08),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="gc-dot-grid pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <div className="mb-8 inline-flex items-center gap-3">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xl shadow-xs">
              G
            </span>
          </span>
          <BrandWordmark className="text-3xl font-extrabold tracking-tight sm:text-4xl" />
        </div>

        <p className="mb-4 inline-flex items-center rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 border border-emerald-500/20">
          Geliştirme & Yapım Aşamasında
        </p>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Çok Yakında Buradayız
        </h1>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
          Girişimbee platformu şu anda kapalı devre geliştirme aşamasındadır.
          Tüm özelliklerimiz tamamlandığında çok yakında sizlerle buluşacağız.
        </p>

        <div className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <p className="mt-6 text-sm text-slate-500">
          Bizi takipte kalın — resmi açılışımız yakında duyurulacaktır.
        </p>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {BRAND_NAME} · Tüm Hakları Saklıdır.
      </footer>
    </main>
  );
}
