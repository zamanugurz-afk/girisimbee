import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] flex-col overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,92,246,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(108,99,255,0.10),_transparent_45%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <Link href="/" className="mb-8 inline-flex">
          <BrandWordmark />
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          Sayfa bulunamadı
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/">Ana sayfa</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/kesfet">Keşfet</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
