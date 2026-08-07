'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Hata</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyebilir veya ana sayfaya
        dönebilirsiniz.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button type="button" className="rounded-xl" onClick={reset}>
          Tekrar dene
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Ana sayfa</Link>
        </Button>
      </div>
    </main>
  );
}
