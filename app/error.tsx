'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);

    // Auto-recover from stale deployment chunks
    if (typeof window !== 'undefined') {
      const msg = (error?.message || '').toLowerCase();
      if (
        msg.includes('chunkloaderror') ||
        msg.includes('loading chunk') ||
        msg.includes('failed to fetch') ||
        msg.includes('mime type') ||
        msg.includes('unexpected token')
      ) {
        const lastAutoReload = sessionStorage.getItem('last_chunk_reload');
        const now = Date.now();
        if (!lastAutoReload || now - Number(lastAutoReload) > 10000) {
          sessionStorage.setItem('last_chunk_reload', String(now));
          window.location.reload();
        }
      }
    }
  }, [error]);

  function handleRetry() {
    if (typeof window !== 'undefined') {
      window.location.reload();
      return;
    }
    reset();
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-destructive">HATA</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-foreground tracking-tight">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Sayfa yüklenirken veya yeni sürüm güncellenirken bir gecikme oluştu. Sayfayı yenileyerek devam edebilirsiniz.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" className="rounded-xl flex items-center gap-2 font-medium" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4" />
          <span>Sayfayı Yenile</span>
        </Button>
        <Button asChild variant="outline" className="rounded-xl flex items-center gap-2 font-medium">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
