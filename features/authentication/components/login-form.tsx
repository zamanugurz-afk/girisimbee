'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { loginSchema, type LoginSchema } from '@/features/authentication/validation/user.schema';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { AuthLink } from '@/features/authentication/components/auth-layout';
import {
  AuthSocialDivider,
  GoogleOAuthButton,
} from '@/features/authentication/components/google-oauth-button';

export function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const authError = searchParams.get('error');
  const authMessage = searchParams.get('message');

  useEffect(() => {
    if (searchParams.get('password_updated') === '1') {
      toast.success('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');
    }
    if (authError === 'auth_callback_failed') {
      const msg = authMessage || 'Giriş bağlantısı geçersiz veya süresi dolmuş. Tekrar deneyin.';
      if (/pkce code verifier not found/i.test(msg)) {
        toast.error(
          'Google oturumu bu tarayıcıda tamamlanamadı. Çerezleri temizleyip Google ile girişi yeniden deneyin.',
        );
      } else if (/exchange external code/i.test(msg)) {
        toast.error(
          'Google bağlantısı başarısız. Supabase Client ID/Secret ve Google Redirect URI ayarlarını kontrol edin.',
        );
      } else {
        toast.error(msg);
      }
    } else if (authError === 'oauth_bootstrap') {
      toast.error(authMessage || 'Google hesabı bağlandı fakat profil oluşturulamadı.');
    } else if (authError === 'oauth_provider') {
      toast.error(authMessage || 'Google girişi iptal edildi veya başarısız oldu.');
    }
  }, [authError, authMessage, searchParams]);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginSchema) {
    setSubmitting(true);
    try {
      // Prefer server login so sb-* cookies are Set-Cookie'd on the response.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        credentials: 'same-origin',
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        // Fallback to client login if the API route is unavailable.
        if (res.status >= 500) {
          const { error } = await login(values);
          if (error) {
            toast.error(error);
            return;
          }
        } else {
          toast.error(body.error ?? 'Giriş başarısız');
          return;
        }
      }

      toast.success('Giriş başarılı');
      const next = searchParams.get('next') ?? AUTH_ROUTES.home;
      window.location.assign(next);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      {(authError === 'auth_callback_failed'
        || authError === 'oauth_bootstrap'
        || authError === 'oauth_provider') && (
        <div className="mb-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <p>
            {authMessage && /pkce code verifier not found/i.test(authMessage)
              ? 'Google oturumu bu tarayıcıda tamamlanamadı. Çerezleri temizleyip Google ile girişi yeniden deneyin.'
              : authMessage
                || (authError === 'oauth_bootstrap'
                  ? 'Google oturumu açıldı ancak profil oluşturulamadı. Tekrar deneyin veya e-posta ile giriş yapın.'
                  : 'Giriş tamamlanamadı. Tekrar deneyin veya e-posta ile giriş yapın.')}
          </p>
          <p className="text-xs text-muted-foreground">
            Daha önce e-posta ile kayıt olduysan Google ayrı hesap açmaz — şifrenle giriş yap
            veya “Şifremi unuttum” kullan. Google ayarı:{' '}
            <AuthLink href="/auth/google-setup">kurulum kontrolü</AuthLink>
          </p>
        </div>
      )}
      <GoogleOAuthButton
        label="Google ile giriş yap"
        next={searchParams.get('next') ?? AUTH_ROUTES.home}
      />
      <AuthSocialDivider />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="ornek@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Şifre</FormLabel>
                <AuthLink href={AUTH_ROUTES.forgotPassword}>Şifremi unuttum</AuthLink>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full rounded-lg bg-primary dark:bg-white dark:text-primary-foreground"
          disabled={submitting}
        >
          {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </Button>
      </form>
    </Form>
  );
}
