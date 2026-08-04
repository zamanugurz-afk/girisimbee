import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForSession } from '@/features/authentication/services/supabase-auth.service';
import { ensureOAuthAccountBootstrap } from '@/features/authentication/lib/ensure-oauth-account-bootstrap';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? AUTH_ROUTES.dashboard;
  const oauthError = searchParams.get('error');
  const oauthDesc = searchParams.get('error_description');

  if (oauthError) {
    const msg = encodeURIComponent(oauthDesc || oauthError);
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=oauth_provider&message=${msg}`,
    );
  }

  if (code) {
    const supabase = createClient();
    const { error } = await exchangeCodeForSession(supabase, code);
    if (!error) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await ensureOAuthAccountBootstrap(user);
        }
      } catch (bootstrapError) {
        const message =
          bootstrapError instanceof Error
            ? bootstrapError.message
            : 'Hesap profili oluşturulamadı';
        return NextResponse.redirect(
          `${origin}${AUTH_ROUTES.login}?error=oauth_bootstrap&message=${encodeURIComponent(message)}`,
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=auth_callback_failed&message=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${AUTH_ROUTES.login}?error=auth_callback_failed`);
}
