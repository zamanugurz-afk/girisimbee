'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { openCookiePreferences } from '@/features/legal/components/CookieConsentBanner';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';

export default function CookiePreferencesPage() {
  useEffect(() => {
    openCookiePreferences();
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Çerez Tercihleri</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Tercih paneli açıldı. Görmüyorsanız aşağıdaki düğmeyi kullanın.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          onClick={() => openCookiePreferences()}
        >
          Tercihleri aç
        </button>
        <Link href={LEGAL_ROUTES.cookies} className="rounded-lg border px-4 py-2 text-sm">
          Çerez Politikası
        </Link>
      </div>
    </main>
  );
}
