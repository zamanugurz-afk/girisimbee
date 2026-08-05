import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { resolveSiteUrl } from '@/lib/site-url';

/**
 * Dev helper: shows what OAuth URL Supabase would generate (no redirect).
 * Optional: ?email=user@example.com — checks if that Auth user already exists.
 * GET /api/auth/oauth-diagnose
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const url = new URL(request.url);
  const emailQuery = url.searchParams.get('email')?.trim().toLowerCase() ?? '';
  const origin = url.origin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  const siteUrl = resolveSiteUrl();
  const redirectTo = `${origin}${AUTH_ROUTES.callback}`;
  const googleCallback = supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : null;

  let oauthUrl: string | null = null;
  let oauthError: string | null = null;
  let authorizeParams: Record<string, string> | null = null;
  let googleClientId: string | null = null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      oauthError = error.message;
    } else {
      oauthUrl = data.url ?? null;
      if (oauthUrl) {
        const u = new URL(oauthUrl);
        authorizeParams = Object.fromEntries(u.searchParams.entries());
        // Follow authorize → Google to read client_id (no credentials needed).
        try {
          const head = await fetch(oauthUrl, { redirect: 'manual' });
          const location = head.headers.get('location');
          if (location) {
            googleClientId = new URL(location).searchParams.get('client_id');
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e) {
    oauthError = e instanceof Error ? e.message : String(e);
  }

  let emailCheck: {
    email: string;
    found: boolean;
    id?: string;
    providers?: string[];
    createdAt?: string;
    emailConfirmedAt?: string | null;
    hasProfile?: boolean;
    note?: string;
  } | null = null;

  if (emailQuery) {
    try {
      const admin = createServiceRoleClient();
      let match: Awaited<
        ReturnType<typeof admin.auth.admin.listUsers>
      >['data']['users'][number] | undefined;

      // Prefer profile email → auth id, then fall back to paginated auth list.
      const { data: profileByEmail } = await admin
        .from('profiles')
        .select('id, email')
        .ilike('email', emailQuery)
        .maybeSingle();

      if (profileByEmail?.id) {
        const byId = await admin.auth.admin.getUserById(profileByEmail.id);
        match = byId.data.user ?? undefined;
      }

      if (!match) {
        for (let page = 1; page <= 5 && !match; page += 1) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
          if (error) {
            emailCheck = { email: emailQuery, found: false, note: error.message };
            break;
          }
          match = data.users.find((u) => u.email?.toLowerCase() === emailQuery);
          if (data.users.length < 200) break;
        }
      }

      if (!emailCheck) {
        if (!match) {
          emailCheck = {
            email: emailQuery,
            found: false,
            note: 'Auth.users içinde yok — Google başarılı olsa yeni kullanıcı oluşur.',
          };
        } else {
          const providers =
            (match.app_metadata?.providers as string[] | undefined)
            ?? (match.app_metadata?.provider ? [String(match.app_metadata.provider)] : []);
          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('id', match.id)
            .maybeSingle();
          emailCheck = {
            email: emailQuery,
            found: true,
            id: match.id,
            providers,
            createdAt: match.created_at,
            emailConfirmedAt: match.email_confirmed_at,
            hasProfile: Boolean(profile),
            note: providers.includes('google')
              ? 'Google identity zaten bağlı — exchange hatası credential/redirect kaynaklı.'
              : 'E-posta var ama Google bağlı değil. Manual linking kapalıysa OAuth reddedilebilir.',
          };
        }
      }
    } catch (e) {
      emailCheck = {
        email: emailQuery,
        found: false,
        note: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return NextResponse.json({
    ok: !oauthError && Boolean(oauthUrl),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || null,
      resolveSiteUrl: siteUrl,
      requestOrigin: origin,
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    expected: {
      googleAuthorizedRedirectUri: googleCallback,
      supabaseRedirectAllowListEntry: redirectTo,
      googleClientIdFromAuthorize: googleClientId,
      note: 'Google Cloud must list googleAuthorizedRedirectUri only — not the app /auth/callback.',
    },
    signInWithOAuth: {
      redirectTo,
      oauthError,
      authorizeHost: oauthUrl ? new URL(oauthUrl).origin : null,
      authorizeParams,
    },
    emailCheck,
    checklist: [
      'Google OAuth client type = Web application',
      `Google Authorized redirect URIs = ${googleCallback}`,
      googleClientId
        ? `Supabase Client ID must match: ${googleClientId}`
        : 'Supabase Providers → Google: Client ID + Secret kaydet',
      'Client Secret: Google’da yeniden oluştur → Supabase’e yapıştır → Save',
      `Supabase Redirect URLs includes ${redirectTo} and ${origin}/**`,
      'After Save, hard-refresh login and try again (incognito)',
    ],
  });
}
