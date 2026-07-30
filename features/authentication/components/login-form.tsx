'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const authError = searchParams.get('error');

  useEffect(() => {
    if (authError === 'auth_callback_failed') {
      toast.error('E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş. Tekrar deneyin.');
    }
  }, [authError]);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginSchema) {
    setSubmitting(true);
    const { error } = await signIn(values);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Giriş başarılı');
    const next = searchParams.get('next') ?? AUTH_ROUTES.dashboard;
    router.push(next);
  }

  return (
    <Form {...form}>
      {authError === 'auth_callback_failed' && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Doğrulama bağlantısı çalışmadı. Giriş yapın veya kayıt sırasında e-postayı yeniden gönderin.
        </div>
      )}
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
