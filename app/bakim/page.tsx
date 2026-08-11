import type { Metadata } from 'next';
import { BrandMarkSlot } from '@/components/girisimco/brand-mark-slot';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { BRAND_NAME } from '@/features/shared/constants/brand';

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
        <div className="mb-10 inline-flex animate-[gc-maint-fade_0.7s_ease-out_both] items-center gap-0">
          <BrandMarkSlot size={52} priority className="-mr-1" />
          <BrandWordmark className="font-display text-3xl font-bold tracking-tight sm:text-4xl" />
        </div>

        <p className="mb-4 inline-flex animate-[gc-maint-fade_0.8s_ease-out_0.08s_both] items-center rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#B45309]">
          Yenileniyoruz
        </p>

        <h1 className="animate-[gc-maint-fade_0.85s_ease-out_0.12s_both] font-display text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
          Çok Yakında Buradayız
        </h1>

        <p className="mt-5 max-w-xl animate-[gc-maint-fade_0.9s_ease-out_0.18s_both] text-base leading-relaxed text-[#334155] sm:text-lg">
          Yeni <span className="font-semibold text-[#0F172A]">Girisimbee</span> logomuz ve
          yenilenen yapıyla en kısa sürede yeniden açıyoruz. Yatırım, ortaklık, iş, franchise ve
          dijital çözümleri tek platformda buluşturan deneyim için son hazırlıklarımız devam
          ediyor.
        </p>

        <div className="mt-10 h-px w-24 animate-[gc-maint-fade_1s_ease-out_0.25s_both] bg-gradient-to-r from-transparent via-[#F59E0B]/60 to-transparent" />

        <p className="mt-8 animate-[gc-maint-fade_1s_ease-out_0.3s_both] text-sm text-[#64748B]">
          Hazır olduğumuzda buradan duyuracağız.
        </p>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} {BRAND_NAME}
      </footer>
    </main>
  );
}
