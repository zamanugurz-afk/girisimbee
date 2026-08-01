'use client';

import { useState } from 'react';
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

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<NewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: NewPasswordSchema) {
    setSubmitting(true);
    const { error } = await resetPassword(values.password);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Şifreniz güncellendi');
    router.push(AUTH_ROUTES.dashboard);
    router.refresh();
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
