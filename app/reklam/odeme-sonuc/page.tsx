import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADS_ROUTES } from '@/features/ads/constants/ad-inquiry.constants';

export const metadata: Metadata = {
  title: 'Ödeme sonucu — Girisimco',
  robots: { index: false, follow: false },
};

export default function ReklamOdemeSonucPage({
  searchParams,
}: {
  searchParams: { status?: string; itemId?: string; message?: string };
}) {
  const ok = searchParams.status === 'ok';
  const itemId = searchParams.itemId;
  const message = searchParams.message;

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      {ok ? (
        <>
          <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-semibold">Reklamınız yayınlandı</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            5.000 TL ödemeniz alındı. Kartınız MARKET alanında yayında.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {itemId ? (
              <Button asChild className="rounded-xl">
                <Link href={`/market/${itemId}`}>Kartı görüntüle</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={ADS_ROUTES.market}>MARKET’e git</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <XCircle className="h-12 w-12 text-destructive" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-semibold">Ödeme tamamlanamadı</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {message || 'Ödeme doğrulanamadı. Tekrar deneyebilir veya destek ile iletişime geçebilirsiniz.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link href={ADS_ROUTES.public}>Tekrar dene</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={ADS_ROUTES.market}>MARKET’e dön</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
