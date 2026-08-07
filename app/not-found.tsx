import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">Sayfa bulunamadı</h1>
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
    </main>
  );
}
