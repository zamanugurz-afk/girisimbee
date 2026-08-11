'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { ACTIVE_COOKIE_CATEGORIES } from '@/features/legal/config/legal-cookie-inventory.config';
import {
  readCookiePrefs,
  writeCookiePrefs,
  openCookiePreferences,
} from '@/features/legal/lib/cookie-prefs';
import { cn } from '@/lib/utils';

export {
  readCookiePrefs,
  writeCookiePrefs,
  openCookiePreferences,
  DEFAULT_COOKIE_PREFS,
  type CookiePrefs,
} from '@/features/legal/lib/cookie-prefs';

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [functional, setFunctional] = useState(false);

  useEffect(() => {
    const existing = readCookiePrefs();
    if (!existing) setOpen(true);
  }, []);

  useEffect(() => {
    function onOpenPrefs() {
      setPrefsOpen(true);
      setOpen(true);
    }
    window.addEventListener('gc:open-cookie-prefs', onOpenPrefs);
    return () => window.removeEventListener('gc:open-cookie-prefs', onOpenPrefs);
  }, []);

  if (!open) return null;

  function acceptNecessaryOnly() {
    writeCookiePrefs({ functional: false, analytics: false, marketing: false });
    setOpen(false);
    setPrefsOpen(false);
  }

  function acceptAllActive() {
    writeCookiePrefs({
      functional: ACTIVE_COOKIE_CATEGORIES.includes('functional'),
      analytics: false,
      marketing: false,
    });
    setOpen(false);
    setPrefsOpen(false);
  }

  function savePrefs() {
    writeCookiePrefs({ functional, analytics: false, marketing: false });
    setOpen(false);
    setPrefsOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1.5 text-sm">
          <p className="font-medium text-foreground">Çerezler</p>
          <p className="text-muted-foreground">
            Oturum ve güvenlik için gerekli çerezler kullanılır. İşlevsel tercihler (ör. tema)
            varsayılan olarak kapalıdır. Analitik / pazarlama çerezleri şu an kullanılmamaktadır.{' '}
            <Link href={LEGAL_ROUTES.cookies} className="underline underline-offset-2">
              Çerez Politikası
            </Link>
          </p>
          {prefsOpen ? (
            <label className="mt-2 flex items-center gap-2 text-foreground">
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
              />
              İşlevsel çerezlere izin ver
            </label>
          ) : null}
        </div>
        <div className={cn('flex flex-wrap gap-2', prefsOpen && 'sm:pb-0.5')}>
          <Button type="button" variant="outline" size="sm" onClick={acceptNecessaryOnly}>
            Reddet
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPrefsOpen((v) => !v)}
          >
            Tercihler
          </Button>
          {prefsOpen ? (
            <Button type="button" size="sm" onClick={savePrefs}>
              Kaydet
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={acceptAllActive}>
              Kabul Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
