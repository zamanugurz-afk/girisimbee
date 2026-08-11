'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { OAUTH_LEGAL_ACCEPTANCE_PATH } from '@/features/authentication/lib/oauth-bootstrap';

const PKCE_FLOW_ID_PARAM = 'sb_flow_id';

function safeNext(value: string | null): string {
  if (!value) return AUTH_ROUTES.home;
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') ? decoded : AUTH_ROUTES.home;
  } catch {
    return AUTH_ROUTES.home;
  }
}

/**
 * Browser-side PKCE exchange fallback.
 * Used when the Route Handler cannot read the code_verifier cookie
 * (host split / cookie timing). Runs where document.cookie is visible.
 */
function PkceExchange() {
  const params = useSearchParams();
  const [message, setMessage] = useState('Google girişi tamamlanıyor…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const code = params.get('code');
      const flowId = params.get(PKCE_FLOW_ID_PARAM);
      const next = safeNext(params.get('next'));
      const emailVerify = params.get('flow') === 'email';

      if (!code) {
        window.location.replace(
          `${AUTH_ROUTES.login}?error=auth_callback_failed&message=${encodeURIComponent(
            'Google dönüşünde yetkilendirme kodu yok.',
          )}`,
        );
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(
          code,
          flowId ? { flowId } : undefined,
        );
        if (cancelled) return;

        if (error) {
          const friendly = /pkce code verifier not found/i.test(error.message)
            ? 'Google oturumu bu tarayıcıda başlatılmamış veya çerezler temizlenmiş. Lütfen Google ile girişi yeniden deneyin.'
            : error.message;
          window.location.replace(
            `${AUTH_ROUTES.login}?error=auth_callback_failed&message=${encodeURIComponent(friendly)}`,
          );
          return;
        }

        if (emailVerify) {
          window.location.replace(AUTH_ROUTES.verifySuccess);
          return;
        }

        const passwordRecovery =
          params.get('type') === 'recovery'
          || next === AUTH_ROUTES.resetPassword
          || next === AUTH_ROUTES.resetPasswordLegacy;

        // Recovery session is only for choosing a new password — skip legal gate.
        if (passwordRecovery) {
          window.location.replace(AUTH_ROUTES.resetPassword);
          return;
        }

        // New / incomplete legal acceptance → gate; otherwise destination.
        window.location.replace(
          `${OAUTH_LEGAL_ACCEPTANCE_PATH}?next=${encodeURIComponent(next)}`,
        );
      } catch (error) {
        if (cancelled) return;
        const msg =
          error instanceof Error ? error.message : 'Google girişi tamamlanamadı.';
        setMessage(msg);
        window.location.replace(
          `${AUTH_ROUTES.login}?error=auth_callback_failed&message=${encodeURIComponent(msg)}`,
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}

export default function AuthPkcePage() {
  return (
    <Suspense fallback={<main className="p-8 text-center text-sm text-muted-foreground">Yükleniyor…</main>}>
      <PkceExchange />
    </Suspense>
  );
}
