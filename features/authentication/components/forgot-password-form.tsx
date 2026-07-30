'use client';

import { useState } from 'react';
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
import { useAuth } from '@/features/authentication/hooks/use-auth';

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    setSubmitting(true);
    const { error } = await resetPassword(values.email);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    setSent(true);
    toast.success('Şifre sıfırlama bağlantısı gönderildi');
  }

  if (sent) {
    return (
      <p className="rounded-lg border border-border/80 bg-[#F8FAFC] p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.
      </p>
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
