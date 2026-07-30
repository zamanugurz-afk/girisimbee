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
import { registerSchema, type RegisterSchema } from '@/features/authentication/validation/auth.schema';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: RegisterSchema) {
    setSubmitting(true);
    const { error, needsVerification } = await signUp({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (needsVerification) {
      toast.success('Doğrulama e-postası gönderildi');
      router.push(`${AUTH_ROUTES.verifyEmail}?email=${encodeURIComponent(values.email)}`);
      return;
    }

    toast.success('Hesap oluşturuldu');
    router.push(AUTH_ROUTES.dashboard);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Adınız Soyadınız" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>Şifre</FormLabel>
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
          {submitting ? 'Kayıt olunuyor…' : 'Hesap Oluştur'}
        </Button>
      </form>
    </Form>
  );
}
