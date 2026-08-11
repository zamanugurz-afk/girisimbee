'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/features/authentication/validation/auth.schema';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleOnly, setGoogleOnly] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    setSubmitting(true);
    setGoogleOnly(false);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        data?: { message?: string };
      };

      if (!res.ok) {
        if (json.code === 'google_only_account') {
          setGoogleOnly(true);
        }
        toast.error(json.error ?? 'Şifre sıfırlama isteği gönderilemedi');
        return;
      }

      setSent(true);
      toast.success(json.data?.message ?? 'Şifre sıfırlama bağlantısı gönderildi');
    } catch {
      toast.error('Bağlantı kurulamadı. Sayfayı yenileyip tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  }

  if (googleOnly) {
    return (
      <div className="space-y-4 rounded-lg border border-border/80 bg-[#F8FAFC] p-4 text-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-foreground">
          Bu hesap Google ile oluşturulmuş. E-posta ile şifre sıfırlama yerine Google ile giriş
          yapın.
        </p>
        <Button asChild className="w-full rounded-lg">
          <Link href={AUTH_ROUTES.login}>Google ile girişe dön</Link>
        </Button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="space-y-3 rounded-lg border border-border/80 bg-[#F8FAFC] p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        <p>
          E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu ve spam
          klasörünü kontrol edin. Bağlantıya tıkladıktan sonra yeni şifrenizi belirleyebilirsiniz.
        </p>
        <p>
          Mail gelmezse birkaç dakika bekleyip tekrar deneyin veya{' '}
          <Link href={AUTH_ROUTES.login} className="font-medium text-primary underline">
            Google ile giriş
          </Link>{' '}
          kullanın.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
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
        <Button
          type="submit"
          className="w-full rounded-lg bg-primary dark:bg-white dark:text-primary-foreground"
          disabled={submitting}
        >
          {submitting ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
        </Button>
      </form>
    </Form>
  );
}
