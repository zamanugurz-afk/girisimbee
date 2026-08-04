'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { newPasswordSchema, type NewPasswordSchema } from '@/features/authentication/validation/auth.schema';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { createClient } from '@/lib/supabase/client';

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  const form = useForm<NewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSessionReady(Boolean(data.session));
    }

    void checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(values: NewPasswordSchema) {
    if (!sessionReady) {
      toast.error('Şifre sıfırlama oturumu bulunamadı. Lütfen e-postadaki bağlantıyı yeniden kullanın.');
      return;
    }

    setSubmitting(true);
    const { error } = await resetPassword(values.password);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Şifreniz güncellendi');
    router.push(AUTH_ROUTES.login);
    router.refresh();
  }

  if (sessionReady === null) {
    return <p className="text-sm text-muted-foreground">Oturum kontrol ediliyor…</p>;
  }

  if (!sessionReady) {
    return (
      <div className="space-y-4 rounded-xl border border-border/70 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin.
        </p>
        <Button asChild className="w-full">
          <Link href={AUTH_ROUTES.forgotPassword}>Yeni sıfırlama bağlantısı</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yeni Şifre</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre Tekrar</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
          {submitting ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
        </Button>
      </form>
    </Form>
  );
}
