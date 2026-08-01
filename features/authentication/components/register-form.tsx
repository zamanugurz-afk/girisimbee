'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';

export function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptKvkk: false,
      acceptPrivacy: false,
      acceptCookies: false,
      consentCommercial: false,
      consentSms: false,
      consentEmail: false,
    },
  });

  async function onSubmit(values: RegisterSchema) {
    setSubmitting(true);
    const displayName = `${values.firstName} ${values.lastName}`.trim();
    const { error, needsVerification } = await signUp({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      phone: values.phone,
      displayName,
      consents: {
        acceptTerms: values.acceptTerms,
        acceptKvkk: values.acceptKvkk,
        acceptPrivacy: values.acceptPrivacy,
        acceptCookies: values.acceptCookies,
        consentCommercial: values.consentCommercial,
        consentSms: values.consentSms,
        consentEmail: values.consentEmail,
      },
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" placeholder="Adınız" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyad</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" placeholder="Soyadınız" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı adı</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="ornek-kullanici"
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon numarası</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="05xxxxxxxxx"
                  {...field}
                />
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
              <FormLabel>E-posta adresi</FormLabel>
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
              <FormLabel>Şifre tekrarı</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-4">
          <p className="text-sm font-medium text-foreground">Zorunlu onaylar</p>
          <ConsentField
            control={form.control}
            name="acceptTerms"
            label={
              <>
                <LegalDocLink href={LEGAL_ROUTES.terms}>Kullanıcı sözleşmesi</LegalDocLink>
                ni okudum ve kabul ediyorum.
              </>
            }
          />
          <ConsentField
            control={form.control}
            name="acceptKvkk"
            label={
              <>
                <LegalDocLink href={LEGAL_ROUTES.kvkk}>KVKK aydınlatma metni</LegalDocLink>
                ni okudum ve anladım.
              </>
            }
          />
          <ConsentField
            control={form.control}
            name="acceptPrivacy"
            label={
              <>
                <LegalDocLink href={LEGAL_ROUTES.privacy}>Gizlilik politikası</LegalDocLink>
                nı kabul ediyorum.
              </>
            }
          />
          <ConsentField
            control={form.control}
            name="acceptCookies"
            label={
              <>
                <LegalDocLink href={LEGAL_ROUTES.cookies}>Çerez politikası</LegalDocLink>
                nı kabul ediyorum.
              </>
            }
          />
        </div>

        <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-4">
          <p className="text-sm font-medium text-foreground">İsteğe bağlı onaylar</p>
          <ConsentField
            control={form.control}
            name="consentCommercial"
            label="Ticari elektronik ileti izni veriyorum."
          />
          <ConsentField
            control={form.control}
            name="consentSms"
            label="SMS ile bilgilendirme izni veriyorum."
          />
          <ConsentField
            control={form.control}
            name="consentEmail"
            label="E-posta ile bilgilendirme izni veriyorum."
          />
        </div>

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

function LegalDocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

type ConsentName =
  | 'acceptTerms'
  | 'acceptKvkk'
  | 'acceptPrivacy'
  | 'acceptCookies'
  | 'consentCommercial'
  | 'consentSms'
  | 'consentEmail';

function ConsentField({
  control,
  name,
  label,
}: {
  control: Control<RegisterSchema>;
  name: ConsentName;
  label: ReactNode;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start gap-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal leading-snug text-foreground">
              {label}
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
